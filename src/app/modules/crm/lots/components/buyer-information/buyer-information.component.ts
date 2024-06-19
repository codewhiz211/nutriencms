import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LotSearchService } from '../../services/lot-search.service';
import { Observable } from 'rxjs';
import { NgbTypeaheadSelectItemEvent, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LotService } from '../../services/lot.service';
import { SalesService } from '../../../sales/services/sales.service';

import { MessageService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-buyer-information',
  templateUrl: './buyer-information.component.html',
  styleUrls: ['./buyer-information.component.scss']
})
export class BuyerInformationComponent implements OnInit {

  @Input() processName: string;
  @Input() transactionIds = [];
  @Input() selectedLots = [];
  @Input() stage: string;
  @Output() markTabDirty: EventEmitter<boolean> = new EventEmitter();

  lotDetailForm: FormGroup;
  submitted = false;
  buyerPic: any;
  isDdl = false;
  isAddNewTag = false;
  companyCode: string;
  private buyerValidators = [
    Validators.required
  ];
  formatter = (x: any) => x.dmobranchbrname;

  addPICTagFn = (term) => {
    if (term.length < 9) {
      this.isAddNewTag = true;
        return term;
    }
    this.isAddNewTag = false;
    this.toastrService.warning('The PIC number accepts a max of 8 characters.');
    return null;
  }
  ValidateVendorIdMessage: string;
  ValidateVendorNameMessage: string;
  ValidateBuyerIdMessage: string;
  ValidateBuyerNameMessage: string;
  ValidateProductNameMessage: string;
  ValidateProductDescriptionMessage: string;
  ValidateBreedMessage: string;
  ValidateBuyerBranchMessage: string;
  flag = false;
  constructor(
    private fb: FormBuilder,
    private lotSearchService: LotSearchService,
    private toastrService: ToastrService,
    public activeModal: NgbActiveModal,
    private lotService: LotService,
    private salesService: SalesService,
    private msg: MessageService,
    private userDetail: UserDetail) { }

