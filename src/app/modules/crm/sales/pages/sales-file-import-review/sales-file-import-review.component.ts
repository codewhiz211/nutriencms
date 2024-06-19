import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UpdateAliasDataModalComponent } from '../../components/update-alias-data-modal/update-alias-data-modal.component';
import { SalesService } from '../../services/sales.service';
import { AuthenticationService, ApplicationService, ColumnFilterService } from '@app/core';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { Router, ActivatedRoute } from '@angular/router';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-sales-file-import-review',
  templateUrl: './sales-file-import-review.component.html',
  styleUrls: ['./sales-file-import-review.component.scss']
})
export class SalesFileImportReviewComponent implements OnInit, OnDestroy {

  msgList = [];
  currentUser: any;
  dataSource: any;
  EditColumnList: string[];
  submitData: any;
  itemsCount: number;
  TotalDetails: any;
  transactionId: any;
  pageNum: any;
  processName: any;
  errorMsg: any;
  file: any;
  isAllRecords = true;
  UpdatePic = true;
  filters: any = {};

  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'ID',
            displayName: 'ID',
            width: '4%'
          },
          {
            objectKey: 'Lot_Number',
            displayName: 'Lot No.',
            width: '4%',
          }, {
            objectKey: 'BreedAlias',
            displayName: 'Breed Alias',
            width: '5%'
          }, {
            objectKey: 'Breed',
            displayName: 'Breed',
            width: '5%'
          }, {
            objectKey: 'ProductAlias',
            displayName: 'Product Alias',
            width: '5%',
            dataType: 'TextWithColor',
            Color: 'Red',
            CompareColumn: 'Product',
            Condition: 'equal',
            CompareValue: ''
          }, {
            objectKey: 'Product',
            displayName: 'Product',
            width: '5%'
          }, {
            objectKey: 'Weight',
            displayName: 'Weight',
            width: '5%'
          }, 
          {
            objectKey: 'Quantity',
            displayName: 'Qty',
            width: '5%'
          },
          {
            objectKey: 'Turnover',
            displayName: 'Turnover',
            width: '5%'
          },
          {
            objectKey: 'CKG',
            displayName: 'C/KG',
            width: '5%'
          }, {
            objectKey: 'DKG',
            displayName: '$/Head',
            width: '5%'
          },
          {
            objectKey: 'VendorAlias',
            displayName: 'Vendor Alias',
            width: '5%',
            dataType: 'TextWithColor',
            Color: 'Red',
            CompareColumn: 'Vendor',
            Condition: 'equal',
            CompareValue: ''
          }, {
            objectKey: 'Vendor',
            displayName: 'Vendor',
            width: '5%'
          }, {
            objectKey: 'BuyerAlias',
            displayName: 'Buyer Alias',
            width: '5%',
            dataType: 'TextWithColor',
            Color: 'Red',
            CompareColumn: 'Buyer',
            Condition: 'equal',
            CompareValue: ''
          }, {
            objectKey: 'Buyer',
            displayName: 'Buyer',
            width: '5%'
          }, {
            objectKey: 'Vendor_PIC',
            displayName: 'Vendor PIC',
            width: '5%'
          },
          {
            objectKey: 'AccSaleRef',
            displayName: 'Acct Sale Ref',
            width: '5%'
          }, {
             objectKey: 'Paintmark',
             displayName: 'Paintmark',
             width: '5%'
           }, {
             objectKey: 'Buyer_PIC',
             displayName: 'Buyer PIC',
             width: '5%'
           }, {
            objectKey: 'InvoiceRef',
            displayName: 'Invoice Reference',
            width: '5%'
          }, {
            objectKey: 'CarrierSap',
            displayName: 'Product Description',
            width: '4%'
          }, {
            objectKey: 'Status',
            displayName: 'Status',
            width: '4%',
            dataType: 'ColorCodeStatus',
            Color: 'Red',
            CompareColumn: 'Status',
            Condition: 'equal',
            CompareValue: '0'
          }
        ],
        action: {
          Edit: true,
          Save: true,
          Cancel: true,
          Delete: false,
          Checkbox: false,
          Placement: 'IsExternalShow',
          DropDown: false
        },
        columnFilter: []
      },
      paging: true
    }
  };

  bodyData = {
    PageSize: 10,
    PageNumber: 1,
    SortColumn: '-1',
    SortOrder: 'desc',
    GridFilters: []
  };

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private salesService: SalesService,
    private authenticationService: AuthenticationService,
    private appservice: ApplicationService,
    private route: ActivatedRoute,
    private router: Router,
    private columnFilter: ColumnFilterService,
    private userDetail: UserDetail
  ) { }

  ngOnInit() {
    if (!sessionStorage.getItem('currentSaleYardName')) {
      sessionStorage.setItem('currentSaleYardName', this.salesService.currentSaleYardName);
    } else {
      this.salesService.currentSaleYardName = sessionStorage.getItem('currentSaleYardName');
    }
    if (!sessionStorage.getItem('submitDataForCreateSale')) {
      if (this.salesService.submitDataForCreateSale) {
        sessionStorage.setItem('submitDataForCreateSale', JSON.stringify(this.salesService.submitDataForCreateSale));
      }
    } else {
      this.salesService.submitDataForCreateSale = JSON.parse(sessionStorage.getItem('submitDataForCreateSale'));
    }
    this.currentUser = this.userDetail;
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('id');
    });

    this.bindLotData(this.bodyData, true, false);
    this.EditColumnList = ['BreedAlias', 'ProductAlias', 'VendorAlias', 'BuyerAlias', 'Quantity', 'Weight',
                            'Turnover', 'Vendor_PIC', 'Paintmark', 'Buyer_PIC', 'InvoiceRef', 'CarrierSap'];
  }

  private bindLotData(bodyData: any, isOnValidate: boolean, isErrorRecords: boolean) {
    this.salesService.GetImportLotData(this.currentUser.UserName, isOnValidate ? '1' : '0', isErrorRecords ? '1' : '0', bodyData)
      .subscribe(x => {
        x.ContentList.map(x => {
          x.Weight = x.Weight === '0.00' ? '0' : x.Weight;
        });
        this.dataSource = x.ContentList;
        this.itemsCount = x.RecordsCount;
        this.TotalDetails = x.TotalDetails;
        if (isOnValidate) {
          this.msgList = x.ListMessages;
        }
      }, err => {
          console.log(err);
      });
  }

  get_all_records() {
    this.isAllRecords=true;
    this.bindLotData(this.bodyData, false, false);
  
  }

  get_error_records() {
    this.isAllRecords=false;
    this.bindLotData(this.bodyData, false, true);
  }

  open_alias_data_modal() {
    const modalRef = this.modalService.open(UpdateAliasDataModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
    const modalInstance: UpdateAliasDataModalComponent = modalRef.componentInstance;
    modalRef.result.then(async (result) => {
      if (result) {
      }
      }, (reason) => {
      }
    );
  }

  go_back() {
    // this.showErrorMessage('Are you sure you want to go back?', 'Warrning', 'Yes',
    //   this.redirectionConfirmation, false, true, true, 'would you like to proceed?');
    this.salesService.DeleteLotimport(this.currentUser.UserName, this.salesService.currentSaleYardName).subscribe(x => {
      this.location.back();
    });

  }

  Validate_records() {
    // this.salesService.ValidateImportLotData(this.currentUser.UserName).subscribe(x => {

    //   if (x.ListMessages.length > 0) {
    //     this.msgList = x.ListMessages;
    //   }
    //   this.bindLotData(this.bodyData, false, false);
    // },
    //   err => {
    //     console.log(err);
    //   });
    this.bindLotData(this.bodyData, true, false);
  }

  actionClick(event) {    
    switch (event.action) {  
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        let filter: any = {};
        filter = {
          GridConditions: [],
          DataField: event.colData.objectKey,
          LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
          FilterType: 'Column_Filter'
        };
        if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
          filter.GridConditions.push({
            Condition: event.filterData.ConditionOpt1.Value,
            ConditionValue: event.filterData.filterValue1
          });
        }
        if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
          filter.GridConditions.push({
            Condition: event.filterData.ConditionOpt2.Value,
            ConditionValue: event.filterData.filterValue2
          });
        }
        if (filter && Object.keys(filter).length !== 0) {
          this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
        }
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
        case 'asc':
          this.bodyData.SortColumn = event.colData.objectKey;
          this.bodyData.SortOrder = 'asc';
          this.generateFilter();
          break;
        case 'desc':
          this.bodyData.SortColumn = event.colData.objectKey;
          this.bodyData.SortOrder = 'desc';
          this.generateFilter();
          break;
        case 'Remove Sort':
          this.bodyData.SortColumn = '-1';
          this.bodyData.SortOrder = 'desc';
          this.generateFilter();
          break;
        case 'FilterClear_Click':
          delete this.filters['Column_Filter~$~' + event.colData.objectKey];
          this.generateFilter();
          event.ColumnFilterDropdown.close();
          break;
      case 'Save':
        let IdentifierID = this.dataSource[event.rowIndex].ID;
        let breedAlias = this.dataSource[event.rowIndex].BreedAlias;
        let productAlias = this.dataSource[event.rowIndex].ProductAlias;
        let vendorAlias = this.dataSource[event.rowIndex].VendorAlias;
        let buyerAlias = this.dataSource[event.rowIndex].BuyerAlias;

        let qty = this.dataSource[event.rowIndex].Quantity;
        let width = this.dataSource[event.rowIndex].Weight;        
        let price = this.dataSource[event.rowIndex].Price;
        let turnover = this.dataSource[event.rowIndex].Turnover;
        let vendor_PIC = this.dataSource[event.rowIndex].Vendor_PIC;        
        let paintmark = this.dataSource[event.rowIndex].Paintmark;
        let buyer_PIC = this.dataSource[event.rowIndex].Buyer_PIC;        
        let invoiceRef = this.dataSource[event.rowIndex].InvoiceRef;
        let carrierSap = this.dataSource[event.rowIndex].CarrierSap;        

        this.submitData = {
          ID: IdentifierID,
          BreedAlias: breedAlias,
          ProductAlias: productAlias,
          VendorAlias: vendorAlias,
          BuyerAlias: buyerAlias,
          Quantity: qty,
          Weight: width,          
          Price: price,
          Turnover: turnover,
          Vendor_PIC: vendor_PIC,          
          Paintmark: paintmark,
          Buyer_PIC: buyer_PIC,          
          InvoiceRef: invoiceRef,
          CarrierSap: carrierSap,
          SaleTransactionId: this.transactionId
        };
        
        this.salesService.SaveImportLotData(this.currentUser.UserName, this.submitData).subscribe(res => {
          if(res){
            this.bindLotData(this.bodyData, false, false);
          }
        }, err=>{
          console.log(err);
        });
        
        break;
    }    
  }

  pageChange(event) {

    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.bindLotData(this.bodyData, false, false);
  }

  createSale() {
    const dataSource = this.salesService.submitDataForCreateSale;
    if (dataSource != null && dataSource.submitData != null) {
      const submitData = dataSource.submitData;
      this.processName = dataSource.submitData.ProcessName;
      const conjunctionalAgentsData = dataSource.conjunctionalAgentsData;
      this.file = dataSource.file;
      this.appservice.insertApplication(submitData).subscribe(async response => {
        this.transactionId = response.result.transactionId;
        if (conjunctionalAgentsData.length) {
          await this.saveConjunctionalAgent(conjunctionalAgentsData);
        }
        this.salesService.submitDataForCreateSale = null;
        this.salesService.CreateSalesLotTableData(this.currentUser.UserName, this.processName, this.transactionId, this.UpdatePic).subscribe(Result => {
          this.router.navigate(['/crm/sales', this.transactionId]);
        }, error => {
          console.log(error);
        });
      });
    }
  }

  async saveConjunctionalAgent(conjunctionlAgents: any) {
    try {
      for (const item of conjunctionlAgents) {
        if (item.agentid !== '' && item.agentid != null &&
          item.dmocrmconjagntrate !== '' && item.dmocrmconjagntrate != null) {
          const body = {
            SaleTransactionID: this.transactionId,
            AgentCode: item.agentid,
            Rate: item.dmocrmconjagntrate
          };
          await this.salesService.saveConjunctionalAgent(body).toPromise();
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  upload(processName: string, userId: string, saleyardName: string) {
    const file=this.file;
    if (file === null) {
      this.errorMsg = 'Please select file';
      return;
    }
    this.errorMsg = '';
    const formData = new FormData();
    formData.append('uploadFile', file);

    this.salesService.ImportFileData(processName, userId, saleyardName, formData).subscribe(Result => {
      if (Result.status === 'Success') {
        file === null;
      }
    }, error => { console.log(error); });
  }

  /* ---------------------Open Confirmation Popup-------------- */
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsDelete: boolean,
  //   IsDefaultView: boolean, IsConfirmation: boolean, confirmationText: string) {
  //   const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
  //   const modalInstance: MessageComponent = modalMsgRef.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.ButtonText = buttonText;
  //   modalInstance.MessageHeader = HeaderMsg;
  //   modalInstance.MessagePopup = modalMsgRef;
  //   modalInstance.IsConfirmation = IsConfirmation;
  //   modalInstance.CallBackMethod = callback;
  //   modalInstance.Caller = this;
  //   modalInstance.IsDelete = IsDelete;
  //   modalInstance.IsDefaultView = IsDefaultView;
  //   modalInstance.ConfirmationText = confirmationText;
  // }
  redirectionConfirmation(modelRef: NgbModalRef, Caller: SalesFileImportReviewComponent) {
    Caller.salesService.DeleteLotimport(Caller.currentUser.UserName, Caller.salesService.currentSaleYardName).subscribe(x => {
      Caller.location.back();
    });
  }
  ngOnDestroy() {
    sessionStorage.removeItem('currentSaleYardName');
    sessionStorage.removeItem('submitDataForCreateSale');
  }
  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
    } else {
      const key = Object.keys(item.colData)[0];
      this.HeaderMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }
  async generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    this.bindLotData(this.bodyData, false, !this.isAllRecords);
    //this.gridView.currentPage = 1;
  }
  removeFilter() {
    this.filters = {};
    this.generateFilter();
  }
  get hasFilter() {
    return Object.keys(this.filters).length > 0 ? true : false;
  }
}
