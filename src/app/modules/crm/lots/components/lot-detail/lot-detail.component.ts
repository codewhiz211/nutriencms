import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrmLotTrigger } from '@app/core/models/crm-lot-trigger.enum';


import {
  ApplicationService,
  AuthenticationService,
  FormViewService,
  DmoControlService,
  ApiESaleyardService,
  MessageService,
  SaleStage
} from '@app/core';

import { LotSearchService } from '../../services/lot-search.service';
import { SalesService } from '@app/modules/crm/sales/services/sales.service';
import { LotService } from '../../services/lot.service';
import { LotFeesChargesComponent } from '../lot-fees-charges/lot-fees-charges.component';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-lot-detail',
  templateUrl: './lot-detail.component.html',
  styleUrls: ['./lot-detail.component.scss'],
})
export class LotDetailComponent implements OnInit, OnDestroy {
  @Input() processName: string;
  @Input() stage: SaleStage;
  @Input() parentData: any;

  @ViewChild('vendorName') vendorName: ElementRef;
  @ViewChild('vendorId') vendorId: ElementRef;
  @ViewChild('buyerId') buyerId: ElementRef;
  @ViewChild('buyerName') buyerName: ElementRef;

  @ViewChild('productName') productName: ElementRef;
  @ViewChild('productDescription') productDescription: ElementRef;
  @ViewChild('breedName') breedName: ElementRef;

  @ViewChild(LotFeesChargesComponent)
  private lotFeesChargesGrid: LotFeesChargesComponent;
  private subscriptions: Subscription[] = [];

  lotDetailForm: FormGroup;
  parentId: string;
  transactionId: string;
  isNew = false;
  submitted = false;
  currentUser: any;
  BMJSON: any = {};
  applicationData: any = {};
  lotInformations: any = {};
  checkboxTypeControls = ['DMOLot_BInfo_SetIntBBReb', 'DMOLot_LotInfo_HGP', 'DMOLot_LotInfo_TransClaim'];
  // for vendor fields
  vendorBranchOptions = [];
  vendorPICOptions = [];
  DMOLot_Qnty: any;
  DMOLot_PriceHead: any;
  DMOLOT_PriceKg: any;
  DMOLOT_Weight: any;
  DMOLOT_TURNOVER: any;
  GstRate = 10;
  GstRateChanged = 10;
  // for buyer fields
  buyerBranchOptions = [];
  buyerPICOptions = [];
  isLotSubmit = false;
  Product: any;
  ValidateVendorIdMessage: string;
  ValidateVendorNameMessage: string;
  ValidateBuyerIdMessage: string;
  ValidateBuyerNameMessage: string;
  ValidateProductNameMessage: string;
  ValidateProductDescriptionMessage: string;
  ValidateBreedMessage: string;
  ValidatBuyerBranchMessage: string;
  ValidateVendorBranchMessage: string;
  flag = false;
  isUnsoldLots = false;
  isFeesCalculated = false;
  isCalcFeesFieldsChanged = false;
  isCalcBuyerBranchRebate = false;
  originalQuantityValue: any;
  isDdl = false;
  isDdlBuyer = false;
  RecalcVendorCommission: any = false;
  RecalcCharges: any = false;
  HobbyFarmer = '';
  GSTFlag = '';
  isCalculationDone = true;
  isGSTApplicable = true;
  isVendorGSTApplicable = true;
  price$ph = true;
  priceCKG = true;
  VendorCartage = ['CV', 'SUV', 'AGV', 'AUCV', 'DIPV', 'FEEV', 'RAFRV', 'SEV', 'STIV', 'STSDV', 'WGHV'];
  BuyerCartage = ['CB', 'SUB', 'AGB', 'DIPB', 'FEEB', 'RAFRB', 'SEB', 'STIB', 'STSDB', 'WGHB', 'AUCB', 'SEB'];
  ChargedTo = '';
  formatter = (x: any) => (x.dmobranchbrname ? x.dmobranchbrname + ' (' + x.dmobranchbrcode + ')' : '');
  BlockCustomer = {
    IsVendorBlock: false,
    IsBuyerBlock: false,
  };

  triggerCondJson = [];
  triggers: any = [];
  WFJSON: any = {};
  currentStageGuid: string;
  currentStateGuid: string;
  currentTriggerGuid: string;
  VendorCompanyCode: string;
  BuyerCompanyCode: string;
  isProductSelected: boolean;

  get isReversal() {
    return this.stage === SaleStage.ReversalProcess;
  }

  get isFinalised() {
    return this.stage === SaleStage.Finalised || this.stage === SaleStage.ReversalCompleted;
  }
  get VendorBranchLabel() {
    const lbl = this.vendorBranchOptions.find((x) => x.ValueField === this.f.DMOLot_VInfo_VendorBrc.value);
    if (lbl) {
      return lbl.TextField;
    } else {
      return '';
    }
  }
  get BuyerBranchLabel() {
    const lbl = this.buyerBranchOptions.find((x) => x.ValueField === this.f.DMOLot_BInfo_BuyerBrc.value);
    if (lbl) {
      return lbl.TextField;
    } else {
      return '';
    }
  }