  ngOnInit() {
    this.lotDetailForm = this.fb.group({
      DMOLot_BInfo_BuyerId: [''],
      DMOLot_BInfo_BuyerName: [''],
      DMOLot_BInfo_BuyerBrc: [''],
      DMOLot_BInfo_BuyerPic: [null],
      DMOLot_BInfo_InvoiceRef: [null],
      DMOLot_BInfo_Rate: [null, [Validators.min(0), Validators.max(100)]],
    });

    this.lotDetailForm.valueChanges.subscribe(data => {
      this.markTabDirty.emit(true);
    });
  }
  buyerIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerIdSearch(text$);
  }
  buyerNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerNameSearch(text$);
  }
  vendorPICSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorPicSearch(text$);
  }
  branchSearch = (text$: Observable<string>) => {
    return this.lotSearchService.branchSearch(text$);
  }

  checkValue(event, dmo) {
    if (event.target.value === '') {
      if (dmo === 'dmolotbinfobuyerpic') {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').patchValue('');
      } else {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerId').patchValue('');
        this.lotDetailForm.get('DMOLot_BInfo_BuyerName').patchValue('');
        this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue('');
      }
      if (this.lotDetailForm.get('DMOLot_BInfo_BuyerId').value === '') {
        this.isDdl = false;
      }
    }
  }



  selectBuyer(event: NgbTypeaheadSelectItemEvent, field: string) {
    const buyerSap = event.item && event.item.indexOf('-')>0 ? event.item.split('-')[1] : event.item;
    const buyer = this.lotSearchService.buyerData.find(x => x[field] === buyerSap);
    if (buyer) {
      this.lotDetailForm.get('DMOLot_BInfo_BuyerName').patchValue(buyer.dmocustmstrcustname1);
      this.lotDetailForm.get('DMOLot_BInfo_BuyerId').patchValue(buyer.dmocustmstrsapno);
      this.lotSearchService.buyerCompany = buyer.dmocustmstrcompcode_KEY;
      if (buyer.dmocustmstrlstkbranch && buyer.dmocustmstrlstkbranch.includes('(') > 0) {
        const brnch = buyer.dmocustmstrlstkbranch.split('(');
        this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue({ dmobranchbrname: brnch[0], dmobranchbrcode: brnch[1].replace(')', '') });
        const branchSapNumber = buyer.dmocustmstrlstkbranch_KEY;
        if (branchSapNumber) {
          this.lotSearchService.getBranchData(branchSapNumber, 'dmobranchbrcode', 'EQUAL').subscribe(x => {
            if (x && parseInt(x.RecordsCount) > 0) {
            } else {
              this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue('');
            }
          })
        }
      }
      if (field == 'dmocustmstrcustname1') {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerId').patchValue(buyer.dmocustmstrcompcode_KEY + '-' + buyer.dmocustmstrsapno);
      }
      else{
        this.lotDetailForm.get('DMOLot_BInfo_BuyerId').patchValue(buyer.dmocustmstrsapno);
      }
      this.companyCode = buyer.dmocustmstrcompcode;
      
      const bid = buyer.dmocustmstrsapno && buyer.dmocustmstrsapno.indexOf('-')>0 ? buyer.dmocustmstrsapno.split('-')[1] : buyer.dmocustmstrsapno;
      this.getBuyerPIC(bid);
    }
  }

  getBuyerPIC(buyerId: string) {
    this.lotSearchService.getBuyerPIC(buyerId).subscribe(response => {
      this.isDdl = true;
      this.buyerPic = response;
      this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').patchValue('');
      if (response && response.length === 1) {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').patchValue(response[0].dmocuspiccustpic);
      }
      this.isAddNewTag = false;
    });
  }

  get f() { return this.lotDetailForm.controls; }

  addValidation() {
    if (this.lotDetailForm.get('DMOLot_BInfo_BuyerId').value !== '' || this.lotDetailForm.get('DMOLot_BInfo_BuyerName').value !== '') {
      this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').setValidators(this.buyerValidators);
      this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').updateValueAndValidity();
      // this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').setValidators(this.buyerValidators);
      // this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').updateValueAndValidity();
    }
  }
  onSubmit() {
    this.addValidation();
    this.submitted = true;
    let ispassedProduct = false;
    this.selectedLots.forEach((x) => {
      if (this.lotService.VendorCartage.indexOf(x.dmolotlotinfopdct) > -1) {
        ispassedProduct = true;
      }
    });
    if (ispassedProduct) {
      this.msg.showMessage('Fail', { body: 'One or many of the lot(s) selected are passed in', header: ' ' });
      return;
    }
    if (this.salesService.isBuyerBranchRebateUpdatedOnSaleHeader && this.lotDetailForm.controls.DMOLot_BInfo_Rate.value) {
      this.msg.showMessage('Fail', {body: 'The Internal Buyer Branch Rebate has been modified at Sale Header level'});
      return;
    }
    if (this.lotDetailForm.invalid) {
      return;
    }

    const buyerInfo = ['BInfoBuyerId', 'BInfoBuyerName', 'BInfoBuyerBrc'];
    if (!this.isAddNewTag) {
      buyerInfo.push('BInfoBuyerPic');
    }
    var buyerBranchForValidate= this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value.dmobranchbrcode ==undefined ?this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value: this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value.dmobranchbrname+'('+
    this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value.dmobranchbrcode+')';
    const submitData: any = {
      BInfoBuyerId: this.lotDetailForm.controls.DMOLot_BInfo_BuyerId.value,
      BInfoBuyerName: this.lotDetailForm.controls.DMOLot_BInfo_BuyerName.value,
      BInfoBuyerBrc: this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value ?
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value.dmobranchbrcode+'~'+this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.value.dmobranchbrname : null,
      BInfoBuyerPic: this.lotDetailForm.controls.DMOLot_BInfo_BuyerPic.value ? this.lotDetailForm.controls.DMOLot_BInfo_BuyerPic.value.toString().toUpperCase(): this.lotDetailForm.controls.DMOLot_BInfo_BuyerPic.value,
      BInfoInvoiceRef: this.lotDetailForm.controls.DMOLot_BInfo_InvoiceRef.value,
      BInfo_Rate: this.lotDetailForm.controls.DMOLot_BInfo_Rate.value
    };
    submitData.BInfoBuyerId = submitData.BInfoBuyerId && submitData.BInfoBuyerId.indexOf('-')>0 ? submitData.BInfoBuyerId.split('-')[1] : submitData.BInfoBuyerId;
    let IsChangesLotUpdate = false;
    const keyGroup: string[] = [];

    Object.keys(submitData).forEach(key => {
      if (!!submitData[key] || submitData[key] == '0') {
        if (key == 'BInfoBuyerId' || key == 'BInfoBuyerName' || key == 'BInfoBuyerPic' || key == 'BInfoInvoiceRef') {
          IsChangesLotUpdate = true;
        }
        if (buyerInfo.includes(key) && !keyGroup.includes('buyerInfo')) {
          keyGroup.push('buyerInfo');
        }
        if (!buyerInfo.includes(key)) {
          keyGroup.push(key);
        }
      }
    });
    if (keyGroup.length > 1) {
      return this.msg.showMessage('Warning', { body: 'Multiple update instances detected. Please update a single value'});
    }

    if (keyGroup.length) {
      this.msg.showMessage('Success', { body: 'Changes at this level may affect multiple fields in the Sale. Are you sure you want to continue?', btnText: 'Yes', cancelBtnText: 'No', header: ' ', cancelBtn: true, isConfirmation: true })
        .result
        .then(async result => {
          if (result) {
            submitData.processName = this.processName;
            submitData.LotTransactionId = this.transactionIds;
            submitData.ModfBy = this.userDetail.UserID.toString();
            submitData.companyCode = this.companyCode;
            const validateLotData: any = {
              BuyerId: submitData.BInfoBuyerId,
              BuyerName: submitData.BInfoBuyerName,
              BuyerBranchName: buyerBranchForValidate,
            }
            if (validateLotData.BuyerId || validateLotData.BuyerName || validateLotData.BuyerBranchName) {
              const data = await this.lotSearchService.validateLotSummaryRecord(validateLotData).toPromise();
              this.flag = false;
              if (data[0].BuyerIdMessage === 'BuyerId is Not Exist' || submitData.BInfoBuyerId == undefined) {
                this.flag = true;
                this.ValidateBuyerIdMessage = 'Buyer Id is not exist';
              }
        
              if (data[0].BuyerNameMessage === 'Buyer name is Not Exist' || submitData.BInfoBuyerName == undefined) {
                this.flag = true;
                this.ValidateBuyerNameMessage = 'Buyer name is not exist';
              }
              if (data[0].BuyerBranchMessage === 'Buyer branch is Not Exist') {
                this.flag = true;
                this.ValidateBuyerBranchMessage = 'Buyer branch is not exist';
              }
              if (this.flag) {
                return false;
              }
            }
            // this.lotSearchService.validateLotSummaryRecord(validateLotData).subscribe(data => {
            //   this.flag = false;
            //   if (data[0].BuyerIdMessage === 'BuyerId is Not Exist' || submitData.BInfoBuyerId == undefined) {
            //     this.flag = true;
            //     this.ValidateBuyerIdMessage = 'Buyer Id is not exist';
            //   }
        
            //   if (data[0].BuyerNameMessage === 'Buyer name is Not Exist' || submitData.BInfoBuyerName == undefined) {
            //     this.flag = true;
            //     this.ValidateBuyerNameMessage = 'Buyer name is not exist';
            //   }
            //   if (data[0].BuyerBranchMessage === 'Buyer branch is Not Exist' || submitData.BInfoBuyerBrc == undefined) {
            //     this.flag = true;
            //     this.ValidateBuyerBranchMessage = 'Buyer branch is not exist';
            //   }
            //   if (this.flag) {
            //     return false;
            //   }
            this.lotSearchService.BulkUpdateBuyerInformation(submitData).subscribe(data => {
              this.updateStatus();
              if (this.stage === 'Invoiced' && IsChangesLotUpdate) {
                this.selectedLots.forEach(async x => {
                  let oldBuyer = x.dmolotbinfobuyerid;
                  let newBuyer = this.lotDetailForm.controls.DMOLot_BInfo_BuyerId.value;
                  // if (oldBuyer && newBuyer && newBuyer == oldBuyer) {
                  //   newBuyer = null;
                  // }
                  if (x.dmolotbinfobuyerid) {
                    await this.lotService.AddChangesLot({ LotTransactionID: x.TRNSCTNID, BuyerId: x.dmolotbinfobuyerid, NewBuyerId: newBuyer }).toPromise();
                  }
                });
                // this.selectedLots.filter(rows=> rows.dmolotbinfobuyerid !== submitData.BInfoBuyerId).forEach(async x => {
                //   if (submitData.BInfoBuyerId) {
                //     await this.lotService.AddChangesLot({ LotTransactionID: x.TRNSCTNID, BuyerId: submitData.BInfoBuyerId }).toPromise();
                //   }
                // });
              }
              this.toastrService.success('Data saved successfully');
              this.activeModal.close(true);
            });
         // });
          }
        });
    } else {
      return;
    }
  }
  async updateStatus() {
    const statusData = {
      TransactionID: this.transactionIds.join(',')
    };
    await this.lotService.changeLotStatus(statusData).toPromise();
  }
  selectBranch($event, guid) {
    if (guid == 'dmolotbinfobuyerbrc') {
      if ($event && $event.item) {
        let customerCompany = this.lotDetailForm.get('DMOLot_BInfo_BuyerId').value;
        customerCompany = customerCompany && customerCompany.indexOf('-') > 0 ? customerCompany.split('-')[0] : customerCompany;
        if (customerCompany && $event.item.dmobranchcompcode_KEY != customerCompany) {
          $event.preventDefault();
          const brnch = { dmobranchbrcode: '', dmobranchbrname: '' };
          this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue(brnch);
        }
      }
    } else {
      if ($event && $event.item) {
        let customerCompany = this.lotDetailForm.get('DMOLot_VInfo_VendorId').value;
        customerCompany = customerCompany && customerCompany.indexOf('-') > 0 ? customerCompany.split('-')[0] : customerCompany;
        if (customerCompany && $event.item.dmobranchcompcode_KEY != customerCompany) {
          $event.preventDefault();
          const brnch = { dmobranchbrcode: '', dmobranchbrname: '' };
          this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue(brnch);
        }
      }
    }
  }
}
