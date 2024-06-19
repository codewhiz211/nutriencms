import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiESaleyardService, ListviewService, SaleStage } from '@app/core';
import { MessageComponent } from '@app/shared';

@Component({
  selector: 'app-lot-fees-charges',
  templateUrl: './lot-fees-charges.component.html',
  styleUrls: ['./lot-fees-charges.component.scss']
})
export class LotFeesChargesComponent implements AfterViewInit {

  @Input() stage: SaleStage;
  @Output() calcLotFeesChargesManual = new EventEmitter<any>();
  @ViewChild('rateInput') rateInput: ElementRef;

  @Input() forBulkUpdate = false;
  @Input() transactionId: string;
  @Input() isShowVendorCommission = true;
  @Input() ChargedTo = '';
  feesChargesDDL = [];
  data = [];
  newFeesCharges = {
    FeeTransactionID: null,
    FeeCode: '',
    Description: '',
    ChargedTo: '',
    CalculationType: '',
    Rate: null,
    Cost: null,
    ThirdPartyAccount: '',
    ThirdPartyName: '',
    ReferenceText: '',
    DescriptionOverrideAllowed: 'Yes',
    BulkChangeAllowed: 'Yes',
    RateOverride: 'Yes',
    ValidFor3rdParty: 'Yes',
    IsManual: true,
    IsHidden: false,
    ConsequenceFeeID: '',
    ThirdPartyCompanyCode: '',
    InterCompany: '',
    IsNew: false,
  };
  newRow = {...this.newFeesCharges};
  rateChanged$: Subject<any> = new Subject<any>();
  vendorData = [];
  submitted = false;
  get isReversal() {
    return this.stage === SaleStage.ReversalProcess;
  }

