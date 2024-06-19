import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LotSearchService } from '../../services/lot-search.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiESaleyardService, MessageService } from '@app/core';
import { LotFeesChargesComponent } from '../lot-fees-charges/lot-fees-charges.component';
import { ToastrService } from 'ngx-toastr';
import { LotService } from '../../services/lot.service';
import { ActivatedRoute } from '@angular/router';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-lot-information',
  templateUrl: './lot-information.component.html',
  styleUrls: ['./lot-information.component.scss']
})
export class LotInformationComponent implements OnInit {

  @Input() transactionIds: any = [];
  @Input() selectedLots = [];
  @Input() saleId: string;
  @Input() processName: string;
  @Input() stage: string;
  @Input() isShowVendorCommission: boolean;

  @ViewChild(LotFeesChargesComponent)
  private lotFeesChargesGrid: LotFeesChargesComponent;

  lotDetailForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder,
              private lotSearchService: LotSearchService,
              public activeModal: NgbActiveModal,
              private toastrService: ToastrService,
              private apiESaleyardService: ApiESaleyardService,
              private lotService: LotService,
              private route: ActivatedRoute,
              private msg: MessageService,
              private userDetail: UserDetail) { }

  ngOnInit() {
    this.lotDetailForm = this.fb.group({
      DMOLot_LInfo_Description: ['']
    });
  }

  async saveLotFeesCharges() {
    const bodyData: any = {
      TransactionID: this.transactionIds.join(','),
      ByBulkChange: true,
      Items: [...this.lotFeesChargesGrid.data]
    };
    if (bodyData && bodyData.Items) {
      bodyData.Items.map(x => {
        x.ThirdPartyAccount = x.ThirdPartyAccount.indexOf('-') > 0 ? x.ThirdPartyAccount.split('-')[1] : x.ThirdPartyAccount;
        x.ThirdPartyCompanyCode = x.ThirdPartyAccount.indexOf('-') > 0 ? x.ThirdPartyAccount.split('-')[0] : x.ThirdPartyCompanyCode;
      });
    }
    if (this.lotFeesChargesGrid.data.length > 0) {
      const result = await this.apiESaleyardService.post('crmlot/saveLotFeesCharges', bodyData).toPromise();
      if (result === true) {
        const calcData = {
          SaleTransactionID: this.saleId,
          LotTransactionID: this.transactionIds.join(',')
        };
       // await this.lotService.calculateFeeAndCharges(calcData).toPromise();
       const isLotFeeChanges = this.lotFeesChargesGrid.data.filter((row) => row.ChargedTo === 'Buyer' && row.IsNew == true).length > 0;
        if (this.stage === 'Invoiced' && isLotFeeChanges == true) {
          this.selectedLots.forEach(async x => {
            if (x.dmolotbinfobuyerid) {
              await this.lotService.AddChangesLot({ LotTransactionID: x.TRNSCTNID, BuyerId: x.dmolotbinfobuyerid, NewBuyerId:x.dmolotbinfobuyerid  }).toPromise();
            }
          });
        }
      }
      this.lotFeesChargesGrid.newRow = { ...this.lotFeesChargesGrid.newFeesCharges };
    }
  }


  get f() { return this.lotDetailForm.controls; }

  onSubmit() {
    if (this.lotFeesChargesGrid.newRow.FeeTransactionID !== null) {
      this.msg.showMessage('Warning', {body: 'Please save grid item data before updating lot information'});
      // this.msg.showErrorMessage('Please save grid item data before update lot information.', 'Error', 'Ok',
      // null, false, true, false, '');
      return ;
    }
    this.submitted = true;
    if (this.lotDetailForm.invalid) {
      return;
    }
    this.msg.showMessage('Success', { body: 'Changes at this level may affect multiple fields in the Sale. Are you sure you want to continue?', btnText: 'Yes', cancelBtnText: 'No', header: ' ', cancelBtn: true, isConfirmation: true })
        .result
        .then(async result => {
          if (result) {
            await this.saveLotFeesCharges();

            const des = this.lotDetailForm.get('DMOLot_LInfo_Description').value;
            if (des && des.length > 0) {
              const submitData: any = {
                description: des,
                processName: this.processName,
                LotTransactionId: this.transactionIds,
                ModfBy: this.userDetail.UserID.toString()
              };
              this.lotSearchService.BulkUpdateVenderInformation(submitData).subscribe(data => {
                this.toastrService.success('Data saved successfully');
                this.activeModal.close(true);
              });
            } else {
              this.toastrService.success('Data saved successfully');
              this.activeModal.close(true);
              return;
            }
          }
        });
  }

}
