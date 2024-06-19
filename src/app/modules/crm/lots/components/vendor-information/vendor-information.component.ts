import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { LotSearchService } from '../../services/lot-search.service';
import { NgbTypeaheadSelectItemEvent, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LotService } from '../../services/lot.service';

import { MessageService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';


@Component({
  selector: 'app-vendor-information',
  templateUrl: './vendor-information.component.html',
  styleUrls: ['./vendor-information.component.scss']
})
export class VendorInformationComponent implements OnInit {

  @Input() processName: string;
  @Input() transactionIds: any = [];
  @Input() selectedLots = [];
  @Input() stage: string;
  @Output() markTabDirty: EventEmitter<boolean> = new EventEmitter();

  lotDetailForm: FormGroup;
  submitted = false;
  vendorBranchOptions: any;
  vendoPic = [];
  isDdl = false;
  isAddNewTag = false;
  VendorGSTFlag='';
  companyCode: string;
  private vendorValidators = [
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
  ValidateVendorBranchMessage: string;
  flag = false;
  constructor(
    private fb: FormBuilder,
    private lotSearchService: LotSearchService,
    private toastrService: ToastrService,
    public activeModal: NgbActiveModal,
    private lotService: LotService,
    private msg: MessageService,
    private userDetail: UserDetail) { }

  ngOnInit() {
    this.lotDetailForm = this.fb.group({
      DMOLot_VInfo_VendorId:  [''],
      DMOLot_VInfo_VendorNam: [''],
      DMOLot_VInfo_VendorBrc: [''],
      DMOLot_VInfo_VendorPic: [''],
      DMOLot_VInfo_AcSaleRef: ['']
    });

    this.lotDetailForm.valueChanges.subscribe(data => {
      this.markTabDirty.emit(true);
    });
  }

  vendorIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorIdSearch(text$);
  }
  vendorNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorNameSearch(text$);
  }
  vendorPICSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorPicSearch(text$);
  }
  vendorBranchSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorBranchSearch(text$);
  }

  checkValue(event, dmo) {
    if (event.target.value === '') {
      if (dmo === 'dmolotvinfovendorpic') {
        this.lotDetailForm.get('DMOLot_VInfo_VendorPic').patchValue('');
      } else {
        this.lotDetailForm.get('DMOLot_VInfo_VendorId').patchValue('');
        this.lotDetailForm.get('DMOLot_VInfo_VendorNam').patchValue('');
        this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue('');
      }
      if (this.lotDetailForm.get('DMOLot_VInfo_VendorId').value === '') {
        this.isDdl = false;
        this.vendoPic = [];
      }
    }
  }
  selectVendor(event: NgbTypeaheadSelectItemEvent, field: string) {
    const vendorSap = event.item && event.item.indexOf('-')>0 ? event.item.split('-')[1] : event.item;
    const vendor = this.lotSearchService.vendorData.find(x => x[field] === vendorSap);
    if (vendor) {
      this.lotDetailForm.get('DMOLot_VInfo_VendorNam').patchValue(vendor.dmocustmstrcustname1);
      this.lotDetailForm.get('DMOLot_VInfo_VendorId').patchValue(vendor.dmocustmstrsapno);
      this.VendorGSTFlag="";
      this.VendorGSTFlag=vendor.dmocustmstrgstflg;
      this.lotSearchService.vendorCompany = vendor.dmocustmstrcompcode_KEY;
        if (vendor.dmocustmstrlstkbranch && vendor.dmocustmstrlstkbranch.includes('(') > 0) {
          const brnch = vendor.dmocustmstrlstkbranch.split('(');
          this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue({dmobranchbrname: brnch[0], dmobranchbrcode: brnch[1].replace(')','') });
          const branchSapNumber = vendor.dmocustmstrlstkbranch_KEY;
          if (branchSapNumber) {
            this.lotSearchService.getVendorBranchData(branchSapNumber, 'dmobranchbrcode', 'EQUAL').subscribe(x => {
              if (x && parseInt(x.RecordsCount) > 0) {
              } else {
                this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue('');
              }
            })
          }
        }
       
       if (field == 'dmocustmstrcustname1') {
          this.lotDetailForm.get('DMOLot_VInfo_VendorId').patchValue(vendor.dmocustmstrcompcode_KEY + '-' + vendor.dmocustmstrsapno);
        }
        else{
          this.lotDetailForm.get('DMOLot_VInfo_VendorId').patchValue(vendor.dmocustmstrsapno);
        }
      this.companyCode = vendor.dmocustmstrcompcode;
      
      const vid = vendor.dmocustmstrsapno && vendor.dmocustmstrsapno.indexOf('-')>0 ? vendor.dmocustmstrsapno.split('-')[1] : vendor.dmocustmstrsapno;
      this.getVendorPIC(vid);
    }
  }

  getVendorPIC(vendorId: string) {
    this.lotSearchService.getVendorPIC(vendorId).subscribe(response => {
      this.lotDetailForm.get('DMOLot_VInfo_VendorPic').patchValue('');
      this.isDdl = true;
      this.vendoPic = response;
      if (response && response.length === 1) {
        this.lotDetailForm.get('DMOLot_VInfo_VendorPic').patchValue(response[0].dmocuspiccustpic);
      }
      this.isAddNewTag = false;
    });
  }

  get f() { return this.lotDetailForm.controls; }

  addValidation() {
    if (this.lotDetailForm.get('DMOLot_VInfo_VendorId').value !== '' || this.lotDetailForm.get('DMOLot_VInfo_VendorNam').value !== '') {
      this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').setValidators(this.vendorValidators);
      this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').updateValueAndValidity();
    }
  }

  onSubmit() {
    this.addValidation();
    this.submitted = true;
    if (this.lotDetailForm.invalid) {
      return;
    }
    let ispassedProduct = false;
    this.selectedLots.forEach((x) => {
      if (this.lotService.BuyerCartage.indexOf(x.dmolotlotinfopdct) > -1) {
        ispassedProduct = true;
      }
    });
    if (ispassedProduct) {
      this.msg.showMessage('Fail', { body: 'One or many of the lot(s) selected are passed in', header: ' ' });
      return;
    }
    const vendorInfo = ['vendorId', 'vendorName', 'vendorbrc','vendorGstFlag'];
    if (!this.isAddNewTag) {
      vendorInfo.push('vendorpic');
    }
    var vendorBranchForValidate= this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value.dmobranchbrcode ==undefined ?this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value: this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value.dmobranchbrname+'('+
    this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value.dmobranchbrcode+')';
    const submitData: any = {
      vendorId: this.lotDetailForm.controls.DMOLot_VInfo_VendorId.value,
      vendorName: this.lotDetailForm.controls.DMOLot_VInfo_VendorNam.value,
      vendorbrc: this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value ?
      this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value.dmobranchbrcode+'~'+this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.value.dmobranchbrname : null,
      vendorpic: this.lotDetailForm.controls.DMOLot_VInfo_VendorPic.value?this.lotDetailForm.controls.DMOLot_VInfo_VendorPic.value.toString().toUpperCase(): this.lotDetailForm.controls.DMOLot_VInfo_VendorPic.value,
      vinfoacsaleref: this.lotDetailForm.controls.DMOLot_VInfo_AcSaleRef.value,
      vendorGstFlag: this.VendorGSTFlag
    };
    submitData.vendorId = submitData.vendorId && submitData.vendorId.indexOf('-')>0 ? submitData.vendorId.split('-')[1] : submitData.vendorId;
    
    let keyGroup: string[] = [];

    Object.keys(submitData).forEach(key => {
      if (!!submitData[key]) {
        if (vendorInfo.includes(key) && !keyGroup.includes('vendorInfo')) {
          keyGroup.push('vendorInfo');
        }
        if (!vendorInfo.includes(key)) {
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
        .then(result => {
          if (result) {
            submitData.processName = this.processName;
            submitData.LotTransactionId = this.transactionIds;
            submitData.ModfBy = this.userDetail.UserID.toString();
            submitData.companyCode = this.companyCode;
            const validateLotData: any = {
              VendorId: submitData.vendorId,
              VendorName: submitData.vendorName,
              VendorBranchName: vendorBranchForValidate,

            }
            this.lotSearchService.validateLotSummaryRecord(validateLotData).subscribe(data => {
              this.flag = false;
              if (data[0].VendorIdMessage === 'VendorId is Not Exist' || submitData.vendorId == undefined) {
                this.flag = true;
                this.ValidateVendorIdMessage = 'Vendor Id is not exist';
              }
              if (data[0].VendorNameMessage === 'Vendor name is Not Exist' || submitData.vendorName == undefined) {
                this.flag = true;
                this.ValidateVendorNameMessage = 'Vendor name is not exist';
              }
              if (data[0].VendorBranchMessage === 'Vendor branch is Not Exist') {
                this.flag = true;
                this.ValidateVendorBranchMessage = 'Vendor branch is not exist';
              }
              if (this.flag) {
                return false;
              }
            this.lotSearchService.BulkUpdateVenderInformation(submitData).subscribe(data => {
              this.updateStatus();
              if (this.stage === 'Invoiced' && submitData.vendorpic) {
                this.selectedLots.forEach(async x => {
                  if (x.dmolotbinfobuyerid) {
                    await this.lotService.AddChangesLot({ LotTransactionID: x.TRNSCTNID, BuyerId: x.dmolotbinfobuyerid, NewBuyerId: x.dmolotbinfobuyerid }).toPromise();
                  }
                });
              }
              this.toastrService.success('Data saved successfully');
              this.activeModal.close(true);
            });
          });
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