  addPICTagFn = (term) => {
    if (term.length < 9) {
      return term;
    }
    this.toastrService.warning('The PIC number accepts a max of 8 characters.');
    return null;
  };

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private authenticationService: AuthenticationService,
    private applicationService: ApplicationService,
    private formViewService: FormViewService,
    private dmoControlService: DmoControlService,
    private lotSearchService: LotSearchService,
    private saleServices: SalesService,
    private lotservice: LotService,
    private apiESaleyardService: ApiESaleyardService,
    private msg: MessageService,
    private userDetail: UserDetail
  ) {}

  ngOnInit() {
    this.currentUser = this.userDetail;
    const sb = this.route.paramMap.subscribe((params) => {
      this.parentId = params.get('sale_id');
      this.transactionId = params.get('id');
      if (this.transactionId === 'new') {
        this.isNew = true;
      } else {
        this.isNew = false;
      }
      this.initValues();
      this.lotDetailForm = this.fb.group({
        DMOLot_VInfo_VendorId: [null],
        DMOLot_VInfo_VendorNam: [null],
        DMOLot_VInfo_VendorBrc: [null],
        DMOLot_VInfo_VendorPic: [null],
        DMOLot_VInfo_GstReg: [null],
        DMOLot_VInfo_AcSaleRef: [null],
        DMOLot_BInfo_BuyerId: [null],
        DMOLot_BInfo_BuyerName: [null],
        DMOLot_BInfo_BuyerBrc: [null],
        DMOLot_BInfo_BuyerPic: [null],
        DMOLot_BInfo_InvoiceRef: [null],
        DMOLot_BInfo_SetIntBBReb: [false],
        DMOLot_BInfo_Rate: [null],
        DMOLot_LotInfo_LotNum: [null],
        DMOLot_LotInfo_Qnty: [null],
        DMOLot_LotInfo_Pdct: [null],
        DMOLot_LotInfo_ProdDesc: [null],
        DMOLot_LotInfo_Brd: [null],
        DMOLot_LotInfo_Price$PHd: [null],
        DMOLot_LotInfo_PriceCPKg: [null],
        DMOLot_LotInfo_WtKg: [null],
        DMOLot_LotInfo_TurnovAUD: [null],
        DMOLot_LotInfo_Sex: [null],
        DMOLot_LotInfo_PaintMk: [null],
        DMOLot_LotInfo_ContractId: [
          this.isNew &&
          this.parentData.DataInformation.dmocrmheaderinfcontid &&
          !!this.parentData.DataInformation.dmocrmheaderinfcontid.DMOVAL
            ? this.parentData.DataInformation.dmocrmheaderinfcontid.DMOVAL
            : null,
        ],
        DMOLot_LotInfo_HGP: [false],
        DMOLot_LotInfo_TransClaim: [false],
        DMOLot_LotInfo_LotID: [null],
        DMOLot_LotInfo_GST: [null],
        DMOLot_LotInfo_TurnoverGs: [null],
        DMOLot_LotInfo_PriceType: [null],
        LMK_LD_ProductCategory: [null],
        DMOLot_LotInfo_GSTRate: [null],
        DMOLot_LotInfo_TrnsClmBy: [null],
        DMOLot_LotInfo_TrnsClmQnt: [null],
        DMOLot_LotInfo_TrnsClmVal: [null],
        DMOLot_LotInfo_TrnsClmRsn: [null],

      });
      this.lotDetailForm.addControl('DMOLot_LotInfo_TransClaim', new FormControl(false));
      this.getGstRate();
      if (!this.isNew) {
        this.setValues();
      } else {
        this.onChanges();
      }

      if (this.isReversal) {
        this.lotDetailForm.disable();
        this.lotDetailForm.controls['DMOLot_VInfo_AcSaleRef'].enable();
        this.lotDetailForm.controls['DMOLot_BInfo_InvoiceRef'].enable();
        this.lotDetailForm.controls['DMOLot_LotInfo_ProdDesc'].enable();
        if (!(this.isReversal == true && this.saleServices.IsConductingBranchSaleProcessor == false)) {
          this.lotDetailForm.controls['DMOLot_LotInfo_Qnty'].enable();
        }
      } else if (this.isFinalised) {
        this.lotDetailForm.disable();
      }
    });

    this.subscriptions.push(sb);

    if (sessionStorage.getItem('BlockCustomer')) {
      this.BlockCustomer = JSON.parse(sessionStorage.getItem('BlockCustomer'));
    }
  }
  ngOnDestroy() {
    sessionStorage.removeItem('BlockCustomer');
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  initValues() {
    this.submitted = false;
    this.isLotSubmit = false;
    this.flag = false;
    this.isUnsoldLots = false;
    this.isFeesCalculated = false;
    this.isCalcFeesFieldsChanged = false;
    this.originalQuantityValue = null;
  }

  public onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }

  vendorIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorIdSearch(text$);
  };

  vendorNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorNameSearch(text$);
  };

  selectVendor(event: NgbTypeaheadSelectItemEvent, field: string) {
    const vendorSap = field == 'dmocustmstrsapno' && event.item && event.item.indexOf('-') > 0 ? event.item.split('-')[1] : event.item;
    this.lotSearchService.vendorData.forEach((vendor) => {
      if (vendor[field] === vendorSap) {
        this.lotDetailForm.get('DMOLot_VInfo_GstReg').patchValue(vendor.dmocustmstrgstflg);
        this.lotDetailForm.get('DMOLot_VInfo_VendorNam').patchValue(vendor.dmocustmstrcustname1);
        if (field == 'dmocustmstrcustname1') {
          this.lotDetailForm.get('DMOLot_VInfo_VendorId').patchValue(vendor.dmocustmstrcompcode_KEY + '-' + vendor.dmocustmstrsapno);
        } else {
          this.lotDetailForm.get('DMOLot_VInfo_VendorId').patchValue(vendor.dmocustmstrsapno);
        }
        this.lotSearchService.vendorCompany = vendor.dmocustmstrcompcode_KEY;
        this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue('');
        this.vendorBranchOptions = [];
        if (vendor.dmocustmstrlstkbranch) {
          this.vendorBranchOptions.push({
            ValueField: vendor.dmocustmstrlstkbranch,
            TextField: vendor.dmocustmstrlstkbranch,
          });
        }
        if (this.vendorBranchOptions.length < 1) {
          this.isDdl = false;
        } else {
          this.isDdl = true;
          this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue(this.vendorBranchOptions[0].ValueField);
        }
        const branchSapNumber = vendor.dmocustmstrlstkbranch ? vendor.dmocustmstrlstkbranch_KEY : undefined;
        if (branchSapNumber) {
          const sb = this.lotSearchService.getVendorBranchData(branchSapNumber, 'dmobranchbrcode', 'EQUAL').subscribe((x) => {
            if (x && parseInt(x.RecordsCount) > 0) {
              this.isDdl = true;
            } else {
              this.isDdl = false;
              this.vendorBranchOptions = [];
              this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue('');
            }
          });
          this.subscriptions.push(sb);
        }

        this.lotDetailForm.controls.DMOLot_VInfo_GstReg.markAsDirty();
        this.lotDetailForm.controls.DMOLot_VInfo_GstReg.markAsTouched();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorNam.markAsDirty();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorNam.markAsTouched();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorId.markAsDirty();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorId.markAsTouched();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.markAsDirty();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorBrc.markAsTouched();

        this.getVendorPIC(vendor.dmocustmstrsapno);
        this.HobbyFarmer = vendor.dmocustmstrhobbyfarmer;

        if (!(vendor.dmocustmstrgstflg == 'Yes' && vendor.dmocustmstrhobbyfarmer == 'No' && vendor.dmocustmstrcustabn)) {
          this.isVendorGSTApplicable = false;
        } else {
          this.isVendorGSTApplicable = true;
        }
        this.calculationWeightQuanityCKGPricesHead('');
        this.isCalculationDone = false;
        this.VendorCompanyCode = vendor.dmocustmstrcompcode;
      }
      if (vendor['dmocustmstrblockflg'] === 'Yes') {
        this.BlockCustomer.IsVendorBlock = true;
      }
      if (vendor['dmocustmstrblockflg'] === 'No') {
        this.BlockCustomer.IsVendorBlock = false;
      }
    });
  }

  getVendorPIC(vendorId: string, isFormLoad = false) {
    const sb = this.lotSearchService.getVendorPIC(vendorId).subscribe((response) => {
      if (!isFormLoad) {
        this.lotDetailForm.get('DMOLot_VInfo_VendorPic').patchValue('');
      }
      this.vendorPICOptions = [];
      response.forEach((item) => this.vendorPICOptions.push(item.dmocuspiccustpic));
      const pic = this.lotDetailForm.get('DMOLot_VInfo_VendorPic').value;
      if (pic != undefined && pic != '' && this.vendorPICOptions.findIndex((x) => x == pic) === -1) {
        this.vendorPICOptions.push(pic);
      }
      if (this.vendorPICOptions.length === 1 && this.vendorPICOptions[0] != undefined) {
        this.lotDetailForm.get('DMOLot_VInfo_VendorPic').patchValue(this.vendorPICOptions[0]);
      }
      if (!isFormLoad) {
        this.lotDetailForm.controls.DMOLot_VInfo_VendorPic.markAsDirty();
        this.lotDetailForm.controls.DMOLot_VInfo_VendorPic.markAsTouched();
      }
    });

    this.subscriptions.push(sb);
  }

  buyerIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerIdSearch(text$);
  };

  buyerNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerNameSearch(text$);
  };

  selectBuyer(event: NgbTypeaheadSelectItemEvent, field: string) {
    const BuyerSap = field == 'dmocustmstrsapno' && event.item && event.item.indexOf('-') > 0 ? event.item.split('-')[1] : event.item;
    this.lotSearchService.buyerData.forEach((buyer) => {
      if (buyer[field] === BuyerSap) {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerName').patchValue(buyer.dmocustmstrcustname1);
        if (field == 'dmocustmstrcustname1') {
          this.lotDetailForm.get('DMOLot_BInfo_BuyerId').patchValue(buyer.dmocustmstrcompcode_KEY + '-' + buyer.dmocustmstrsapno);
        } else {
          this.lotDetailForm.get('DMOLot_BInfo_BuyerId').patchValue(buyer.dmocustmstrsapno);
        }
        this.lotSearchService.buyerCompany = buyer.dmocustmstrcompcode_KEY;
        this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue('');
        this.buyerBranchOptions = [];
        if (buyer.dmocustmstrlstkbranch) {
          this.buyerBranchOptions.push({
            ValueField: buyer.dmocustmstrlstkbranch,
            TextField: buyer.dmocustmstrlstkbranch,
          });
        }
        if (this.buyerBranchOptions.length < 1) {
          this.isDdlBuyer = false;
        } else {
          this.isDdlBuyer = true;
          this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue(this.buyerBranchOptions[0].ValueField);
        }
        const branchSapNumber = buyer.dmocustmstrlstkbranch ? buyer.dmocustmstrlstkbranch_KEY : undefined;
        if (branchSapNumber) {
          const sb = this.lotSearchService.getBranchData(branchSapNumber, 'dmobranchbrcode', 'EQUAL').subscribe((x) => {
            if (x && parseInt(x.RecordsCount) > 0) {
              this.isDdlBuyer = true;
            } else {
              this.isDdlBuyer = false;
              this.buyerBranchOptions = [];
              this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue(null);
            }
          });

          this.subscriptions.push(sb);
        }

        this.lotDetailForm.controls.DMOLot_BInfo_BuyerName.markAsDirty();
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerName.markAsTouched();
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerId.markAsDirty();
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerId.markAsTouched();
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.markAsDirty();
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerBrc.markAsTouched();

        this.getBuyerPIC(buyer.dmocustmstrsapno);
        this.BuyerCompanyCode = buyer.dmocustmstrcompcode;
      }
      if (buyer['dmocustmstrblockflg'] === 'Yes') {
        this.BlockCustomer.IsBuyerBlock = true;
      }
      if (buyer['dmocustmstrblockflg'] === 'No') {
        this.BlockCustomer.IsBuyerBlock = false;
      }
    });
  }

  getBuyerPIC(buyerId: string, isFormLoad = false) {
    const sb = this.lotSearchService.getBuyerPIC(buyerId).subscribe((response) => {
      if (!isFormLoad) {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').patchValue('');
      }
      this.buyerPICOptions = [];
      response.forEach((item) => this.buyerPICOptions.push(item.dmocuspiccustpic));
      const pic = this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').value;
      if (pic != undefined && pic != '' && this.buyerPICOptions.findIndex((x) => x == pic) === -1) {
        this.buyerPICOptions.push(pic);
      }
      if (this.buyerPICOptions.length === 1 && this.buyerPICOptions[0] != undefined) {
        this.lotDetailForm.get('DMOLot_BInfo_BuyerPic').patchValue(this.buyerPICOptions[0]);
      }
      if (!isFormLoad) {
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerPic.markAsDirty();
        this.lotDetailForm.controls.DMOLot_BInfo_BuyerPic.markAsTouched();
      }
    });

    this.subscriptions.push(sb);
  }

  productSearch = (text$: Observable<string>) => {
    return this.lotSearchService.productSearch(text$, this.parentId);
  };

  breedSearch = (text$: Observable<string>) => {
    return this.lotSearchService.breedSearch(text$, this.parentId);
  };

  onChanges() {
    this.subscriptions.push(
      this.formViewService.getBmWfJson(this.processName, 'AdminView').subscribe((response) => {
        this.WFJSON = response.WF;
        this.getTriggers();
      }),
      this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').valueChanges.subscribe((val) => {
        this.isCalcFeesFieldsChanged = true;
        this.RecalcVendorCommission = true;
        this.RecalcCharges = true;
      }),
      this.lotDetailForm.get('DMOLot_LotInfo_Pdct').valueChanges.subscribe((val) => {
        this.isCalcFeesFieldsChanged = true;
        this.RecalcVendorCommission = true;
        this.RecalcCharges = true;
      }),
      this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').valueChanges.subscribe((val) => {
        this.isCalcFeesFieldsChanged = true;
        this.RecalcCharges = true;
        // this.chageValueDMO('dmolotlotinfoturnovaud');
      }),
      this.lotDetailForm
        .get('DMOLot_LotInfo_Qnty')
        .valueChanges.pipe(debounceTime(200), distinctUntilChanged())
        .subscribe((val) => {
          if (this.isReversal && +val > this.originalQuantityValue) {
            this.msg.showMessage('Warning', {
              body: 'The amount entered should not be greater than the original quantity',
            });
            // this.msg.showErrorMessage('The amount entered should not be greater than the original quantity.', 'Message', 'Ok', null, false, true, false, '');
            this.lotDetailForm.get('DMOLot_LotInfo_Qnty').patchValue(this.originalQuantityValue);
          } else {
            this.isCalcFeesFieldsChanged = true;
            this.RecalcCharges = true;
          }
          //this.chageValueDMO('dmolotlotinfoqnty');
        }),
      this.lotDetailForm.get('DMOLot_LotInfo_WtKg').valueChanges.subscribe((val) => {
        this.isCalcFeesFieldsChanged = true;
        this.RecalcCharges = true;
        //this.chageValueDMO('dmolotlotinfowtkg')
      }),
      this.lotDetailForm.get('DMOLot_LotInfo_TransClaim').valueChanges.subscribe((checked) => {
        if (checked) {
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmBy').setValidators([Validators.required]);
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmBy').updateValueAndValidity();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmQnt').setValidators([Validators.required]);
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmQnt').updateValueAndValidity();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmVal').setValidators([Validators.required]);
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmVal').updateValueAndValidity();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmRsn').setValidators([Validators.required]);
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmRsn').updateValueAndValidity();
        } else {
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmBy').clearValidators();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmBy').updateValueAndValidity();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmQnt').clearValidators();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmQnt').updateValueAndValidity();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmVal').clearValidators();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmVal').updateValueAndValidity();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmRsn').clearValidators();
          this.lotDetailForm.get('DMOLot_LotInfo_TrnsClmRsn').updateValueAndValidity();
        }
      }),
      this.lotDetailForm
        .get('DMOLot_LotInfo_Price$PHd')
        .valueChanges.pipe(debounceTime(200), distinctUntilChanged())
        .subscribe((val) => {
          if (val) {
            this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').markAsDirty();
          }
          this.isCalcFeesFieldsChanged = true;
          this.RecalcCharges = true;
          // this.chageValueDMO('dmolotlotinfopricephd');
        }),
      this.lotDetailForm
        .get('DMOLot_LotInfo_PriceCPKg')
        .valueChanges.pipe(debounceTime(200), distinctUntilChanged())
        .subscribe((val) => {
          if (val) {
            this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').markAsDirty();
          }
          this.RecalcCharges = true;
          this.isCalcFeesFieldsChanged = true;
          //   this.chageValueDMO('dmolotlotinfopricecpkg');
        }),
      this.lotDetailForm.get('DMOLot_BInfo_SetIntBBReb').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
      }),
      this.lotDetailForm.get('DMOLot_BInfo_Rate').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
      }),
      this.lotDetailForm.get('DMOLot_VInfo_VendorId').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
        this.RecalcCharges = true;
        this.RecalcVendorCommission = true;
        this.isCalcFeesFieldsChanged = true;
        this.calculationWeightQuanityCKGPricesHead('');
        if (val == undefined || val == '') {
          this.lotDetailForm.get('DMOLot_VInfo_GstReg').patchValue('');
        }
      }),
      this.lotDetailForm.get('DMOLot_VInfo_VendorNam').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
        this.RecalcCharges = true;
        this.RecalcVendorCommission = true;
        this.isCalcFeesFieldsChanged = true;
        this.calculationWeightQuanityCKGPricesHead('');
      }),
      this.lotDetailForm.get('DMOLot_BInfo_BuyerId').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
        this.RecalcCharges = true;
        this.isCalcFeesFieldsChanged = true;
      }),
      this.lotDetailForm.get('DMOLot_BInfo_BuyerName').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
        this.RecalcCharges = true;
        this.isCalcFeesFieldsChanged = true;
      }),
      this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').valueChanges.subscribe((val) => {
        this.isCalcBuyerBranchRebate = true;
        this.RecalcCharges = true;
        this.isCalcFeesFieldsChanged = true;
        this.calculationWeightQuanityCKGPricesHead('');
      })
    );
  }

  setValues() {
    const sb1 = this.formViewService.getBmWfJson(this.processName, 'AdminView', this.transactionId).subscribe((response) => {
      this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
      const sb2 = this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).subscribe((data) => {
        this.applicationData = data;
        this.lotservice.lotId =
          data.DataInformation.dmolotlotinfolotid != undefined && data.DataInformation.dmolotlotinfolotid.DMOVAL != ''
            ? data.DataInformation.dmolotlotinfolotid.DMOVAL
            : null;
        this.Product =
          data.DataInformation.dmolotlotinfopdct != undefined && data.DataInformation.dmolotlotinfopdct.DMOVAL != ''
            ? data.DataInformation.dmolotlotinfopdct.DMOVAL
            : null;
        this.lotSearchService.Product = this.Product;
        this.lotSearchService.currentLotId =
          this.applicationData.DataInformation.dmolotlotinfolotid != null
            ? this.applicationData.DataInformation.dmolotlotinfolotid.DMOVAL
            : null;
        this.BMJSON.List.forEach((bmoGuid) => {
          if (this.BMJSON.BusinessModelObjects[bmoGuid].DisplayName === 'Lot Details') {
            this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach((dmogGuid) => {
              this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach((rowID) => {
                this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach((objCOLUMN) => {
                  objCOLUMN.List.forEach((dmoGUID) => {
                    if (this.applicationData.DataInformation[dmoGUID]) {
                      this.lotInformations[objCOLUMN.DataModelObjects[dmoGUID].Name] = this.applicationData.DataInformation[
                        dmoGUID
                      ].DMOVAL.indexOf('~~~')
                        ? this.applicationData.DataInformation[dmoGUID].DMOVAL.split('~~~')[0]
                        : this.applicationData.DataInformation[dmoGUID].DMOVAL;
                    }
                  });
                });
              });
            });
          }
        });
        if (!!data.DataInformation.dmolotvinfovendorid.DMOVAL) {
          this.getVendorPIC(data.DataInformation.dmolotvinfovendorid.DMOVAL, true);
        }
        if (!!data.DataInformation.dmolotbinfobuyerid.DMOVAL) {
          this.getBuyerPIC(data.DataInformation.dmolotbinfobuyerid.DMOVAL, true);
        }
        Object.keys(this.lotInformations).forEach((name) => {
          if (this.lotDetailForm.controls[name]) {
            if (this.checkboxTypeControls.includes(name)) {
              this.lotDetailForm.controls[name].patchValue(this.lotInformations[name] === 'true');
            } else {
              this.lotDetailForm.controls[name].patchValue(this.lotInformations[name]);
            }
          }
        });
        const sb3 = this.lotSearchService.lotNavigation(this.parentId, this.lotSearchService.currentLotId).subscribe((data) => {
          if (this.lotSearchService.currentLotId == data.maxLotNo && this.isFinalised) {
            this.lotSearchService.isNavigateNew = true;
          } else {
            this.lotSearchService.isNavigateNew = false;
          }
        });
        this.subscriptions.push(sb3);
        const VendorCartage = ['CV', 'SUV', 'AGV', 'AUCV', 'DIPV', 'FEEV', 'RAFRV', 'SEV', 'STIV', 'STSDV', 'WGHV'];
        const BuyerCartage = ['CB', 'SUB', 'AGB', 'DIPB', 'FEEB', 'RAFRB', 'SEB', 'STIB', 'STSDB', 'WGHB', 'AUCB', 'SEB'];
        if (
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASC' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASH' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASS' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASP' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASA' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASO' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASD' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'DOA' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'NCVS' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'PASG' ||
          this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value === 'NCVC'
        ) {
          this.isUnsoldLots = true;
          this.f.DMOLot_BInfo_BuyerId.disable();
          this.f.DMOLot_BInfo_BuyerName.disable();
          this.f.DMOLot_BInfo_BuyerBrc.disable();
          this.f.DMOLot_BInfo_BuyerPic.disable();
        } else if (VendorCartage.indexOf(this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value) > -1) {
          this.f.DMOLot_BInfo_BuyerId.disable();
          this.f.DMOLot_BInfo_BuyerName.disable();
          this.f.DMOLot_BInfo_BuyerBrc.disable();
          this.f.DMOLot_BInfo_BuyerPic.disable();
          this.f.DMOLot_BInfo_InvoiceRef.disable();
          this.f.DMOLot_BInfo_SetIntBBReb.disable();
          this.f.DMOLot_BInfo_Rate.disable();
          this.ChargedTo = 'vendor';
          this.enableDisableControl(false, false);
        } else if (BuyerCartage.indexOf(this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value) > -1) {
          this.f.DMOLot_VInfo_VendorId.disable();
          this.f.DMOLot_VInfo_VendorNam.disable();
          this.f.DMOLot_VInfo_VendorBrc.disable();
          this.f.DMOLot_VInfo_VendorPic.disable();
          this.f.DMOLot_VInfo_AcSaleRef.disable();
          this.enableDisableControl(false, false);
          this.ChargedTo = 'buyer';
        }

        if (this.isReversal) {
          this.originalQuantityValue = this.lotDetailForm.get('DMOLot_LotInfo_Qnty').value;
        }
        if (this.applicationData.DataInformation && this.applicationData.DataInformation.dmolotvinfovendorbrc !== null) {
          this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue('');
          const branch = this.applicationData.DataInformation.dmolotvinfovendorbrc.DMOVAL.split('~~~');
          this.vendorBranchOptions = [];
          if (branch.length > 1) {
            this.vendorBranchOptions.push({
              ValueField: branch[1] + ' (' + branch[0] + ')',
              TextField: branch[1] + ' (' + branch[0] + ')',
            });
            this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue(this.vendorBranchOptions[0].ValueField);
            if (this.vendorBranchOptions[0].ValueField !== '') {
              this.isDdl = true;
            }
          }
        }
        if (this.applicationData.DataInformation && this.applicationData.DataInformation.dmolotbinfobuyerbrc !== null) {
          this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue('');
          const branch = this.applicationData.DataInformation.dmolotbinfobuyerbrc.DMOVAL.split('~~~');
          this.buyerBranchOptions = [];
          if (branch.length > 1) {
            this.buyerBranchOptions.push({
              ValueField: branch[1] + ' (' + branch[0] + ')',
              TextField: branch[1] + ' (' + branch[0] + ')',
            });
            this.lotDetailForm.get('DMOLot_BInfo_BuyerBrc').patchValue(this.buyerBranchOptions[0].ValueField);
            if (this.buyerBranchOptions[0].ValueField !== '') {
              this.isDdlBuyer = true;
            }
          }
        }
        // #CRMI-1237 - EXT 457 - Grid reference text needs to appear in C/Kg lot for e-contract records - Roshan - 09/08/2020
        if (
          (this.applicationData.DataInformation && this.applicationData.DataInformation.dmolotlotinfopricetype.DMOVAL == 'c/kg') ||
          this.applicationData.DataInformation.dmolotlotinfopricetype.DMOVAL == 'Grid Reference'
        ) {
          this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').disable();
          this.priceCKG = true;
          this.price$ph = false;
        } else {
          this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').disable();
          this.price$ph = true;
          this.priceCKG = false;
        }
        if (
          this.applicationData.DataInformation &&
          this.applicationData.DataInformation.dmolotlotinfogstrate.DMOVAL !== null &&
          this.applicationData.DataInformation.dmolotlotinfogstrate.DMOVAL !== ''
        ) {
          this.GstRate = this.applicationData.DataInformation.dmolotlotinfogstrate.DMOVAL;
        }
        if (
          this.applicationData.DataInformation &&
          this.applicationData.DataInformation.dmolotvinfogstreg.DMOVAL !== null &&
          this.applicationData.DataInformation.dmolotvinfogstreg.DMOVAL == 'No'
        ) {
          this.isVendorGSTApplicable = false;
        }
        if (!!data.DataInformation.dmolotvinfovendorid.DMOVAL) {
          if (!!data.DataInformation.domlotvinfocompcode.DMOVAL) {
            this.lotDetailForm
              .get('DMOLot_VInfo_VendorId')
              .patchValue(
                data.DataInformation.domlotvinfocompcode.DMOVAL.split('~~~')[0] + '-' + data.DataInformation.dmolotvinfovendorid.DMOVAL
              );
            this.lotSearchService.vendorCompany = data.DataInformation.domlotvinfocompcode.DMOVAL.split('~~~')[0];
          }
        }
        if (!!data.DataInformation.dmolotbinfobuyerid.DMOVAL) {
          if (!!data.DataInformation.dmolotbinfocompcode.DMOVAL) {
            this.lotDetailForm
              .get('DMOLot_BInfo_BuyerId')
              .patchValue(
                data.DataInformation.dmolotbinfocompcode.DMOVAL.split('~~~')[0] + '-' + data.DataInformation.dmolotbinfobuyerid.DMOVAL
              );
            this.lotSearchService.buyerCompany = data.DataInformation.dmolotbinfocompcode.DMOVAL.split('~~~')[0];
          }
        }
        this.checkGSTApplicable();
        this.onChanges();
      });

      this.subscriptions.push(sb2);
    });

    this.subscriptions.push(sb1);
  }
  getGstRate() {
    const sb = this.lotservice.getGstRate().subscribe((result) => {
      this.GstRate = result.GSTRate;
      this.GstRateChanged = result.GSTRate;
      if (this.isNew) {
        this.lotDetailForm.get('DMOLot_LotInfo_GSTRate').patchValue(result.GSTRate);
      }
    });
    this.subscriptions.push(sb);
  }

  setProductDescription(event: NgbTypeaheadSelectItemEvent) {
    this.lotDetailForm.controls.DMOLot_LotInfo_Brd.setValue('');
    this.lotSearchService.Product = event.item;
    this.ChargedTo = '';
    if (
      event.item === 'PASC' ||
      event.item === 'PASH' ||
      event.item === 'PASS' ||
      event.item === 'PASP' ||
      event.item === 'PASA' ||
      event.item === 'PASO' ||
      event.item === 'PASD' ||
      event.item === 'DOA' ||
      event.item === 'NCVS' ||
      event.item === 'PASG' ||
      event.item === 'NCVC'
    ) {
      this.handleBuyerCartage(false);
      this.handleVendorCartage(false);
      this.handleUnsoldLots(true);
    } else if (this.VendorCartage.indexOf(event.item) > -1) {
      this.handleUnsoldLots(false);
      this.handleBuyerCartage(false);
      this.handleVendorCartage(true);
      this.ChargedTo = 'vendor';
    } else if (this.BuyerCartage.indexOf(event.item) > -1) {
      this.handleUnsoldLots(false);
      this.handleVendorCartage(false);
      this.handleBuyerCartage(true);
      this.ChargedTo = 'buyer';
    } else {
      this.handleUnsoldLots(false);
      this.handleBuyerCartage(false);
      this.handleVendorCartage(false);
    }
    this.lotSearchService.productData.forEach((product) => {
      if (product.PMProductCode === event.item) {
        this.lotDetailForm.controls.DMOLot_LotInfo_ProdDesc.patchValue(product.PMProductDescription);
        this.lotDetailForm.controls.DMOLot_LotInfo_ProdDesc.markAsDirty();
        this.lotDetailForm.controls.DMOLot_LotInfo_ProdDesc.markAsTouched();
        this.lotDetailForm.controls.LMK_LD_ProductCategory.patchValue(product.productcategory);
        this.lotDetailForm.controls.LMK_LD_ProductCategory.markAsDirty();
        this.lotDetailForm.controls.LMK_LD_ProductCategory.markAsTouched();
        if (product.GSTApplicable && product.GSTApplicable == 'No') {
          this.isGSTApplicable = false;
        } else {
          this.isGSTApplicable = true;
        }
        this.calculationWeightQuanityCKGPricesHead('');
      }
    });
    this.ValidateProductNameMessage = '';
    this.isProductSelected = true;
  }

  handleUnsoldLots(isUnsoldLots: boolean) {
    this.isUnsoldLots = isUnsoldLots;
    if (isUnsoldLots) {
      // disable buyer fields
      this.f.DMOLot_BInfo_BuyerId.disable();
      this.f.DMOLot_BInfo_BuyerName.disable();
      this.f.DMOLot_BInfo_BuyerBrc.disable();
      this.f.DMOLot_BInfo_BuyerPic.disable();

      this.f.DMOLot_BInfo_BuyerId.patchValue('');
      this.f.DMOLot_BInfo_BuyerName.patchValue('');
      this.f.DMOLot_BInfo_BuyerBrc.patchValue('');
      this.f.DMOLot_BInfo_BuyerPic.patchValue('');

      // set turnover fields as 0 value
      this.f.DMOLot_LotInfo_TurnovAUD.patchValue(0);
      this.f.DMOLot_LotInfo_GST.patchValue(0);
      this.f.DMOLot_LotInfo_TurnoverGs.patchValue(0);
    } else {
      this.f.DMOLot_BInfo_BuyerId.enable();
      this.f.DMOLot_BInfo_BuyerName.enable();
      this.f.DMOLot_BInfo_BuyerBrc.enable();
      this.f.DMOLot_BInfo_BuyerPic.enable();
    }

    this.f.DMOLot_BInfo_BuyerId.markAsTouched();
    this.f.DMOLot_BInfo_BuyerId.markAsDirty();

    this.f.DMOLot_BInfo_BuyerName.markAsTouched();
    this.f.DMOLot_BInfo_BuyerName.markAsDirty();

    this.f.DMOLot_BInfo_BuyerBrc.markAsTouched();
    this.f.DMOLot_BInfo_BuyerBrc.markAsDirty();

    this.f.DMOLot_BInfo_BuyerPic.markAsTouched();
    this.f.DMOLot_BInfo_BuyerPic.markAsDirty();

    this.f.DMOLot_LotInfo_TurnovAUD.markAsTouched();
    this.f.DMOLot_LotInfo_TurnovAUD.markAsDirty();

    this.f.DMOLot_LotInfo_GST.markAsTouched();
    this.f.DMOLot_LotInfo_GST.markAsDirty();

    this.f.DMOLot_LotInfo_TurnoverGs.markAsTouched();
    this.f.DMOLot_LotInfo_TurnoverGs.markAsDirty();
  }
  handleBuyerCartage(isBuyerCartage: boolean) {
    if (isBuyerCartage) {
      this.f.DMOLot_VInfo_VendorId.disable();
      this.f.DMOLot_VInfo_VendorNam.disable();
      this.f.DMOLot_VInfo_VendorBrc.disable();
      this.f.DMOLot_VInfo_VendorPic.disable();

      this.f.DMOLot_VInfo_VendorId.patchValue('');
      this.f.DMOLot_VInfo_VendorNam.patchValue('');
      this.f.DMOLot_VInfo_VendorBrc.patchValue('');
      this.f.DMOLot_VInfo_VendorPic.patchValue('');

      this.f.DMOLot_VInfo_AcSaleRef.disable();
      this.f.DMOLot_VInfo_AcSaleRef.patchValue('');
      this.VendorCompanyCode = '-1';
    } else {
      this.f.DMOLot_VInfo_VendorId.enable();
      this.f.DMOLot_VInfo_VendorNam.enable();
      this.f.DMOLot_VInfo_VendorBrc.enable();
      this.f.DMOLot_VInfo_VendorPic.enable();
      this.f.DMOLot_VInfo_AcSaleRef.enable();
      if (this.VendorCompanyCode == '-1') {
        this.VendorCompanyCode = '';
      }
    }
    this.f.DMOLot_VInfo_VendorId.markAsTouched();
    this.f.DMOLot_VInfo_VendorId.markAsDirty();

    this.f.DMOLot_VInfo_VendorNam.markAsTouched();
    this.f.DMOLot_VInfo_VendorNam.markAsDirty();

    this.f.DMOLot_VInfo_VendorBrc.markAsTouched();
    this.f.DMOLot_VInfo_VendorBrc.markAsDirty();

    this.f.DMOLot_VInfo_VendorPic.markAsTouched();
    this.f.DMOLot_VInfo_VendorPic.markAsDirty();

    this.f.DMOLot_VInfo_AcSaleRef.markAsTouched();
    this.f.DMOLot_VInfo_AcSaleRef.markAsDirty();

    this.enableDisableControl(!isBuyerCartage);
  }
  handleVendorCartage(isVendorCartage: boolean) {
    if (isVendorCartage) {
      this.f.DMOLot_BInfo_BuyerId.disable();
      this.f.DMOLot_BInfo_BuyerName.disable();
      this.f.DMOLot_BInfo_BuyerBrc.disable();
      this.f.DMOLot_BInfo_BuyerPic.disable();

      this.f.DMOLot_BInfo_BuyerId.patchValue('');
      this.f.DMOLot_BInfo_BuyerName.patchValue('');
      this.f.DMOLot_BInfo_BuyerBrc.patchValue('');
      this.f.DMOLot_BInfo_BuyerPic.patchValue('');

      this.f.DMOLot_BInfo_InvoiceRef.disable();
      this.f.DMOLot_BInfo_SetIntBBReb.disable();
      this.f.DMOLot_BInfo_Rate.disable();

      this.f.DMOLot_BInfo_InvoiceRef.patchValue('');
      this.f.DMOLot_BInfo_SetIntBBReb.patchValue('');
      this.f.DMOLot_BInfo_Rate.patchValue('');
      this.BuyerCompanyCode = '-1';
    } else {
      this.f.DMOLot_BInfo_BuyerId.enable();
      this.f.DMOLot_BInfo_BuyerName.enable();
      this.f.DMOLot_BInfo_BuyerBrc.enable();
      this.f.DMOLot_BInfo_BuyerPic.enable();

      this.f.DMOLot_BInfo_InvoiceRef.enable();
      this.f.DMOLot_BInfo_SetIntBBReb.enable();
      this.f.DMOLot_BInfo_Rate.enable();
      if(this.BuyerCompanyCode == '-1'){
      this.BuyerCompanyCode = '';
      }
    }
    this.f.DMOLot_BInfo_BuyerId.markAsTouched();
    this.f.DMOLot_BInfo_BuyerId.markAsDirty();

    this.f.DMOLot_BInfo_BuyerName.markAsTouched();
    this.f.DMOLot_BInfo_BuyerName.markAsDirty();

    this.f.DMOLot_BInfo_BuyerBrc.markAsTouched();
    this.f.DMOLot_BInfo_BuyerBrc.markAsDirty();

    this.f.DMOLot_BInfo_BuyerPic.markAsTouched();
    this.f.DMOLot_BInfo_BuyerPic.markAsDirty();

    this.f.DMOLot_BInfo_InvoiceRef.markAsTouched();
    this.f.DMOLot_BInfo_SetIntBBReb.markAsTouched();
    this.f.DMOLot_BInfo_Rate.markAsTouched();
    this.f.DMOLot_BInfo_InvoiceRef.markAsDirty();
    this.f.DMOLot_BInfo_SetIntBBReb.markAsDirty();
    this.f.DMOLot_BInfo_Rate.markAsDirty();
    this.enableDisableControl(!isVendorCartage);
  }

  enableDisableControl(isEnable, isSetBlank = true) {
    if (isEnable) {
      this.f.DMOLot_LotInfo_LotNum.enable();
      this.f.DMOLot_LotInfo_Qnty.enable();
      this.f.DMOLot_LotInfo_Brd.enable();
      this.f.DMOLot_LotInfo_Price$PHd.enable();
      this.f.DMOLot_LotInfo_PriceCPKg.enable();
      this.f.DMOLot_LotInfo_WtKg.enable();
      this.f.DMOLot_LotInfo_TurnovAUD.enable();
      this.f.DMOLot_LotInfo_Sex.enable();
      this.f.DMOLot_LotInfo_PaintMk.enable();
      this.f.DMOLot_LotInfo_ContractId.enable();
      this.f.DMOLot_LotInfo_HGP.enable();
      this.f.DMOLot_LotInfo_TransClaim.enable();
      this.f.DMOLot_LotInfo_TrnsClmBy.enable();
      this.f.DMOLot_LotInfo_TrnsClmQnt.enable();
      this.f.DMOLot_LotInfo_TrnsClmVal.enable();
      this.f.DMOLot_LotInfo_TrnsClmRsn.enable();
    } else {
      this.f.DMOLot_LotInfo_LotNum.disable();
      this.f.DMOLot_LotInfo_Qnty.disable();
      this.f.DMOLot_LotInfo_Brd.disable();
      this.f.DMOLot_LotInfo_Price$PHd.disable();
      this.f.DMOLot_LotInfo_PriceCPKg.disable();
      this.f.DMOLot_LotInfo_WtKg.disable();
      this.f.DMOLot_LotInfo_TurnovAUD.disable();
      this.f.DMOLot_LotInfo_Sex.disable();
      this.f.DMOLot_LotInfo_PaintMk.disable();
      this.f.DMOLot_LotInfo_ContractId.disable();
      this.f.DMOLot_LotInfo_HGP.disable();
      this.f.DMOLot_LotInfo_TransClaim.disable();
      this.f.DMOLot_LotInfo_TrnsClmBy.disable();
      this.f.DMOLot_LotInfo_TrnsClmQnt.disable();
      this.f.DMOLot_LotInfo_TrnsClmVal.disable();
      this.f.DMOLot_LotInfo_TrnsClmRsn.disable();
      if (isSetBlank) {
        this.f.DMOLot_LotInfo_LotNum.patchValue('');
        this.f.DMOLot_LotInfo_Qnty.patchValue('');
        this.f.DMOLot_LotInfo_Brd.patchValue('');
        this.f.DMOLot_LotInfo_Price$PHd.patchValue('');
        this.f.DMOLot_LotInfo_PriceCPKg.patchValue('');
        this.f.DMOLot_LotInfo_WtKg.patchValue('');
        this.f.DMOLot_LotInfo_TurnovAUD.patchValue('');
        this.f.DMOLot_LotInfo_Sex.patchValue('');
        this.f.DMOLot_LotInfo_PaintMk.patchValue('');
        this.f.DMOLot_LotInfo_ContractId.patchValue('');
        this.f.DMOLot_LotInfo_HGP.patchValue('');
        this.f.DMOLot_LotInfo_TransClaim.patchValue('');
        this.f.DMOLot_LotInfo_TrnsClmBy.patchValue('');
        this.f.DMOLot_LotInfo_TrnsClmQnt.patchValue('');
        this.f.DMOLot_LotInfo_TrnsClmVal.patchValue('');
        this.f.DMOLot_LotInfo_TrnsClmRsn.patchValue('');

        this.f.DMOLot_LotInfo_LotNum.markAsTouched();
        this.f.DMOLot_LotInfo_Qnty.markAsTouched();
        this.f.DMOLot_LotInfo_Brd.markAsTouched();
        this.f.DMOLot_LotInfo_Price$PHd.markAsTouched();
        this.f.DMOLot_LotInfo_PriceCPKg.markAsTouched();
        this.f.DMOLot_LotInfo_WtKg.markAsTouched();
        this.f.DMOLot_LotInfo_TurnovAUD.markAsTouched();
        this.f.DMOLot_LotInfo_Sex.markAsTouched();
        this.f.DMOLot_LotInfo_PaintMk.markAsTouched();
        this.f.DMOLot_LotInfo_ContractId.markAsTouched();
        this.f.DMOLot_LotInfo_HGP.markAsTouched();
        this.f.DMOLot_LotInfo_TransClaim.markAsTouched();
        this.f.DMOLot_LotInfo_TrnsClmBy.markAsTouched();
        this.f.DMOLot_LotInfo_TrnsClmQnt.markAsTouched();
        this.f.DMOLot_LotInfo_TrnsClmVal.markAsTouched();
        this.f.DMOLot_LotInfo_TrnsClmRsn.markAsTouched();

        this.f.DMOLot_LotInfo_LotNum.markAsDirty();
        this.f.DMOLot_LotInfo_Qnty.markAsDirty();
        this.f.DMOLot_LotInfo_Brd.markAsDirty();
        this.f.DMOLot_LotInfo_Price$PHd.markAsDirty();
        this.f.DMOLot_LotInfo_PriceCPKg.markAsDirty();
        this.f.DMOLot_LotInfo_WtKg.markAsDirty();
        this.f.DMOLot_LotInfo_TurnovAUD.markAsDirty();
        this.f.DMOLot_LotInfo_Sex.markAsDirty();
        this.f.DMOLot_LotInfo_PaintMk.markAsDirty();
        this.f.DMOLot_LotInfo_ContractId.markAsDirty();
        this.f.DMOLot_LotInfo_HGP.markAsDirty();
        this.f.DMOLot_LotInfo_TransClaim.markAsDirty();
        this.f.DMOLot_LotInfo_TrnsClmBy.markAsDirty();
        this.f.DMOLot_LotInfo_TrnsClmQnt.markAsDirty();
        this.f.DMOLot_LotInfo_TrnsClmVal.markAsDirty();
        this.f.DMOLot_LotInfo_TrnsClmRsn.markAsDirty();
      }
    }
  }
  accept_only_zero(event) {
    if (this.isUnsoldLots) {
      return event.charCode === 48;
    }
  }

  ValidateAlphanumeric(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || (charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123)) {
      return true;
    }
    return false;
  }

  getQuantity(event: any) {
    if (this.isReversal && (+event.target.value < 0 || event.target.value == '')) {
      this.msg.showMessage('Warning', {
        body: 'Quantity should cannot be blank during sale reversal.',
      });
      this.lotDetailForm.get('DMOLot_LotInfo_Qnty').patchValue(this.originalQuantityValue);
    }
    this.calculationWeightQuanityCKGPricesHead('quantity');
    this.cdr.detectChanges();
  }

  getPriceHead(event: NgbTypeaheadSelectItemEvent) {
    this.calculationWeightQuanityCKGPricesHead('priceperhead');
    this.cdr.detectChanges();
  }

  getPriceKg(event: NgbTypeaheadSelectItemEvent) {
    this.calculationWeightQuanityCKGPricesHead('ckg');
    this.cdr.detectChanges();
  }

  getWaightKg(event: NgbTypeaheadSelectItemEvent) {
    this.calculationWeightQuanityCKGPricesHead('weight');
    this.cdr.detectChanges();
  }
  getturnover(event: NgbTypeaheadSelectItemEvent) {
    this.calculationWeightQuanityCKGPricesHead('turnover');
    this.cdr.detectChanges();
  }

  get f() {
    return this.lotDetailForm.controls;
  }

  async onSubmit() {
    this.submitted = true;
    if (this.lotDetailForm.get('DMOLot_LotInfo_TransClaim').value == true && this.lotDetailForm.invalid) {
      return;
    }
    if (this.ValidateProductNameMessage == 'Product name is not exist') {
      return;
    }
    this.lotDetailForm.controls.DMOLot_LotInfo_GSTRate.markAsDirty();
    this.lotDetailForm.controls.DMOLot_LotInfo_GSTRate.markAsTouched();
    if (this.lotFeesChargesGrid.newRow.FeeTransactionID !== null) {
      this.msg.showMessage('Warning', {
        body: 'Lot fees and Charges data grid contains unsaved changes. Please update this item to proceed',
      });
      return;
    }
    if (this.lotFeesChargesGrid.data) {
      this.lotFeesChargesGrid.data.forEach((element) => {
        if (typeof element.Description === 'object') {
          element.Description = element.Description['Description'];
        }
      });
    }
    this.ValidateVendorIdMessage = '';
    this.ValidateVendorNameMessage = '';
    this.ValidateBuyerIdMessage = '';
    this.ValidateBuyerNameMessage = '';
    this.ValidateProductNameMessage = '';
    this.ValidateProductDescriptionMessage = '';
    this.ValidateBreedMessage = '';
    this.ValidatBuyerBranchMessage = '';
    this.ValidateVendorBranchMessage = '';
    let formValue: any;
    let validateLotData: any;
    if (this.isNew) {
      formValue = this.lotDetailForm.getRawValue();
      validateLotData = {
        VendorId:
          this.vendorId.nativeElement.value && this.vendorId.nativeElement.value.indexOf('-') > 0
            ? this.vendorId.nativeElement.value.split('-')[1]
            : this.vendorId.nativeElement.value,
        VendorName: this.vendorName.nativeElement.value,
        BuyerId:
          this.buyerId.nativeElement.value && this.buyerId.nativeElement.value.indexOf('-') > 0
            ? this.buyerId.nativeElement.value.split('-')[1]
            : this.buyerId.nativeElement.value,
        BuyerName: this.buyerName.nativeElement.value,
        ProductName: this.productName.nativeElement.value,
        ProductDescription: this.productDescription.nativeElement.value,
        BreedName: this.breedName.nativeElement.value,
        VendorBranchName:
          formValue.DMOLot_VInfo_VendorBrc == undefined
            ? ''
            : formValue.DMOLot_VInfo_VendorBrc.dmobranchbrname == undefined
            ? formValue.DMOLot_VInfo_VendorBrc
            : formValue.DMOLot_VInfo_VendorBrc.dmobranchbrname + ' (' + formValue.DMOLot_VInfo_VendorBrc.dmobranchbrcode + ')',
        BuyerBranchName:
          formValue.DMOLot_BInfo_BuyerBrc == undefined
            ? ''
            : formValue.DMOLot_BInfo_BuyerBrc.dmobranchbrname == undefined
            ? formValue.DMOLot_BInfo_BuyerBrc
            : formValue.DMOLot_BInfo_BuyerBrc.dmobranchbrname + ' (' + formValue.DMOLot_BInfo_BuyerBrc.dmobranchbrcode + ')',
      };
    } else {
      formValue = this.dmoControlService.getDirtyValues(this.lotDetailForm);
      const valueData: any = {};
      Object.keys(formValue).forEach((key) => {
        if (formValue[key] == null) {
          valueData[key] = '';
        } else {
          valueData[key] = formValue[key];
          if (key === 'DMOLot_BInfo_BuyerPic' || key === 'DMOLot_VInfo_VendorPic') {
            valueData[key] = valueData[key].toString().toUpperCase();
          }
        }
      });
      validateLotData = {
        VendorId:
          this.vendorId.nativeElement.value && this.vendorId.nativeElement.value.indexOf('-') > 0
            ? this.vendorId.nativeElement.value.split('-')[1]
            : this.vendorId.nativeElement.value,
        VendorName: this.vendorName.nativeElement.value,
        BuyerId:
          this.buyerId.nativeElement.value && this.buyerId.nativeElement.value.indexOf('-') > 0
            ? this.buyerId.nativeElement.value.split('-')[1]
            : this.buyerId.nativeElement.value,
        BuyerName: this.buyerName.nativeElement.value,
        ProductName: this.productName.nativeElement.value,
        ProductDescription: this.productDescription.nativeElement.value,
        BreedName: this.breedName.nativeElement.value,
        VendorBranchName:
          valueData.DMOLot_VInfo_VendorBrc == undefined
            ? ''
            : valueData.DMOLot_VInfo_VendorBrc.dmobranchbrname == undefined
            ? valueData.DMOLot_VInfo_VendorBrc
            : valueData.DMOLot_VInfo_VendorBrc.dmobranchbrname + ' (' + valueData.DMOLot_VInfo_VendorBrc.dmobranchbrcode + ')',
        BuyerBranchName:
          valueData.DMOLot_BInfo_BuyerBrc == undefined
            ? ''
            : valueData.DMOLot_BInfo_BuyerBrc.dmobranchbrname == undefined
            ? valueData.DMOLot_BInfo_BuyerBrc
            : valueData.DMOLot_BInfo_BuyerBrc.dmobranchbrname + ' (' + valueData.DMOLot_BInfo_BuyerBrc.dmobranchbrcode + ')',
      };
    }

    const sb = this.lotSearchService.validateLotSummaryRecord(validateLotData).subscribe((data) => {
      this.flag = false;
      if (data[0].VendorIdMessage === 'VendorId is Not Exist') {
        this.flag = true;
        this.ValidateVendorIdMessage = 'Vendor Id is not exist';
      }
      if (data[0].VendorNameMessage === 'Vendor name is Not Exist') {
        this.flag = true;
        this.ValidateVendorNameMessage = 'Vendor name is not exist';
      }

      if (data[0].BuyerIdMessage === 'BuyerId is Not Exist') {
        this.flag = true;
        this.ValidateBuyerIdMessage = 'Buyer Id is not exist';
      }

      if (data[0].BuyerNameMessage === 'Buyer name is Not Exist') {
        this.flag = true;
        this.ValidateBuyerNameMessage = 'Buyer name is not exist';
      }

      if (data[0].ProductNameMessage === 'Product name is Not Exist') {
        this.flag = true;
        this.ValidateProductNameMessage = 'Product name is not exist';
      }
      if (data[0].BreedMessage === 'Breed name is Not Exist') {
        this.flag = true;
        this.ValidateBreedMessage = 'Breed name is not exist';
      }
      if (data[0].BuyerBranchMessage === 'Buyer branch is Not Exist') {
        this.flag = true;
        this.ValidateBuyerIdMessage = 'Buyer branch is not exist';
      }
      if (data[0].VendorBranchMessage === 'Vendor branch is Not Exist') {
        this.flag = true;
        this.ValidateVendorBranchMessage = 'Vendor branch is not exist';
      }

      if (this.flag) {
        return false;
      }
      if (this.isNew) {
        formValue = this.lotDetailForm.getRawValue();

        Object.keys(formValue).forEach((key) => {
          if (formValue[key] == null || formValue[key] === '') {
            delete formValue[key];
          }
          if (formValue[key] && (key === 'DMOLot_BInfo_BuyerPic' || key === 'DMOLot_VInfo_VendorPic')) {
            formValue[key] = formValue[key].toString().toUpperCase();
          }
        });
        if (formValue.DMOLot_VInfo_VendorBrc && formValue.DMOLot_VInfo_VendorBrc.dmobranchbrcode !== undefined) {
          formValue.DMOLot_VInfo_VendorBrc =
            formValue.DMOLot_VInfo_VendorBrc.dmobranchbrname + ' (' + formValue.DMOLot_VInfo_VendorBrc.dmobranchbrcode + ')';
        }
        if (formValue.DMOLot_BInfo_BuyerBrc && formValue.DMOLot_BInfo_BuyerBrc.dmobranchbrcode !== undefined) {
          formValue.DMOLot_BInfo_BuyerBrc =
            formValue.DMOLot_BInfo_BuyerBrc.dmobranchbrname + ' (' + formValue.DMOLot_BInfo_BuyerBrc.dmobranchbrcode + ')';
        }
        if (formValue.DMOLot_LotInfo_HGP == undefined) {
          formValue.DMOLot_LotInfo_HGP = false;
        }

        if (this.VendorCompanyCode) {
          formValue.DOMLot_VInfo_CompCode = this.VendorCompanyCode;
        }
        if (this.BuyerCompanyCode) {
          formValue.DMOLot_BInfo_CompCode = this.BuyerCompanyCode;
        }
        if (formValue.DMOLot_VInfo_VendorId && formValue.DMOLot_VInfo_VendorId.indexOf('-') > 0) {
          formValue.DMOLot_VInfo_VendorId = formValue.DMOLot_VInfo_VendorId.split('-')[1];
        }
        if (formValue.DMOLot_BInfo_BuyerId && formValue.DMOLot_BInfo_BuyerId.indexOf('-') > 0) {
          formValue.DMOLot_BInfo_BuyerId = formValue.DMOLot_BInfo_BuyerId.split('-')[1];
        }
        /* Entity Start 26 Feb Roshan */
        if (!formValue.DMOLot_VInfo_VendorId) {
          formValue.DOMLot_VInfo_CompCode = '';
        }
        if (!formValue.DMOLot_BInfo_BuyerId) {
          formValue.DMOLot_BInfo_CompCode = '';
        }
        /* Entity End 26 Feb Roshan */
        const submitData: any = {
          ProcessName: this.processName,
          UserName: this.currentUser.UserName,
          TriggerName: 'TRGR_LotPreProcessing_LotSave',
          ParentTransactionID: this.parentId,
          Data: [formValue],
        };
        const lotFee: any = {
          TransactionID: this.transactionId,
          Items: [...this.lotFeesChargesGrid.data],
        };
        if (lotFee && lotFee.Items) {
          lotFee.Items.map((x) => {
            x.ThirdPartyAccount = x.ThirdPartyAccount.indexOf('-') > 0 ? x.ThirdPartyAccount.split('-')[1] : x.ThirdPartyAccount;
            x.ThirdPartyCompanyCode = x.ThirdPartyAccount.indexOf('-') > 0 ? x.ThirdPartyAccount.split('-')[0] : x.ThirdPartyCompanyCode;
          });
          let FeeType = '';
          if (this.VendorCartage.indexOf(this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value) > -1) {
            FeeType = 'Buyer';
          } else if (this.BuyerCartage.indexOf(this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value) > -1) {
            FeeType = 'Vendor';
          }
          if (FeeType != '') {
            lotFee.Items.filter((p) => p.ChargedTo == FeeType).map((x) => {
              x.IsDeleted = true;
            });
          }
        }
        const lotProcessData = {
          applicationData: submitData,
          saveLotFeesChargesRequest: lotFee,
          lotChangesRequest: null,
          // isAgencyCommissionCalc: false,
          recalcVendorCommission: this.RecalcVendorCommission,
          recalcCharges: this.RecalcCharges,
          saleCompanyCode: this.updateSaleCompanyCode(this.VendorCompanyCode, this.BuyerCompanyCode),
          saleTransactionID: this.parentId,
          lotTransactionID: null,
          isReversal: this.isReversal,
          isCalcBuyerBranchRebate: false,
        };
        if (
          this.stage === 'Invoiced' &&
          this.buyerId.nativeElement.value &&
          Object.keys(formValue).some((x) => this.lotservice.isChangeValueForNameTaxAmd(x))
        ) {
          lotProcessData.lotChangesRequest = { LotTransactionID: this.transactionId, BuyerId: this.buyerId.nativeElement.value };
        }
        const sb = this.saleServices.ProcessLot(lotProcessData).subscribe((response) => {
          this.transactionId = response.result.transactionId;
          this.toastrService.success('Data saved successfully');
          this.RecalcVendorCommission = false;
          this.RecalcCharges = false;
          this.HobbyFarmer = '';
          this.GSTFlag = '';
          this.router.navigate([`/crm/sales/${this.parentId}/lots`, this.transactionId]);
        });
      } else {
        let formValue = this.dmoControlService.getDirtyValues(this.lotDetailForm);
        const valueData: any = {};
        Object.keys(formValue).forEach((key) => {
          if (formValue[key] == null) {
            valueData[key] = '';
          } else {
            valueData[key] = formValue[key];
            if (key === 'DMOLot_BInfo_BuyerPic' || key === 'DMOLot_VInfo_VendorPic') {
              valueData[key] = valueData[key].toString().toUpperCase();
            }
          }
        });
        if (valueData.DMOLot_VInfo_VendorBrc && valueData.DMOLot_VInfo_VendorBrc.dmobranchbrcode !== undefined) {
          valueData.DMOLot_VInfo_VendorBrc =
            valueData.DMOLot_VInfo_VendorBrc.dmobranchbrname + ' (' + valueData.DMOLot_VInfo_VendorBrc.dmobranchbrcode + ')';
        }
        if (valueData.DMOLot_BInfo_BuyerBrc && valueData.DMOLot_BInfo_BuyerBrc.dmobranchbrcode !== undefined) {
          valueData.DMOLot_BInfo_BuyerBrc =
            valueData.DMOLot_BInfo_BuyerBrc.dmobranchbrname + ' (' + valueData.DMOLot_BInfo_BuyerBrc.dmobranchbrcode + ')';
        }
        if (this.VendorCompanyCode) {
          valueData.DOMLot_VInfo_CompCode = this.VendorCompanyCode;
        }
        if (this.BuyerCompanyCode) {
          valueData.DMOLot_BInfo_CompCode = this.BuyerCompanyCode;
        }
        if (valueData.DMOLot_VInfo_VendorId && valueData.DMOLot_VInfo_VendorId.indexOf('-') > 0) {
          valueData.DMOLot_VInfo_VendorId = valueData.DMOLot_VInfo_VendorId.split('-')[1];
        }
        if (valueData.DMOLot_BInfo_BuyerId && valueData.DMOLot_BInfo_BuyerId.indexOf('-') > 0) {
          valueData.DMOLot_BInfo_BuyerId = valueData.DMOLot_BInfo_BuyerId.split('-')[1];
        }
        /* Entity Start 26 Feb Roshan */
        if (valueData.DMOLot_VInfo_VendorId && (valueData.DMOLot_VInfo_VendorId == '' || valueData.DMOLot_VInfo_VendorId == null)) {
          valueData.DOMLot_VInfo_CompCode = '';
        }
        if (valueData.DMOLot_BInfo_BuyerId && (valueData.DMOLot_BInfo_BuyerId == '' || valueData.DMOLot_BInfo_BuyerId == null)) {
          valueData.DMOLot_BInfo_CompCode = '';
        }
        if (this.VendorCompanyCode == '-1') {
          valueData.DOMLot_VInfo_CompCode = '';
        }
        if (this.BuyerCompanyCode == '-1') {
          valueData.DMOLot_BInfo_CompCode = '';
        }
        /* Entity End 26 Feb Roshan */
        const submitData: any = {
          Identifier: {
            Name: null,
            Value: null,
            TrnsctnID: this.transactionId,
          },
          ProcessName: this.processName,
          TriggerName: 'TRGR_LotPreProcessing_LotSave',
          UserName: this.currentUser.UserName,
          ParentTransactionID: this.parentId,
          Data: [valueData],
        };

        let lotFee = {
          TransactionID: null,
          Items: null,
        };
        let isLotFeeChanges = false;
        if (
          this.isFeesCalculated ||
          this.lotFeesChargesGrid.isInlineEdit ||
          this.lotFeesChargesGrid.data.filter((row) => row.IsManual === true).length > 0
        ) {
          lotFee.TransactionID = this.transactionId;
          lotFee.Items = [...this.lotFeesChargesGrid.data];
          isLotFeeChanges =
            this.lotFeesChargesGrid.data.filter((row) => row.ChargedTo === 'Buyer' && row.IsManual === true && row.IsNew == true).length >
            0;
          if (isLotFeeChanges == false) {
            isLotFeeChanges =
              this.lotFeesChargesGrid.data.filter((row) => row.ChargedTo === 'Buyer' && row.IsManual === true && row.IsDeleted == true).length >
              0;
          }
        } else {
          let FeeType = '';
          if (this.VendorCartage.indexOf(this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value) > -1) {
            FeeType = 'Buyer';
          } else if (this.BuyerCartage.indexOf(this.lotDetailForm.get('DMOLot_LotInfo_Pdct').value) > -1) {
            FeeType = 'Vendor';
          }
          if (FeeType != '') {
            // lotFee.TransactionID = this.transactionId;
            // lotFee.Items = [...this.lotFeesChargesGrid.data];
            // lotFee.Items.filter(p=>p.ChargedTo == FeeType).map((x) => {
            //   x.IsDeleted = true;
            //   x.IsManual = true;
            // });
            // this.isCalcFeesFieldsChanged = true;
          } else {
            lotFee = null;
          }
        }
        if (lotFee && lotFee.Items) {
          lotFee.Items.map((x) => {
            x.ThirdPartyAccount = !!x.ThirdPartyAccount
              ? x.ThirdPartyAccount.indexOf('-') > 0
                ? x.ThirdPartyAccount.split('-')[1]
                : x.ThirdPartyAccount
              : '';
            x.ThirdPartyCompanyCode = !!x.ThirdPartyAccount
              ? x.ThirdPartyAccount.indexOf('-') > 0
                ? x.ThirdPartyAccount.split('-')[0]
                : x.ThirdPartyCompanyCode
              : '';
          });
        }
        const lotProcessData = {
          applicationData: submitData,
          saveLotFeesChargesRequest: lotFee,
          lotChangesRequest: null,
          recalcVendorCommission: this.RecalcVendorCommission,
          recalcCharges: this.RecalcCharges,
          saleCompanyCode: this.updateSaleCompanyCode(this.VendorCompanyCode, this.BuyerCompanyCode),
          saleTransactionID: this.parentId,
          lotTransactionID: null,
          isReversal: this.isReversal,
          isCalcFeesFieldsChanged: false,
          isCalcBuyerBranchRebate: false,
        };
        if (
          this.stage === 'Invoiced' &&
          (isLotFeeChanges || Object.keys(valueData).some((x) => this.lotservice.isChangeValueForNameTaxAmd(x)))
        ) {
          if (
            this.applicationData.DataInformation['dmolotbinfobuyerid'] &&
            this.applicationData.DataInformation['dmolotbinfobuyerid'].DMOVAL
          ) {
            let statusCheck = false;
            Object.keys(valueData).forEach((dmoName) => {
              if (this.lotInformations[dmoName] != valueData[dmoName] && this.lotservice.isChangeValueForNameTaxAmd(dmoName)) {
                statusCheck = true;
              }
            });
            if (statusCheck || isLotFeeChanges) {
              let newBuyer = this.buyerId.nativeElement.value;
              newBuyer = newBuyer && newBuyer.indexOf('-') > 0 ? newBuyer.split('-')[1] : newBuyer;
              // if (newBuyer == this.applicationData.DataInformation['dmolotbinfobuyerid'].DMOVAL) {
              //   newBuyer = null;
              // }
              lotProcessData.lotChangesRequest = {
                LotTransactionID: this.transactionId,
                BuyerId: this.applicationData.DataInformation['dmolotbinfobuyerid'].DMOVAL,
                NewBuyerId: newBuyer,
              };
            }
          }
        }

        if (
          this.isCalcFeesFieldsChanged ||
          (this.isFeesCalculated && this.lotFeesChargesGrid.data.filter((row) => row.IsManual === false).length > 0)
        ) {
          lotProcessData.isCalcFeesFieldsChanged = true;
        } else if (this.isCalcBuyerBranchRebate) {
          lotProcessData.isCalcBuyerBranchRebate = true;
        }

        const sb = this.saleServices.ProcessLot(lotProcessData).subscribe((response) => {
          this.toastrService.success('Data updated successfully');
          this.HobbyFarmer = '';
          this.GSTFlag = '';
          this.isLotSubmit = true;
          this.isCalcFeesFieldsChanged = false;
          this.isCalcBuyerBranchRebate = false;
          this.RecalcVendorCommission = false;
          this.RecalcCharges = false;
          this.checkGSTApplicable();
          this.lotFeesChargesGrid.ngAfterViewInit();
        });

        this.subscriptions.push(sb);
      }
    });
    this.subscriptions.push(sb);
  }

  isValid(val: any, isInculdeZero: any = false) {
    return val != null && val !== '';
  }

  calculationWeightQuanityCKGPricesHead(controlName: string) {
    this.isCalculationDone = true;
    this.GstRate = this.GstRateChanged;
    if (this.isGSTApplicable == false || this.isVendorGSTApplicable == false) {
      this.GstRate = 0;
    }
    const priceType = this.lotDetailForm.get('DMOLot_LotInfo_PriceType').value;
    switch (controlName) {
      case 'quantity':
      case 'priceperhead':
        this.DMOLot_PriceHead = this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').value;
        this.DMOLot_Qnty = this.lotDetailForm.get('DMOLot_LotInfo_Qnty').value;
        this.DMOLOT_PriceKg = this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').value;
        this.DMOLOT_Weight = this.lotDetailForm.get('DMOLot_LotInfo_WtKg').value;
        this.DMOLOT_TURNOVER = this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').value;
        if (this.isValid(this.DMOLot_Qnty) && this.isValid(this.DMOLot_PriceHead) && (!this.isValid(priceType) || priceType == '$/head')) {
          this.setValueAndMarkDarty('DMOLot_LotInfo_TurnovAUD', this.DMOLot_Qnty * this.DMOLot_PriceHead);
          this.DMOLOT_TURNOVER = this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').value;
          if (this.isValid(this.DMOLOT_Weight) && !this.isValid(this.DMOLOT_PriceKg)) {
            if (Number(this.DMOLOT_Weight) > 0)
              this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_Weight);
            else this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', 0);
          } else if (
            this.isValid(this.DMOLOT_Weight) &&
            controlName == 'priceperhead' &&
            (!this.isValid(priceType) || priceType == '$/head')
          ) {
            if (Number(this.DMOLOT_Weight) > 0)
              this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_Weight);
            else this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', 0);
          } else if (this.isValid(this.DMOLOT_PriceKg) && (!this.isValid(priceType) || priceType == '$/head')) {
            if (Number(this.DMOLOT_PriceKg) > 0)
              this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_PriceKg);
            else this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', 0.0);
          }
        } else if (this.isValid(this.DMOLOT_TURNOVER) && this.isValid(this.DMOLot_Qnty) && controlName != 'priceperhead') {
          if (Number(this.DMOLot_Qnty) > 0 && !this.isReversal) {
            this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', this.DMOLOT_TURNOVER / this.DMOLot_Qnty);
          } else if (
            this.isValid(this.DMOLot_Qnty) &&
            this.applicationData.DataInformation.dmolotlotinfowtkg &&
            this.isReversal &&
            this.isValid(this.DMOLOT_Weight) &&
            priceType === 'c/kg'
          ) {
            if (Number(this.DMOLot_Qnty) <= this.originalQuantityValue) {
              const qntPerc = (Number(this.DMOLot_Qnty) * 100) / this.originalQuantityValue;
              const infowtkg = (this.applicationData.DataInformation.dmolotlotinfowtkg.DMOVAL * qntPerc) / 100;
              this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', infowtkg);
              const turnover = (infowtkg * this.DMOLOT_PriceKg) / 100;
              this.setValueAndMarkDarty('DMOLot_LotInfo_TurnovAUD', turnover);
            }
          } else this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', 0.0);
        }
        if (controlName == 'priceperhead') {
          if (
            this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').value != null &&
            this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').value != ''
          ) {
            this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').disable();
            this.lotDetailForm.get('DMOLot_LotInfo_PriceType').reset('$/head');
            this.lotDetailForm.get('DMOLot_LotInfo_PriceType').markAsDirty();
            this.lotDetailForm.get('DMOLot_LotInfo_PriceType').updateValueAndValidity();
            this.priceCKG = false;
            this.price$ph = true;
          } else {
            this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').enable();
            this.priceCKG = true;
            this.price$ph = false;
          }
        }
        break;
      case 'ckg':
      case 'weight':
        this.DMOLot_PriceHead = this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').value;
        this.DMOLOT_PriceKg = this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').value;
        this.DMOLOT_Weight = this.lotDetailForm.get('DMOLot_LotInfo_WtKg').value;
        this.DMOLot_Qnty = this.lotDetailForm.get('DMOLot_LotInfo_Qnty').value;
        this.DMOLOT_TURNOVER = this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').value;
        if (
          this.isValid(this.DMOLOT_PriceKg, true) &&
          this.isValid(this.DMOLOT_Weight, true) &&
          (!this.isValid(priceType) || priceType == 'c/kg')
        ) {
          this.setValueAndMarkDarty('DMOLot_LotInfo_TurnovAUD', (this.DMOLOT_PriceKg * this.DMOLOT_Weight) / 100);
          this.DMOLOT_TURNOVER = this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').value;
          if (
            this.isValid(this.DMOLot_Qnty) &&
            this.isValid(this.DMOLOT_TURNOVER) &&
            !this.isValid(this.DMOLot_PriceHead) &&
            (!this.isValid(priceType) || priceType == 'c/kg')
          ) {
            if (Number(this.DMOLot_Qnty) > 0)
              this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', this.DMOLOT_TURNOVER / this.DMOLot_Qnty);
            else this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', 0.0);
          } else if (this.isValid(this.DMOLot_Qnty) && (this.isValid(priceType) || priceType == 'c/kg')) {
            if (Number(this.DMOLot_Qnty) > 0)
              this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', this.DMOLOT_TURNOVER / this.DMOLot_Qnty);
            else this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', 0.0);
          }
        } else if (this.isValid(this.DMOLOT_Weight) && this.isValid(this.DMOLOT_TURNOVER) && controlName != 'ckg') {
          if (Number(this.DMOLOT_Weight) > 0)
            this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_Weight);
          else this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', 0.0);
        } else if (this.isValid(this.DMOLOT_PriceKg) && this.isValid(this.DMOLOT_TURNOVER) && controlName != 'weight') {
          if (Number(this.DMOLOT_PriceKg) > 0)
            this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_PriceKg);
          else this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', 0.0);
        }
        if (controlName == 'ckg') {
          if (
            this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').value != null &&
            this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').value != ''
          ) {
            this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').disable();
            this.lotDetailForm.get('DMOLot_LotInfo_PriceType').reset('c/kg');
            this.lotDetailForm.get('DMOLot_LotInfo_PriceType').markAsDirty();
            this.lotDetailForm.get('DMOLot_LotInfo_PriceType').updateValueAndValidity();
            this.priceCKG = true;
            this.price$ph = false;
          } else {
            this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').enable();
            this.priceCKG = false;
            this.price$ph = true;
          }
        }
        break;
      case 'turnover':
        this.DMOLOT_Weight = this.lotDetailForm.get('DMOLot_LotInfo_WtKg').value;
        this.DMOLOT_TURNOVER = this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').value;
        this.DMOLot_PriceHead = this.lotDetailForm.get('DMOLot_LotInfo_Price$PHd').value;
        this.DMOLot_Qnty = this.lotDetailForm.get('DMOLot_LotInfo_Qnty').value;
        this.DMOLOT_PriceKg = this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').value;

        if (this.isValid(this.DMOLOT_Weight) && !this.isValid(this.DMOLOT_PriceKg)) {
          if (Number(this.DMOLOT_Weight) > 0)
            this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_Weight);
          else this.setValueAndMarkDarty('DMOLot_LotInfo_PriceCPKg', 0.0);
        } else if (this.isValid(this.DMOLOT_PriceKg) && !this.isValid(this.DMOLOT_Weight)) {
          this.DMOLOT_PriceKg = this.lotDetailForm.get('DMOLot_LotInfo_PriceCPKg').value;
          if (Number(this.DMOLOT_PriceKg) > 0)
            this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', (this.DMOLOT_TURNOVER * 100) / this.DMOLOT_PriceKg);
          else this.setValueAndMarkDarty('DMOLot_LotInfo_WtKg', 0.0);
        }
        if (this.isValid(this.DMOLot_Qnty) && !this.isValid(this.DMOLot_PriceHead) && this.DMOLOT_TURNOVER != '') {
          if (Number(this.DMOLot_Qnty) > 0) this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', this.DMOLOT_TURNOVER / this.DMOLot_Qnty);
          else this.setValueAndMarkDarty('DMOLot_LotInfo_Price$PHd', 0.0);
        }
        break;
    }
    this.DMOLOT_TURNOVER = this.lotDetailForm.get('DMOLot_LotInfo_TurnovAUD').value;
    if (this.isGSTApplicable == false || this.isVendorGSTApplicable == false) {
      this.GstRate = 0;
    }
    let gstRate = this.GstRate;
    if (this.DMOLOT_TURNOVER != null && this.DMOLOT_TURNOVER !== '' && this.DMOLOT_TURNOVER !== '0') {
      if (this.lotDetailForm.get('DMOLot_VInfo_VendorId').value != null && this.lotDetailForm.get('DMOLot_VInfo_VendorId').value != '')
        this.setValueAndMarkDarty('DMOLot_LotInfo_GST', gstRate * (Number(this.DMOLOT_TURNOVER) / 100));
      else this.setValueAndMarkDarty('DMOLot_LotInfo_GST', 0);
      this.setValueAndMarkDarty(
        'DMOLot_LotInfo_TurnoverGs',
        Number(this.DMOLOT_TURNOVER) + Number(this.lotDetailForm.get('DMOLot_LotInfo_GST').value)
      );
    } else {
      this.setValueAndMarkDarty('DMOLot_LotInfo_GST', 0);
      this.setValueAndMarkDarty('DMOLot_LotInfo_TurnoverGs', 0);
    }
  }
  setValueAndMarkDarty(controlName: any, value: any) {
    if (controlName === 'DMOLot_LotInfo_PriceCPKg')
      this.lotDetailForm.get(controlName).patchValue(this.lotservice.round(value, 4).toFixed(4));
    else if (controlName === 'DMOLot_LotInfo_GST') {
      //  this.lotDetailForm.get(controlName).patchValue(value.toFixed(2));
      let gstlot = this.lotservice.round(value, 4);
      gstlot = this.lotservice.round(gstlot, 3);
      gstlot = this.lotservice.round(gstlot, 2);
      this.lotDetailForm.get(controlName).patchValue(gstlot);
    } else this.lotDetailForm.get(controlName).patchValue(this.lotservice.round(value, 2).toFixed(2));
    this.lotDetailForm.get(controlName).markAsTouched();
    this.lotDetailForm.get(controlName).markAsDirty();
  }
  calcLotFeesChargesManual(ev: any) {
    const bodyData: any = {
      FeeTransactionID: ev.FeeTransactionID,
      Turnover: this.lotDetailForm.value.DMOLot_LotInfo_TurnovAUD ? this.lotDetailForm.value.DMOLot_LotInfo_TurnovAUD : 0,
      Quantity: this.lotDetailForm.value.DMOLot_LotInfo_Qnty ? this.lotDetailForm.value.DMOLot_LotInfo_Qnty : 0,
      Weight: this.lotDetailForm.value.DMOLot_LotInfo_WtKg ? this.lotDetailForm.value.DMOLot_LotInfo_WtKg : 0,
      Rate: ev.Rate ? ev.Rate : 0,
      CalculationType: ev.CalculationType ? ev.CalculationType : '',
      ConsequenceFeeID: ev.ConsequenceFeeID,
      LotTransactionID: this.transactionId,
    };
    const ThirdParty = ['ThirdPartyAccount', 'ThirdPartyName', 'ReferenceText'];
    const sb = this.apiESaleyardService.post('crmlot/calcLotFeesChargesManual', bodyData).subscribe((data) => {
      if (this.lotFeesChargesGrid.newRow.FeeTransactionID === ev.FeeTransactionID) {
        Object.keys(data).forEach((element) => {
          if (element !== 'Description') {
            if (ThirdParty.includes(element) && data[element] == '') {
            } else {
              this.lotFeesChargesGrid.newRow[element] = data[element];
            }
          }
        });
        return;
      }
      for (let i = 0; i < this.lotFeesChargesGrid.data.length; i++) {
        if (this.lotFeesChargesGrid.data[i].FeeTransactionID === ev.FeeTransactionID) {
          Object.keys(data).forEach((element) => {
            if (ThirdParty.includes(element) == false && data[element] !== '') {
              if (element !== 'Description') {
                this.lotFeesChargesGrid.data[i][element] = data[element];
              } else {
                this.lotFeesChargesGrid.data[i][element] = ev.Description;
              }
            }
          });
          return;
        }
      }
    });

    this.subscriptions.push(sb);
  }

  async calcLotFeesCharges() {
    this.isFeesCalculated = true;
    const bodyData: any = {};
    bodyData.TransactionType = this.parentData.DataInformation.dmocrmheaderinftrantype
      ? this.parentData.DataInformation.dmocrmheaderinftrantype.DMOVAL.split('~~~')[0]
      : '';
    bodyData.SaleType = this.parentData.DataInformation.dmocrmheaderinfsaletype
      ? this.parentData.DataInformation.dmocrmheaderinfsaletype.DMOVAL.split('~~~')[0]
      : '';
    bodyData.Saleyard = this.parentData.DataInformation.dmocrmheaderinfsaleyard
      ? this.parentData.DataInformation.dmocrmheaderinfsaleyard.DMOVAL.split('~~~')[0]
      : '';
    bodyData.ConductingBranch = this.parentData.DataInformation.dmocrmheaderinfcndbrnc
      ? this.parentData.DataInformation.dmocrmheaderinfcndbrnc.DMOVAL.split('~~~')[0]
      : '';
    bodyData.VendorBranch = this.lotDetailForm.value.DMOLot_VInfo_VendorBrc ? this.lotDetailForm.value.DMOLot_VInfo_VendorBrc : '';
    bodyData.VendorBranch = bodyData.VendorBranch.dmobranchbrcode ? bodyData.VendorBranch.dmobranchbrcode : bodyData.VendorBranch;
    bodyData.ProductCode = this.lotDetailForm.value.DMOLot_LotInfo_Pdct ? this.lotDetailForm.value.DMOLot_LotInfo_Pdct : '';
    bodyData.Turnover = this.lotDetailForm.value.DMOLot_LotInfo_TurnovAUD ? this.lotDetailForm.value.DMOLot_LotInfo_TurnovAUD : 0;
    bodyData.Quantity = this.lotDetailForm.value.DMOLot_LotInfo_Qnty ? this.lotDetailForm.value.DMOLot_LotInfo_Qnty : 0;
    bodyData.PriceHead = this.lotDetailForm.value.DMOLot_LotInfo_Price$PHd ? this.lotDetailForm.value.DMOLot_LotInfo_Price$PHd : 0;
    bodyData.PriceCKg = this.lotDetailForm.value.DMOLot_LotInfo_PriceCPKg ? this.lotDetailForm.value.DMOLot_LotInfo_PriceCPKg : 0;
    bodyData.Weight = this.lotDetailForm.value.DMOLot_LotInfo_WtKg ? this.lotDetailForm.value.DMOLot_LotInfo_WtKg : 0;
    bodyData.BuyerNumber = this.lotDetailForm.value.DMOLot_BInfo_BuyerId ? this.lotDetailForm.value.DMOLot_BInfo_BuyerId : '';
    bodyData.priceType = this.lotDetailForm.value.DMOLot_LotInfo_PriceType ? this.lotDetailForm.value.DMOLot_LotInfo_PriceType : '';
    // Add new parameter in calcLotFeesCharges api
    bodyData.VendorNumber = this.lotDetailForm.value.DMOLot_VInfo_VendorId ? this.lotDetailForm.value.DMOLot_VInfo_VendorId : '';
    bodyData.VendorNumber = bodyData.VendorNumber.indexOf('-') > 0 ? bodyData.VendorNumber.split('-')[1] : bodyData.VendorNumber;
    if (!this.isNew) {
      bodyData.LotTransactionID = this.transactionId;
      bodyData.RecalcVendorCommission = this.RecalcVendorCommission;
      bodyData.RecalcCharges = this.RecalcCharges;
      const calculatedFees: any = await this.apiESaleyardService.post('crmlot/calcLotFeesCharges', bodyData).toPromise();
      this.lotFeesChargesGrid.data = calculatedFees;
    } else {
      bodyData.RecalcVendorCommission = this.RecalcVendorCommission;
      bodyData.RecalcCharges = this.RecalcCharges;
      const calculatedFees: any = await this.apiESaleyardService.post('crmlot/calcLotFeesCharges', bodyData).toPromise();
      const manualFees: any[] = this.lotFeesChargesGrid.data.filter((row) => row.IsManual === true);
      this.lotFeesChargesGrid.data = calculatedFees.concat(manualFees.filter((x) => x.FeeCode != 'GrossCommission'));
    }
  }

  async saveLotFeesCharges() {
    const bodyData: any = {
      TransactionID: this.transactionId,
      Items: [...this.lotFeesChargesGrid.data],
    };

    await this.apiESaleyardService.post('crmlot/saveLotFeesCharges', bodyData).toPromise();
    this.lotFeesChargesGrid.newRow = {
      ...this.lotFeesChargesGrid.newFeesCharges,
    };
  }

  async calcLotFeesChargesById() {
    const bodyData = {
      SaleTransactionID: this.parentId,
      LotTransactionID: this.transactionId,
      RecalcCharges: this.RecalcCharges,
      RecalcVendorCommission: this.RecalcVendorCommission,
    };

    if (this.isReversal) {
      delete bodyData.SaleTransactionID;
    }

    await this.apiESaleyardService.post('crmlot/calcLotFeesChargesById', bodyData).toPromise();
  }

  goBack() {
    if (this.lotDetailForm.pristine === false && this.isLotSubmit === false) {
      this.msg.showMessage('Warning', {
        header: 'Confirmation Message',
        body: 'There is unsaved data in lot details. Are you sure you wish to proceed without saving?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: () => this.router.navigate(['/crm/sales', this.parentId]),
        caller: this,
      });
    } else {
      this.router.navigate(['/crm/sales', this.parentId]);
    }
  }
  vendorBranchSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorBranchSearch(text$);
  };
  branchSearch = (text$: Observable<string>) => {
    return this.lotSearchService.branchSearch(text$);
  };
  async calcBuyerBranchRebate() {
    const bodyData = {
      SaleTransactionID: this.parentId,
      LotTransactionID: this.transactionId,
    };
    await this.apiESaleyardService.post('crmlot/calcBuyerBranchRebate', bodyData).toPromise();
  }
  fixedValue(controlName: any, toFixedValue = 2) {
    if (!!this.lotDetailForm.get(controlName).value) {
      this.lotDetailForm.get(controlName).patchValue(parseFloat(this.lotDetailForm.get(controlName).value).toFixed(toFixedValue));
    }
  }

  isTriggerVisible(trigger: any) {
    let isShowHideTrigger = false;
    Object.keys(trigger.ActionRoles).forEach((roleguid) => {
      if (isShowHideTrigger == false) {
        if (this.currentUser.ListRole.indexOf(roleguid) > -1) {
          if (trigger.Guid === this.currentTriggerGuid) {
            isShowHideTrigger = this.triggerCondJson[trigger.Guid].IsVisible;
            return isShowHideTrigger;
          } else {
            isShowHideTrigger = false;
          }
        }
      }
    });
    return isShowHideTrigger;
  }

  getTriggers() {
    this.triggers = [];
    var userRole = this.currentUser.ListRole;
    this.getCurrentStageGUID();
    if (
      this.WFJSON.Stages[this.currentStageGuid] &&
      this.WFJSON.Stages[this.currentStageGuid].States &&
      this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid]
    ) {
      Object.keys(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers).forEach((triggerId) => {
        //trigger access associated to user role
        var ActionRoles = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerId].ActionRoles;
        let isShowHideTrigger = false;
        Object.keys(ActionRoles).forEach((roleguid) => {
          if (isShowHideTrigger == false) isShowHideTrigger = userRole.indexOf(roleguid) > -1 ? true : false;
        });
        if (isShowHideTrigger) {
          this.triggers.push(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerId]);
          const trigger = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerId];
          this.triggerCondJson[triggerId] = {
            IsVisible: true,
            IsEnable: true,
            Guid: trigger.Guid,
          };
        }
      });
    }
  }

  getCurrentStageGUID() {
    if (this.stage === SaleStage.Inprocess) {
      this.currentStageGuid = CrmLotTrigger.StgWFLmklotInProcess;
      this.currentStateGuid = CrmLotTrigger.SttLotInProcessPreprocessing;
      this.currentTriggerGuid = CrmLotTrigger.TrgrLotPreprocessingCreateLot;
    } else if (this.stage === SaleStage.Finalised) {
      this.currentStageGuid = CrmLotTrigger.Inprocessfinalize;
      if (SaleStage.Finalised) {
        this.currentStateGuid = CrmLotTrigger.FinalisedCompleteState;
        this.currentTriggerGuid = CrmLotTrigger.TrgrPreprocessingFinaliseSale;
      } else if (SaleStage.ReversalCompleted) {
        this.currentStateGuid = CrmLotTrigger.FinalisedReverseState;
        this.currentTriggerGuid = CrmLotTrigger.TrgPreprocessingRevers;
      }
    } else if (this.stage === SaleStage.Invoiced) {
      this.currentStageGuid = CrmLotTrigger.StgWFLmklotInProcess;
      this.currentStateGuid = CrmLotTrigger.SttLotInProcessPreprocessing;
      this.currentTriggerGuid = CrmLotTrigger.TrgrLotPreprocessingCreateLot;
    } else if (this.stage === SaleStage.ReversalProcess) {
      this.currentStageGuid = CrmLotTrigger.StgWFLmklotInProcess;
      this.currentStateGuid = CrmLotTrigger.SttLotInProcessPreprocessing;
      this.currentTriggerGuid = CrmLotTrigger.TrgrLotPreprocessingCreateLot;
    }
  }
  checkGSTApplicable() {
    this.GstRate = this.GstRateChanged;
    this.isGSTApplicable = true;
    this.isVendorGSTApplicable = true;
    if (this.applicationData.DataInformation && this.applicationData.DataInformation.dmolotlotinfopdct.DMOVAL !== null) {
      const sb = this.lotSearchService.getGstApplicable(this.applicationData.DataInformation.dmolotlotinfopdct.DMOVAL).subscribe((x) => {
        if (x && x.length > 0) {
          if (x[0].dmoproductgst == 'No') {
            this.isGSTApplicable = false;
          } else {
            this.isGSTApplicable = true;
          }
        }
      });
      this.subscriptions.push(sb);
    }
    if (this.applicationData.DataInformation && this.applicationData.DataInformation.dmolotvinfovendorid.DMOVAL !== null) {
      const sb = this.lotSearchService
        .getVendorData(this.applicationData.DataInformation.dmolotvinfovendorid.DMOVAL, 'VendorId')
        .subscribe((x) => {
          if (x && x.Data.length > 0) {
            if (!(x.Data[0].dmocustmstrgstflg == 'Yes' && x.Data[0].dmocustmstrhobbyfarmer == 'No' && x.Data[0].dmocustmstrcustabn)) {
              this.isVendorGSTApplicable = false;
            } else {
              this.isVendorGSTApplicable = true;
            }
          }
        });
      this.subscriptions.push(sb);
    }
  }
  updateSaleCompanyCode(vendorCmpCode, buyerCmpCode): string {
    let isUpdate = false;
    const v =
      vendorCmpCode && vendorCmpCode.lastIndexOf('(') > -1
        ? vendorCmpCode.substr(vendorCmpCode.lastIndexOf('(') + 1).replace(')', '')
        : vendorCmpCode;
    const b =
      buyerCmpCode && buyerCmpCode.lastIndexOf('(') > -1
        ? buyerCmpCode.substr(buyerCmpCode.lastIndexOf('(') + 1).replace(')', '')
        : buyerCmpCode;
    if (v && this.saleServices.saleCompanyCode.findIndex((x) => x == v) == -1) {
      this.saleServices.saleCompanyCode.push(v);
      isUpdate = true;
    }
    if (b && this.saleServices.saleCompanyCode.findIndex((x) => x == b) == -1) {
      this.saleServices.saleCompanyCode.push(b);
      isUpdate = true;
    }
    if (isUpdate) {
      return this.saleServices.saleCompanyCode.join(',');
    } else {
      return null;
    }
  }
  ValidateProduct(event) {
    if (this.isProductSelected == false && event.key != 'Tab') {
      this.ValidateProductNameMessage = 'Product name is not exist';
    }
  }
  ValidateProductOnKeyUp(event) {
    if (event.target.value && event.key != 'Tab' && event.key != 'Enter') {
      this.isProductSelected = false;
    }
    if (event.target.value == '') {
      this.isProductSelected = true;
      this.ValidateProductNameMessage = '';
      this.ChargedTo = '';
      this.handleBuyerCartage(false);
      this.handleVendorCartage(false);
      this.enableDisableControl(true);
    }
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