  get isFinalised() {
    return this.stage === SaleStage.Finalised || this.stage === SaleStage.ReversalCompleted;
  }
  isInlineEdit = false;
  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private apiESaleyardService: ApiESaleyardService,
    private listviewService: ListviewService
  ) { }

  ngAfterViewInit() {
    if (this.forBulkUpdate) {
      this.apiESaleyardService.post(`crmlot/getLotFeesCharges?transactionID=${this.transactionId}&forBulkChange=true`).subscribe(data => {
        
        data.map(x=>{
          x.ThirdPartyAccount = x.ThirdPartyCompanyCode && x.ThirdPartyCompanyCode.length > 0 ? x.ThirdPartyCompanyCode +'-'+ x.ThirdPartyAccount : x.ThirdPartyAccount
        });
        this.data = data
      });
      this.apiESaleyardService.post('crmlot/getFeesCharges?bulkChangeAllowed=yes').subscribe((data) => {
        if (this.isShowVendorCommission == false && data) {
          this.feesChargesDDL = data.filter(x=> x.FeeCode != 'GrossCommission');
        } else {
          this.feesChargesDDL = data;
        }
      });
    } else {
      this.route.paramMap.subscribe(params => {
        this.transactionId = params.get('id');
        if (this.transactionId !== 'new') {
          this.apiESaleyardService.post(`crmlot/getLotFeesCharges?transactionID=${this.transactionId}`).subscribe(data => {
            data.map(x=>{
              x.ThirdPartyAccount = x.ThirdPartyCompanyCode && x.ThirdPartyCompanyCode.length > 0 ? x.ThirdPartyCompanyCode +'-'+ x.ThirdPartyAccount : x.ThirdPartyAccount
            });
            this.data = data;
          });
        }
      });
      this.apiESaleyardService.post('crmlot/getFeesCharges').subscribe(data => {
        this.feesChargesDDL = data;
      });
    }

    this.rateChanged$
      .pipe(
        debounceTime(500)
      ).subscribe((item: any) => {
        if (item.FeeTransactionID) {
          this.submitted = true;
          if (!this.forBulkUpdate) {
            this.calcManualFeesCharges(item);
          }
        }
      });
  }

  calcManualFeesCharges(item: any) {
    this.calcLotFeesChargesManual.emit({
      FeeTransactionID: item.FeeTransactionID,
      Rate: item.Rate,
      CalculationType: item.CalculationType,
      ConsequenceFeeID: item.ConsequenceFeeID,
      LotTransactionID:item.LotTransactionID,
      Description: item.Description
    });
  }
  
  feeChargesSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term === '' ? []
        : this.feesChargesDDL
        
        // .map(item =>({Description:item.Description,FeeCode: item.FeeCode}))
          .filter(v => v.Description.toLowerCase().indexOf(term.toLowerCase()) > -1 && (this.ChargedTo == '' || v.ChargedTo != (this.ChargedTo == 'vendor' ? 'Buyer': 'Vendor')))
          .filter(item => this.data.findIndex(x=>x.FeeCode === item.FeeCode && x.IsDeleted !== true) === -1))
    )

    formatter = (x: {Description: string}) => x.Description;

  setLotFeesChargesOption(event: NgbTypeaheadSelectItemEvent, row: any, isNew: boolean, index?: number) { 
    row.IsManual = true;
    if (isNew) {
      row.FeeTransactionID = event.item.FeeTransactionID;
      row.FeeCode = event.item.FeeCode;
      row.Description = event.item.Description;
      row.InterCompany = event.item.InterCompany;
      row.IsNew = true;
      if (this.forBulkUpdate) {
        Object.assign(row, event.item);
      } else {
        this.calcManualFeesCharges(row);
      }
    } else {
      // create a new row and delete existing row
      const newRow: any = JSON.parse(JSON.stringify(row));
      newRow.FeeTransactionID = event.item.FeeTransactionID;
      newRow.FeeCode = event.item.FeeCode;
      newRow.Description = event.item.Description;
      newRow.InterCompany = event.item.InterCompany;
      newRow.IsManual=true;
      newRow.IsNew = true;
      this.data.splice(index, 0, newRow);

      row.IsDeleted = true;
    }
    // for (const item of this.feesChargesDDL) {
    //   if (item.FeeCode === event.item.FeeCode) {
        
    //     return;
    //   }
    // }
  }

  delete_item(item: any) {
    const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    modalInstance.MessagePopup = modalMsgRef;
    modalInstance.IsConfirmation = true;
    modalInstance.Caller = this;
    modalInstance.MessageHeader = 'Confirmation Message';
    modalInstance.Message = 'Are you sure you want to delete this record?';
    modalInstance.ButtonText = 'Yes';
    modalInstance.IsDefaultView = true;
    modalInstance.CallBackMethod = () => {
      item.IsDeleted = true;
      item.IsManual = true;
    };
  }

  save_new_item() {
    // Changes CRM #1666 - Biresh
    // if (this.newRow.Rate == null || parseFloat(this.newRow.Rate) === 0) {
    //   this.submitted = true;
    // } else {
      if (this.newRow.FeeCode === 'GrossCommission') {
        this.newRow.RateOverride = 'Yes';
      } 
      if (typeof this.newRow.Description === 'object') {
        this.newRow.Description = this.newRow.Description['Description'];
      }
      this.data.push(this.newRow);
      this.newRow = { ...this.newFeesCharges };
      this.submitted = false;
   // }
  }

  discard_new_item() {
    this.newRow = { ...this.newFeesCharges };
  }

  rateChanged(item: any) {
    this.rateChanged$.next(item);
  }

  public onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }

  getVendorData(term: any, column: string) {
    let cmpCode = '';
    if(column == 'dmocustmstrsapno' && term.indexOf('-') > 0){
      const ar = term.split('-');
      cmpCode = ar[0];
      term = ar[1];
    }
    const queryVendorBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: column,
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRCustomer',
      TimeZone: 0,
      ColumnList: 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrcompcode,dmocustmstrcompcode',
      ViewName: 'View 1',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: 'Vendor'
            }
          ],
          DataField: 'dmocustmstrcusttype',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },{
          GridConditions: [
            { Condition: "CONTAINS", ConditionValue: "Active" }
          ],
          DataField: "Active",
          LogicalOperator: "Or",
          FilterType: "State_Filter"
        }, {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: term
            }
          ],
          DataField: column,
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },{
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: 'Livestock'
            }
          ],
          DataField: 'dmocustmstracttype',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },
      ]
    };
    if(cmpCode && cmpCode != ''){
      queryVendorBody.GridFilters.push({
        GridConditions: [
          {
            Condition: 'CONTAINS',
            ConditionValue: cmpCode
          }
        ],
        DataField: 'dmocustmstrcompcode',
        LogicalOperator: 'Or',
        FilterType: 'Column_Filter'
      });
    }
    return this.listviewService.GridDatalmk(queryVendorBody);
  }

  selectVendor(event: NgbTypeaheadSelectItemEvent, row: any, field: string) {
    row.IsManual = true;
    const vendorSap = field == 'dmocustmstrsapno' && event.item && event.item.indexOf('-')>0 ? event.item.split('-')[1] : event.item;
    for (const vendor of this.vendorData) {
      if (vendor[field] === vendorSap) {
        row.ThirdPartyAccount = vendor.dmocustmstrsapno;
        row.ThirdPartyName = vendor.dmocustmstrcustname1;
        row.ThirdPartyCompanyCode = vendor.dmocustmstrcompcode_KEY;
        if(field == 'dmocustmstrcustname1'){
          row.ThirdPartyAccount = vendor.dmocustmstrcompcode_KEY +'-'+ vendor.dmocustmstrsapno;
        }
        return;
      }
    }
  }

  thirdPartyAccountSearch = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term =>
        term !== '' &&  term.length > 2
          ? this.getVendorData(term, 'dmocustmstrsapno')
            .pipe(
              tap((res: any) => this.vendorData = res.Data),
              map((res: any) => res.Data.map(item =>item.dmocustmstrcompcode_KEY +'-'+ item.dmocustmstrsapno))
            )
          : of([])
      )
    );
  }

  thirdPartyAccountNameSearch = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term =>
        term !== '' &&  term.length > 2
          ? this.getVendorData(term, 'dmocustmstrcustname1')
            .pipe(
              tap((res: any) => this.vendorData = res.Data),
              map((res: any) => res.Data.map(item => item.dmocustmstrcustname1))
            )
          : of([])
      )
    );
  }

}
