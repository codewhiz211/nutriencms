import { Component, Input, OnChanges, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

import { BaseGrid, GridViewConfigurationComponent, ExportGridViewConfigComponent } from '@app/shared';
import { ListviewService, ColumnFilterService, ApplicationService, ApiESaleyardService, SaleStage, MessageService } from '@app/core';
import { LotSearchService } from '../../services/lot-search.service';
import { BulkUploadLotComponent } from '../bulk-upload-lot/bulk-upload-lot.component';
import { LotService } from '../../services/lot.service';
import { SalesService } from '@app/modules/crm/sales/services/sales.service';
import { UserDetail } from '@app/core/models/user-detail';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { EContractService } from '@app/modules/crm/e-contracts/services/e-contract.service';
import { SpinnerVisibilityService } from 'ng-http-loader';


@Component({
  selector: 'app-lots-grid-view',
  templateUrl: './lots-grid-view.component.html',
  styleUrls: ['./lots-grid-view.component.scss', '../../../../../shared/components/grid-view/grid-view.component.scss'],
})
export class LotsGridViewComponent extends BaseGrid implements OnChanges, OnDestroy {
  IsCoutLoad: boolean = false;

  // Properties
  @Input() set Config(obj: any) {
    this.ProcessName = (obj.ProcessName && obj.ProcessName.trim()) || 'LMKLivestockLots';
    this.ParentTransactionId = obj.ParentTransactionId;
    this.ViewName = (obj.ViewName && obj.ViewName.trim()) || '';
    this.GridGuid = (obj.GridGuid && obj.GridGuid.trim()) || 'MCompContainer';
    this.PageSize = (obj.PageSize && obj.PageSize.trim()) || '10';
    this.HideSelectAll = obj.HideSelectAll;
    this.HideActionCol = obj.HideActionCol;
    this.TimeZone = this.userDetail.TimeZone.toString();
    this.ColumnList = (obj.ColumnList && obj.ColumnList.trim()) || '';
    this.LstGridFilter = (obj.LstGridFilter && obj.LstGridFilter) || [];
    this.PageNumber = (obj.PageNumber && obj.PageNumber.trim()) || '0';
    this.PageCount = (obj.PageCount && obj.PageCount.trim()) || '0';
    this.HasGlobalSearch = true;
    this.IsSubProcess = obj.IsSubProcess === true ? true : false;
    this.HideDeleteActionIcon = obj.HideDeleteActionIcon === true ? true : false;
    this.ShowBulkUpdateButton = obj.ShowBulkUpdateButton === true ? true : false;
    this.CanAddNewRow = obj.CanAddNewRow === true ? true : false;
    this.TriggerName = (obj.TriggerName && obj.TriggerName.trim()) || '';
  }

  @Input() stage: SaleStage;

  editDisabled = false;
  isReversal = false;
  dmoValues = [];

  typeAheadEnter$ = new BehaviorSubject<boolean>(false);

  numericFields = [
    'dmolotlotinfoqnty',
    'dmolotlotinfopricephd',
    'dmolotlotinfopricecpkg',
    'dmolotlotinfoturnovaud',
    'dmolotlotinfowtkg',
    'dmolotlotinfotrnsclmqnt',
  ];
  IsPermissionSet = false;
  IsAddNewRow = false;
  HideSelectAll = false;
  HideActionCol = false;
  DMOLOT_PriceHeader: any;
  DMOLOT_Quantity: any;
  DMOLOT_PriceKg: any;
  DMOLOT_WeightKg: any;
  GridItem: any;
  GstRate = 10;
  GstRateChanged = 10;
  //GstRateAfterVendorChanged = 0;
  vendorIdMessage: any;
  vendorNameMessage: any;
  buyerIdMessage: any;
  buyerNameMessage: any;
  productNameMessage: any;
  productDescriptionMessage: any;
  breedMessage: any;
  BuyerBranchMessage: any;
  VendorBranchMessage: any;
  RecalcVendorCommission: any = false;
  RecalcCharges: any = false;
  flag = false;
  HobbyFarmer = '';
  GSTFlag = '';
  HobbyFarmerList = [];
  columnMap = ['TotalDollerPerHead', 'PriceExcludeGST', 'GST', 'PriceIncludeGST'];
  metricsMap = [
    {
      objectKey: 'TotalLOT',
      displayName: 'Lots',
    },
    {
      objectKey: 'TotalQuantity',
      displayName: 'Total Qty',
    },
    {
      objectKey: 'TotalDollerPerHead',
      displayName: '#Total $/HD',
    },
    {
      objectKey: 'TotalCPerKg',
      displayName: '#Total C/KG',
    },
    {
      objectKey: 'TotalCombined',
      displayName: '#Total Combined',
    },
    {
      objectKey: 'TotalKg',
      displayName: 'Total Kg',
    },
    {
      objectKey: 'TotalAverageWeight',
      displayName: 'Total Avg Weight',
    },
    {
      objectKey: 'PriceExcludeGST',
      displayName: 'Price ex. GST',
    },
  ];
  metricsData: any;
  docsMap = {};
  private unsubscribe: Subscription[] = [];
  IsGotoDetailPage = false;
  isGSTApplicable = true;
  isVendorGSTApplicable = true;
  isProductSelected: boolean;
  formatter = (x: any) => (x.dmobranchbrname ? x.dmobranchbrname + ' (' + x.dmobranchbrcode + ')' : '');

  addPICTagFn = (term) => {
    if (term.length < 9) {
      return term;
    }
    this.toastr.warning('The PIC number accepts a max of 8 characters.');
    return null;
  };
  VendorCompanyCode: string;
  BuyerCompanyCode: string;
  isDisabledQty = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public elRef: ElementRef,
    private listviewService: ListviewService,
    private applicationService: ApplicationService,
    private modalService: NgbModal,
    public toastr: ToastrService,
    private columnFilter: ColumnFilterService,
    private lotSearchService: LotSearchService,
    private lot: LotService,
    private apiESaleyardService: ApiESaleyardService,
    private saleServices: SalesService,
    private msg: MessageService,
    private userDetail: UserDetail,
    private econtract: EContractService,
    private spinner: SpinnerVisibilityService
  ) {
    super(elRef, toastr);
    this.setDocsMap();
  }

  ngOnChanges() {
    this.editDisabled = this.stage !== SaleStage.Inprocess && this.stage !== SaleStage.Invoiced;
    this.isReversal = this.stage === SaleStage.ReversalProcess;
    this.isDisabledQty = false;
    if (this.isReversal == true && this.saleServices.IsConductingBranchSaleProcessor == false) {
      this.isDisabledQty = true;
    }
  }
  ngOnDestroy() {
    if (!this.IsGotoDetailPage && sessionStorage.getItem('processName')) {
      sessionStorage.removeItem(sessionStorage.getItem('processName').toString() + 'gridFlters');
      sessionStorage.removeItem(sessionStorage.getItem('processName').toString() + 'sortGrid');
      sessionStorage.removeItem(sessionStorage.getItem('processName').toString() + 'gridsort');
    }
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  edit_item_value(event, datafield: string, item: any) {
    this.CalculationWeightQuanityCKGPricesHead(datafield, item);
    if (datafield == 'dmolotlotinfopricephd' || datafield == 'dmolotlotinfopricecpkg') this.RecalcCharges = true;
    this.calcFieldChanged(item);
    this.cdr.detectChanges();
  }

  getQuantity_Value(event: any, datafield: string, item: any) {
    if (this.isReversal && +item.edit_value[datafield] > +item[datafield]) {
      setTimeout(() => {
        item.edit_value[datafield] = item[datafield];
      });
    } else {
      this.CalculationWeightQuanityCKGPricesHead(datafield, item);
      this.RecalcCharges = true;
      this.calcFieldChanged(item);
      this.cdr.detectChanges();
    }
  }
  checkQty(event: any, datafield: string, item: any) {
    if (this.isReversal && (+item.edit_value[datafield] < 0 || item.edit_value[datafield] == '')) {
      setTimeout(() => {
        this.msg.showMessage('Warning', { body: 'Quantity should cannot be blank during sale reversal.' });
        item.edit_value[datafield] = item[datafield];
      });
    }
  }
  getWeight_Value(event, datafield: string, item: any) {
    this.CalculationWeightQuanityCKGPricesHead(datafield, item);
    this.RecalcCharges = true;
    this.calcFieldChanged(item);
    this.cdr.detectChanges();
  }

  getTurnover_Value(event, datafield: string, item: any) {
    this.CalculationWeightQuanityCKGPricesHead(datafield, item);
    this.RecalcCharges = true;
    this.calcFieldChanged(item);
    this.cdr.detectChanges();
  }

  is_cell_disabled(item: any, datafield: string) {
    if (
      datafield === 'dmolotlotinfopricecpkg' &&
      item.edit_value.dmolotlotinfopricetype === '$/head' &&
      item.edit_value.dmolotlotinfopricephd
    ) {
      return true;
    } else if (
      datafield === 'dmolotlotinfopricephd' &&
      item.edit_value.dmolotlotinfopricetype === 'c/kg' &&
      item.edit_value.dmolotlotinfopricecpkg
    ) {
      return true;
    }
    return false;
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

  selectVendor(event: NgbTypeaheadSelectItemEvent, field: string, item: any) {
    this.typeAheadEnter$.next(true);
    const vendorSap = field == 'dmocustmstrsapno' && event.item && event.item.indexOf('-') > 0 ? event.item.split('-')[1] : event.item;
    this.lotSearchService.vendorData.forEach((vendor) => {
      if (vendor[field] === vendorSap) {
        item.edit_value.dmolotvinfovendornam = vendor.dmocustmstrcustname1;
        item.edit_value.dmolotvinfogstreg = vendor.dmocustmstrgstflg;
        this.lotSearchService.vendorCompany = vendor.dmocustmstrcompcode_KEY;
        if (field == 'dmocustmstrcustname1') {
          item.edit_value.dmolotvinfovendorid = vendor.dmocustmstrcompcode_KEY + '-' + vendor.dmocustmstrsapno;
        } else {
          item.edit_value.dmolotvinfovendorid = vendor.dmocustmstrsapno;
        }
        item.vendorBranchOptions = [];
        if (vendor.dmocustmstrlstkbranch) {
          item.vendorBranchOptions.push({
            ValueField: vendor.dmocustmstrlstkbranch,
            TextField: vendor.dmocustmstrlstkbranch,
          });
        }
        if (item.vendorBranchOptions[0].ValueField != '') {
          item.isDdl = false;
        }
        item.edit_value.dmolotvinfovendorbrc = item.vendorBranchOptions[0].ValueField;
        const branchSapNumber = vendor.dmocustmstrlstkbranch ? vendor.dmocustmstrlstkbranch_KEY : undefined;
        if (branchSapNumber) {
          this.lotSearchService.getVendorBranchData(branchSapNumber, 'dmobranchbrcode', 'EQUAL').subscribe((x) => {
            if (x && parseInt(x.RecordsCount) > 0) {
              item.isDdl = false;
            } else {
              item.vendorBranchOptions = [];
              item.edit_value.dmolotvinfovendorbrc = null;
              item.isDdl = true;
            }
          });
        }
        // this.lotDetailForm.get('DMOLot_VInfo_VendorBrc').patchValue(this.DMOData.dmolotvinfovendorbrc[0].ValueField);
        this.getVendorPic(item, vendor.dmocustmstrsapno);

        if (field == 'dmocustmstrsapno' || field == 'dmolotvinfovendornam') {
          this.RecalcVendorCommission = true;
        }
        this.RecalcCharges = true;
        this.HobbyFarmer = vendor.dmocustmstrhobbyfarmer;
        this.GSTFlag = vendor.dmocustmstrgstflg;
        if (!(vendor.dmocustmstrgstflg == 'Yes' && vendor.dmocustmstrhobbyfarmer == 'No' && vendor.dmocustmstrcustabn)) {
          this.isVendorGSTApplicable = false;
        } else {
          this.isVendorGSTApplicable = true;
        }
        this.CalculationWeightQuanityCKGPricesHead('', item);
        item.edit_value.dmolotlotinfogstrate = this.GstRate;
        item.edit_value.domlotvinfocompcode = vendor.dmocustmstrcompcode;
      }
    });
    this.calcFieldChanged(item);
  }
  getVendorPic(item, sapNo, pic = '') {
    this.lotSearchService.getVendorPIC(sapNo).subscribe((response) => {
      item.vendorPICOptions = [];
      response.forEach((p) => item.vendorPICOptions.push(p.dmocuspiccustpic));

      const picEdit = item.edit_value.dmolotvinfovendorpic;
      if (picEdit != undefined && picEdit != '' && item.vendorPICOptions.findIndex((x) => x == picEdit) === -1) {
        item.vendorPICOptions.push(picEdit);
      }

      item.edit_value.dmolotvinfovendorpic = '';
      if (item.vendorPICOptions.length === 1 && pic == '' && item.vendorPICOptions[0] != undefined) {
        item.edit_value.dmolotvinfovendorpic = item.vendorPICOptions[0];
      }
      if (pic != '') {
        item.edit_value.dmolotvinfovendorpic = pic;
      }
    });
  }
  TrackVendor(row: any) {
    if (row.edit_value.dmolotvinfovendorid == undefined || row.edit_value.dmolotvinfovendorid == '') {
      this.CalculationWeightQuanityCKGPricesHead('', row);
      row.edit_value.dmolotvinfogstreg = '';
    }
  }
  buyerIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerIdSearch(text$);
  };

  buyerNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerNameSearch(text$);
  };

  selectBuyer(event: NgbTypeaheadSelectItemEvent, field: string, item: any) {
    this.typeAheadEnter$.next(true);
    const BuyerSap = field == 'dmocustmstrsapno' && event.item && event.item.indexOf('-') > 0 ? event.item.split('-')[1] : event.item;
    this.lotSearchService.buyerData.forEach((buyer) => {
      if (buyer[field] === BuyerSap) {
        item.edit_value.dmolotbinfobuyername = buyer.dmocustmstrcustname1;
        item.edit_value.dmolotbinfobuyerid = buyer.dmocustmstrsapno;
        this.lotSearchService.buyerCompany = buyer.dmocustmstrcompcode_KEY;
        if (field == 'dmocustmstrcustname1') {
          item.edit_value.dmolotbinfobuyerid = buyer.dmocustmstrcompcode_KEY + '-' + buyer.dmocustmstrsapno;
        } else {
          item.edit_value.dmolotbinfobuyerid = buyer.dmocustmstrsapno;
        }
        item.buyerBranchOptions = [];
        if (buyer.dmocustmstrlstkbranch) {
          item.buyerBranchOptions.push({
            ValueField: buyer.dmocustmstrlstkbranch,
            TextField: buyer.dmocustmstrlstkbranch,
          });
        }
        if (item.buyerBranchOptions[0].ValueField != '') {
          item.isDdlBuyer = false;
        }
        item.edit_value.dmolotbinfobuyerbrc = item.buyerBranchOptions[0].ValueField;
        const branchSapNumber = buyer.dmocustmstrlstkbranch ? buyer.dmocustmstrlstkbranch_KEY : undefined;
        if (branchSapNumber) {
          this.lotSearchService.getBranchData(branchSapNumber, 'dmobranchbrcode', 'EQUAL').subscribe((x) => {
            if (x && parseInt(x.RecordsCount) > 0) {
              item.isDdlBuyer = false;
            } else {
              item.buyerBranchOptions = [];
              item.edit_value.dmolotbinfobuyerbrc = null;
              item.isDdlBuyer = true;
            }
          });
        }
        this.getBuyerPic(item, buyer.dmocustmstrsapno);
        this.RecalcCharges = true;
        item.edit_value.dmolotbinfocompcode = buyer.dmocustmstrcompcode;
      }
    });
  }

  getBuyerPic(item, sapNo, pic = '') {
    this.lotSearchService.getBuyerPIC(sapNo).subscribe((response) => {
      item.buyerPICOptions = [];
      response.forEach((p) => item.buyerPICOptions.push(p.dmocuspiccustpic));

      const picEdit = item.edit_value.dmolotbinfobuyerpic;
      if (picEdit != undefined && picEdit != '' && item.buyerPICOptions.findIndex((x) => x == picEdit) === -1) {
        item.buyerPICOptions.push(picEdit);
      }

      item.edit_value.dmolotbinfobuyerpic = '';
      if (item.buyerPICOptions.length === 1 && pic == '' && item.buyerPICOptions[0] != undefined) {
        item.edit_value.dmolotbinfobuyerpic = item.buyerPICOptions[0];
      }
      if (pic != '') {
        item.edit_value.dmolotbinfobuyerpic = pic;
      }
    });
  }

  productSearch = (text$: Observable<string>) => {
    return this.lotSearchService.productSearch(text$, this.ParentTransactionId);
  };

  setProductDescription(event: NgbTypeaheadSelectItemEvent, item: any) {
    const VendorCartage = ['CV', 'SUV', 'AGV', 'AUCV', 'DIPV', 'FEEV', 'RAFRV', 'SEV', 'STIV', 'STSDV', 'WGHV'];
    const BuyerCartage = ['CB', 'SUB', 'AGB', 'DIPB', 'FEEB', 'RAFRB', 'SEB', 'STIB', 'STSDB', 'WGHB', 'AUCB', 'SEB'];
    this.typeAheadEnter$.next(true);
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
      event.item === 'NCVC' ||
      event.item === 'PASG'
    ) {
      this.handleUnsoldLots(true, item);
    } else if (VendorCartage.indexOf(event.item) > -1) {
      this.handleVendorCartage(true, item);
    } else if (BuyerCartage.indexOf(event.item) > -1) {
      this.handleBuyerCartage(true, item);
    } else {
      this.handleUnsoldLots(false, item);
      this.handleVendorCartage(false, item);
      this.handleBuyerCartage(false, item);
    }
    this.lotSearchService.productData.forEach((product) => {
      if (product.PMProductCode === event.item) {
        item.edit_value.dmolotlotinfoproddesc = product.PMProductDescription;
        item.edit_value.lmkldproductcategory = product.productcategory;
        this.RecalcCharges = true;
        if (product.GSTApplicable && product.GSTApplicable == 'No') {
          this.isGSTApplicable = false;
        } else {
          this.isGSTApplicable = true;
        }
        this.CalculationWeightQuanityCKGPricesHead('', item);
      }
    });
    this.calcFieldChanged(item);
    this.productNameMessage = '';
    this.isProductSelected = true;
  }

  handleUnsoldLots(isUnsoldLots: boolean, item: any) {
    item.isUnsoldLots = isUnsoldLots;
    item.isBuyerCartage = false;
    item.isVendorCartage = false;
    if (isUnsoldLots) {
      item.edit_value.dmolotbinfobuyername = '';
      item.edit_value.dmolotbinfobuyerid = '';
      item.edit_value.dmolotbinfobuyerbrc = '';
      item.edit_value.dmolotbinfobuyerpic = '';
      item.edit_value.dmolotlotinfoturnovaud = 0;
      item.edit_value.dmolotlotinfogst = 0;
      item.edit_value.dmolotlotinfoturnovergs = 0;
    }
  }
  handleVendorCartage(isVendorCartage: boolean, item: any) {
    item.isVendorCartage = isVendorCartage;
    item.isUnsoldLots = false;
    item.isBuyerCartage = false;
    item.IsEmpty = false;
    if (isVendorCartage) {
      item.edit_value.dmolotbinfobuyername = '';
      item.edit_value.dmolotbinfobuyerid = '';
      item.edit_value.dmolotbinfobuyerbrc = null;
      item.edit_value.dmolotbinfobuyerpic = '';
      item.edit_value.dmolotbinfoinvoiceref = ''
      item.edit_value.dmolotbinfosetintbbreb = ''
      item.edit_value.dmolotbinforate = ''
      this.setEmptydmo(item);
    }
  }
  handleBuyerCartage(isBuyerCartage: boolean, item: any) {
    item.isBuyerCartage = isBuyerCartage;
    item.isVendorCartage = false;
    item.isUnsoldLots = false;
    item.IsEmpty = false;
    if (isBuyerCartage) {
      item.edit_value.dmolotvinfovendorid = '';
      item.edit_value.dmolotvinfovendornam = '';
      item.edit_value.dmolotvinfovendorbrc = null;
      item.edit_value.dmolotvinfovendorpic = '';
      item.edit_value.dmolotvinfoacsaleref = '';
      this.setEmptydmo(item);
    }
  }
  setEmptydmo(item) {
    item.edit_value.dmolotlotinfolotnum = '';
    item.edit_value.dmolotlotinfoqnty = '';
    item.edit_value.dmolotlotinfobrd = '';
    item.edit_value.dmolotlotinfopricephd = '';
    item.edit_value.dmolotlotinfopricecpkg = '';
    item.edit_value.dmolotlotinfowtkg = '';
    item.edit_value.dmolotlotinfoturnovaud = '';
    item.edit_value.dmolotlotinfosex = '';
    item.edit_value.dmolotlotinfopaintmk = '';
   // item.edit_value.dmolotlotinfocontractid = '';
    item.edit_value.dmolotlotinfohgp = '';
    item.edit_value.dmolotlotinfotransclaim = '';
    item.edit_value.dmolotlotinfotrnsclmby = '';
    item.edit_value.dmolotlotinfotrnsclmqnt = '';
    item.edit_value.dmolotlotinfotrnsclmval = '';
    item.edit_value.dmolotlotinfotrnsclmrsn = '';
    item.IsEmpty = true;
  }
  checkIfUnsoldLotsVendorBuyerCartge(item: any) {
    const VendorCartage = ['CV', 'SUV', 'AGV', 'AUCV', 'DIPV', 'FEEV', 'RAFRV', 'SEV', 'STIV', 'STSDV', 'WGHV'];
    const BuyerCartage = ['CB', 'SUB', 'AGB', 'DIPB', 'FEEB', 'RAFRB', 'SEB', 'STIB', 'STSDB', 'WGHB', 'AUCB', 'SEB'];
    item.IsEmpty = false;
    if (
      item.edit_value.dmolotlotinfopdct === 'PASC' ||
      item.edit_value.dmolotlotinfopdct === 'PASS' ||
      item.edit_value.dmolotlotinfopdct === 'PASH' ||
      item.edit_value.dmolotlotinfopdct === 'PASP' ||
      item.edit_value.dmolotlotinfopdct === 'PASA' ||
      item.edit_value.dmolotlotinfopdct === 'PASO' ||
      item.edit_value.dmolotlotinfopdct === 'PASD' ||
      item.edit_value.dmolotlotinfopdct === 'DOA' ||
      item.edit_value.dmolotlotinfopdct === 'NCVS' ||
      item.edit_value.dmolotlotinfopdct === 'NCVC' ||
      item.edit_value.dmolotlotinfopdct === 'PASG'
    ) {
      item.isUnsoldLots = true;
      item.isVendorCartage = false;
      item.isBuyerCartage = false;
    } else if (VendorCartage.indexOf(item.edit_value.dmolotlotinfopdct) > -1) {
      item.isVendorCartage = true;
      item.isUnsoldLots = false;
      item.isBuyerCartage = false;
      this.setEmptydmo(item);
    } else if (BuyerCartage.indexOf(item.edit_value.dmolotlotinfopdct) > -1) {
      item.isBuyerCartage = true;
      item.isVendorCartage = false;
      item.isUnsoldLots = false;
      this.setEmptydmo(item);
    }
  }

  accept_only_zero(event, item: any) {
    if (item.isUnsoldLots) {
      return event.charCode === 48;
    }
  }

  breedSearch = (text$: Observable<string>) => {
    return this.lotSearchService.breedSearch(text$, this.ParentTransactionId);
  };

  typeaheadSelected() {
    this.typeAheadEnter$.next(true);
  }

  triggerSave() {
    if (!this.IsAddNewRow) {
      if (this.GridItem != null && this.GridItem.isEdit) {
        this.confirmSaveRowRecord(this.GridItem);
      } else {
        return;
      }
    } else if (this.IsAddNewRow) {
      this.confirmCreateNewRecord();
    }
  }

  getGridConfigData(gridviewName?) {
    if (gridviewName) {
      this.ViewName = gridviewName;
    }
    this.listviewService.GridConfig(this).subscribe((data) => {
      let pushViewName = false;
      if (this.ViewName === '') {
        pushViewName = true;
        this.viewList = [];
      }
      data.forEach((element) => {
        if (pushViewName) {
          this.viewList.push({ IsDefaultview: element.IsDefaultview, Viewname: element.Viewname });
        }
        if (element.IsDefaultview || element.Viewname === this.ViewName) {
          this.ViewName = element.Viewname;
          this.gridConfigData = JSON.parse(element.Config);
          this.isDefaultView = element.IsDefaultview;
        }
      });
      if (gridviewName) {
        let flg = false;
        for (let i = 0; i < this.viewList.length; i++) {
          if (this.viewList[i].Viewname === gridviewName) {
            flg = true;
            break;
          }
        }
        if (!flg) {
          this.viewList.push({ IsDefaultview: false, Viewname: gridviewName });
        }
      }
      this.setConfigData(this.gridConfigData);
    });
  }

  setConfigData(gridConfig: any) {
    this.keyColumn =
      gridConfig && gridConfig.IdentityField && gridConfig.IdentityField !== 'undefined' ? gridConfig.IdentityField : 'TRNSCTNID';
    this._bodyData.ViewName = gridConfig.ViewName;
    this._bodyData.ColumnList = gridConfig.ColumnList;
    this._bodyData.PageSize = gridConfig.PageSize;
    const colList = gridConfig.ColumnList.split(',');
    this.columns = [];
    if (this.CanAddNewRow) {
      this.newRow = {
        edit_value: {},
      };
    }
    for (const objColumn of colList) {
      this.columns.push({
        text: gridConfig.Columns[objColumn].DisplayName,
        datafield: objColumn,
        dataType: gridConfig.Columns[objColumn].Type,
        width: gridConfig.Columns[objColumn].Width,
        isNumeric: this.numericFields.indexOf(objColumn) > -1,
      });
    }
    if (this.columns[this.columns.length - 1].datafield === 'dmolotlotinfostatus') {
      this.columns.splice(this.columns.length - 1, 0, { text: 'Docs', datafield: 'doc', dataType: 'doc' });
    } else {
      this.columns.push({ text: 'Docs', datafield: 'doc', dataType: 'doc' });
    }
    this.colSpan = this.columns.length + 2;
    this.DMOField = gridConfig.DMOFilters;
    if (gridConfig.StateFilters) {
      this.StateFilter = [];
      for (const stateFilter of gridConfig.StateFilters) {
        this.StateFilter.push(stateFilter.DisplayName);
      }
    }
    if (gridConfig.StageFilters) {
      this.StageFilter = [];
      for (const StageFilter of gridConfig.StageFilters) {
        this.StageFilter.push(StageFilter.DisplayName);
      }
    }
    this.CustomFilter = gridConfig.CustomFilters;
    // Remove Sesstion stroae if process changed
    if (this.ProcessName !== sessionStorage.getItem('processName')) {
      // sessionStorage.removeItem('gridsort');
      // sessionStorage.removeItem('gridFlters');
      // sessionStorage.removeItem('gridPage');
      sessionStorage.setItem('processName', this.ProcessName);
    }

    if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridsort')) {
      const sort = JSON.parse(sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridsort'));
      this._bodyData.SortColumn = sort.column;
      this.sortColumnName = sort.displayName;
      this._bodyData.SortOrder = sort.order;
    }
    if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridFlters')) {
      this.filters = JSON.parse(sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridFlters'));
    }
    if (sessionStorage.getItem('gridPage')) {
      const sort = JSON.parse(sessionStorage.getItem('gridPage'));
      this._bodyData.PageSize = sort.pageSize;
      this._bodyData.PageNumber = +sort.pageNumber - 1;
    }
    this.getGridData();
    this.getDMOsMapping();
  }

  getGridData() {
    this._bodyData.GridFilters = [];
    Object.keys(this.filters).forEach((key) => {
      this._bodyData.GridFilters.push(this.filters[key]);
    });

    if (!this.IsPermissionSet) {
      this.IsPermissionSet = true;
      this.listviewService.userActionPermission(this.ProcessName).subscribe((data) => {
        this.IsDeletionAllow = data.IsDeletionAllow;
        this.IsCopyAllow = data.IsCopyAllow;
        this.IsBulkUpdateAllow = data.IsBulkUpdateAllow;
        this.IsBulkUploadAllow = data.IsBulkUploadAllow;
      });
    }
    if (this._bodyData.SortColumn === 'dmolotlotinfolotnum') {
      this._bodyData.SortColumn = 'CAST(dmolotlotinfolotnum AS UNSIGNED)';
    }
    if (this._bodyData.SortColumn === 'dmolotlotinfoqnty') {
      this._bodyData.SortColumn = 'CAST(dmolotlotinfoqnty AS DECIMAL)';
    }
    if (this._bodyData.SortColumn === 'dmolotlotinfopricecpkg') {
      this._bodyData.SortColumn = 'CAST(dmolotlotinfopricecpkg AS DECIMAL)';
    }
    if (this._bodyData.SortColumn === 'dmolotlotinfopricephd') {
      this._bodyData.SortColumn = 'CAST(dmolotlotinfopricephd AS DECIMAL)';
    }
    if (this._bodyData.SortColumn === 'dmolotlotinfogst') {
      this._bodyData.SortColumn = 'CAST(dmolotlotinfogst AS DECIMAL)';
    }
    if (this._bodyData.SortColumn === 'dmolotlotinfoturnovaud') {
      this._bodyData.SortColumn = 'CAST(dmolotlotinfoturnovaud AS DECIMAL)';
    }
    this._bodyData.ColumnList =
      this._bodyData.ColumnList +
      ',dmolotvinfovendorid,dmolotbinfobuyerid,dmolotlotinfogst,dmolotlotinfoturnovergs,domlotvinfocompcode,dmolotbinfocompcode,dmolotlotinfopdct,dmolotlotinfopricetype,dmolotlotinfopricecpkg';
    this.getBlockCustomer().subscribe((BlockCustomerData) => {
      this.listviewService.GridDatalmk(this._bodyData).subscribe((data) => {
        if (this._bodyData.SortColumn === 'CAST(dmolotlotinfolotnum AS UNSIGNED)') {
          this._bodyData.SortColumn = 'dmolotlotinfolotnum';
        }
        if (this._bodyData.SortColumn === 'CAST(dmolotlotinfoqnty AS DECIMAL)') {
          this._bodyData.SortColumn = 'dmolotlotinfoqnty';
        }
        if (this._bodyData.SortColumn === 'CAST(dmolotlotinfopricecpkg AS DECIMAL)') {
          this._bodyData.SortColumn = 'dmolotlotinfopricecpkg';
        }
        if (this._bodyData.SortColumn === 'CAST(dmolotlotinfopricephd AS DECIMAL)') {
          this._bodyData.SortColumn = 'dmolotlotinfopricephd';
        }
        if (this._bodyData.SortColumn === 'CAST(dmolotlotinfogst AS DECIMAL)') {
          this._bodyData.SortColumn = 'dmolotlotinfogst';
        }
        if (this._bodyData.SortColumn === 'CAST(dmolotlotinfoturnovaud AS DECIMAL)') {
          this._bodyData.SortColumn = 'dmolotlotinfoturnovaud';
        }
        data.Data.map((x) => {
          (x.dmolotvinfovendorid =
            x.domlotvinfocompcode && x.domlotvinfocompcode.lastIndexOf('(') > -1
              ? !!x.dmolotvinfovendorid
                ? x.domlotvinfocompcode.substr(x.domlotvinfocompcode.lastIndexOf('(') + 1).replace(')', '') + '-' + x.dmolotvinfovendorid
                : x.dmolotvinfovendorid
              : x.dmolotvinfovendorid),
            (x.dmolotbinfobuyerid =
              x.dmolotbinfocompcode && x.dmolotbinfocompcode.lastIndexOf('(') > -1
                ? !!x.dmolotbinfocompcode
                  ? x.dmolotbinfocompcode.substr(x.dmolotbinfocompcode.lastIndexOf('(') + 1).replace(')', '') + '-' + x.dmolotbinfobuyerid
                  : x.dmolotbinfobuyerid
                : x.dmolotbinfobuyerid);
        });
        this.spinner.show();
        super.BindData(data);
        this.checkBlockCustomer(BlockCustomerData);

        this.spinner.hide();
        this.getprocessDataCount(data);

        this.getMetricsData();
        this.getGst();
      });
    });
  }
  //Entity related code– Nidhi
  getprocessDataCount(data: any): void {
    if (this.TableInfo.Recordes === -1 || this.isFilterClick === true) {
      this.IsCoutLoad = false;
      this.econtract.SalesProcessDataCount(this._bodyData).subscribe((recordsCount) => {
        this.TableInfo.Recordes = recordsCount.RecordsCount;
        this.IsCoutLoad = true;
        this.isFilterClick = false;
        this.setPaging(data);
      });
    } else {
      this.setPaging(data);
    }
  }

  setPaging(data) {
    this.IsCoutLoad = true;
    this.TableInfo.PageSize = this._bodyData.PageSize;
    this.TableInfo.PageNumber = parseInt(data.PageNumber, 10) + 1;
    this.TableInfo.PageCount = Math.ceil(parseInt(this.TableInfo.Recordes, 10) / parseInt(this._bodyData.PageSize, 10));
    this.TableInfo.Start = (parseInt(data.PageNumber, 10) <= 0 ? 0 : parseInt(data.PageNumber, 10)) * this._bodyData.PageSize + 1;
    this.TableInfo.End =
      this.TableInfo.PageNumber * this._bodyData.PageSize > this.TableInfo.Recordes
        ? this.TableInfo.Recordes
        : this.TableInfo.PageNumber * this._bodyData.PageSize;
    this.setTooltips(this.elRef.nativeElement.querySelector('#gridView'));
    this.hideFooter = true;
    sessionStorage.setItem(
      sessionStorage.getItem('processName').toString() + 'gridPage',
      JSON.stringify({ pageSize: this._bodyData.PageSize, pageNumber: this.TableInfo.PageNumber })
    );
  }
  //Entity related code– Nidhi
  getBlockCustomer() {
    return this.apiESaleyardService.get(`crmsales/GetBlockCustomer/${this.ParentTransactionId}`);
  }
  checkBlockCustomer(data) {
    if (data && data.length > 0) {
      this.tableData.map((x) => {
        const vendorSap =
          x.dmolotvinfovendorid && x.dmolotvinfovendorid.indexOf('-') > 0 ? x.dmolotvinfovendorid.split('-')[1] : x.dmolotvinfovendorid;
        const buyerSap =
          x.dmolotbinfobuyerid && x.dmolotbinfobuyerid.indexOf('-') > 0 ? x.dmolotbinfobuyerid.split('-')[1] : x.dmolotbinfobuyerid;
        if (data.findIndex((y) => y.isBlock === 'Yes' && y.CustomerID === vendorSap) > -1) {
          x.IsVendorBlock = true;
        }
        if (data.findIndex((y) => y.isBlock === 'Yes' && y.CustomerID === buyerSap) > -1) {
          x.IsBuyerBlock = true;
        }
      });
      this.HobbyFarmerList = data.filter((y) => y.IsVendor === 1 && y.dmocustmstrhobbyfarmer === 'Yes');
    }
  }

  getMetricsData() {
    this.apiESaleyardService.get(`crmlot/getLotSummary?saleTransactionID=${this.ParentTransactionId}`).subscribe((data) => {
      this.metricsData = data.metricsData;
    });
  }

  getDMOsMapping() {
    if (this.CanAddNewRow) {
      this.listviewService.dmoListOrderByDMO(this.ProcessName).subscribe((data) => {
        if (data) {
          data.forEach((item: any) => {
            this.dmoMapping[item.GUID] = item.Name;
          });
        }
      });
    }
  }
  //Changes Based on Parent Transaction ID #1038
  BindDMODropDown(dmoGuid) {
    if (!this.DMOData[dmoGuid]) {
      this.showItemLoading = false;
      this.DMOData[dmoGuid] = [];
      this.listviewService.DMOData(this.ProcessName, dmoGuid, this.ParentTransactionId).subscribe(
        (data) => {
          this.DMOData[dmoGuid] = data;
          this.showItemLoading = true;
        },
        (err) => {
          this.showItemLoading = true;
        }
      );
    }
  }

  getGridConfig(viewName: string) {
    if (viewName === '') {
      this.openGridConfigurationPopup('GridConfiguration', viewName);
    } else {
      this.ViewName = viewName;
      this.getGridConfigData();
    }
  }

  saveGridConfig() {
    const GridFinalJson = {
      ContainerID: this.GridGuid,
      FinalJson: JSON.stringify(this.gridConfigData),
      ViewName: this.ViewName,
      IsDefaultView: this.isDefaultView,
      OldViewName: this.ViewName,
      ProcessName: this.ProcessName,
    };
    this.listviewService.sendGridConfig(GridFinalJson).subscribe((data) => {});
  }

  openGridConfigurationPopup(poptype: string, viewName: string) {
    const modalRef = this.modalService.open(GridViewConfigurationComponent, {
      windowClass: 'grid-config-view-modal',
      backdrop: 'static',
      keyboard: false,
    });
    const modalInstance: GridViewConfigurationComponent = modalRef.componentInstance;
    modalInstance.gridConfigJson.ViewName = viewName;
    modalInstance.ProcessName = this.ProcessName;
    modalInstance.OldViewName = viewName;
    modalInstance.objBaseGrid = this;
  }

  // openNewExportPopup(ExportType: string) {
  //   const modalRef = this.modalService.open(GridViewExportComponent, { backdrop: 'static' });
  //   const modalInstance: GridViewExportComponent = modalRef.componentInstance;
  //   modalInstance.ExportType = ExportType.toUpperCase();
  //   modalInstance.ExportPopup = modalRef;
  //   modalInstance.ExportUserData.SortColumn = this._bodyData.SortColumn;
  //   modalInstance.ExportUserData.SortOrder = this._bodyData.SortOrder;
  //   modalInstance.ExportUserData.ProcessName = this._bodyData.ProcessName;
  //   modalInstance.ExportUserData.GridFilters = this._bodyData.GridFilters;
  //   modalInstance.ExportUserData.ParentTransactionID = this.ParentTransactionId;
  //   modalInstance.ExportUserData.columns = this.columns;
  //   modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
  // }

  /* ---------------------Open Confirmation Popup for selected item delete-------------- */
  showDeleteMessage() {
    const SelectedItem = this.tableData.filter((x) => x.selected === true);

    if (SelectedItem.length > 0) {
      this.msg.showMessage('Warning', {
        header: 'Delete Selected Item',
        body: 'Do you want to delete selected item?',
        btnText: 'Confirm Delete',
        checkboxText: 'Yes, delete selected item',
        isDelete: true,
        callback: this.deleteSelectedConfirmation,
        caller: this,
      });
    } else {
      this.msg.showMessage('Warning', { body: 'At least one record must be selected in order to delete' });
    }
  }

  FilterList(item): string {
    return item.map((e) => e.ConditionValue).join(',');
  }
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete Record',
      body: 'Are you sure you want to delete this record?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this record',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    });
  }

  /* -------------------------Delete Single Record---------------------- */
  deleteConfirmation(modelRef: NgbModalRef, Caller: LotsGridViewComponent) {
    if (Caller.transactionId) {
      Caller.listviewService.deleteGridData(Caller.transactionId).subscribe((result) => {
        if (result === true) {
          Caller.getGridData();
          Caller.isFilterClick = true;
          modelRef.close();
        }
      });
    } else {
      modelRef.close();
    }
  }

  /* -------------------------Delete Selected Item---------------------- */
  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: LotsGridViewComponent) {
    const SelectedItem = Caller.tableData
      .filter((x) => x.selected === true)
      .map((x) => x.TRNSCTNID)
      .join(',');
    if (SelectedItem) {
      Caller.listviewService.deleteGridData(SelectedItem).subscribe((result) => {
        if (result === true) {
          // #751 Create amended tax invoice if user delete lot on invoiced state.
          const deletedItem = Caller.tableData.filter((x) => x.selected === true);
          if (Caller.stage === 'Invoiced') {
            deletedItem.forEach((row) => {
              if (row.dmolotbinfobuyerid) {
                const Buyerid =
                  row.dmolotbinfobuyerid && row.dmolotbinfobuyerid.indexOf('-') > 0
                    ? row.dmolotbinfobuyerid.split('-')[1]
                    : row.dmolotbinfobuyerid;
                Caller.lot.AddChangesLot({ LotTransactionID: row[Caller.keyColumn], BuyerId: Buyerid, NewBuyerId: Buyerid }).subscribe();
              }
            });
          }
          Caller.getGridData();
          Caller.isFilterClick = true;
          Caller.SelectedRecordIds = [];
          Caller.saleServices.vendor.emit(Caller.ParentTransactionId);
          modelRef.close();
        }
      });
    } else {
      modelRef.close();
    }
  }

  /* -------------------------End Delete Selected Item---------------------- */

  bindColumnFilterDdl(item) {
    const FilterData = this.columnFilter.GetFilterByDataType(item.dataType); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) {
      // Check if Array is empty then call API for options data
      if (!this.ColumnData[item.datafield]) {
        this.showItemLoading = false;
        this.listviewService.DMOData(this.ProcessName, item.datafield, this.ParentTransactionId).subscribe((data) => {
          this.ColumnData[item.datafield] = data;
          this.showItemLoading = true;
        });
      }
    } else {
      this.ColumnData[item.datafield] = FilterData;
    }
  }

  bulk_update() {
    if (this.SelectedRecordIds.length === 0 || this.editDisabled) {
      return;
    } else {
      const modalRef = this.modalService.open(BulkUploadLotComponent, { size: 'lg', backdrop: 'static' });
      const modalInstance: BulkUploadLotComponent = modalRef.componentInstance;
      modalInstance.configLot = {
        processName: this.ProcessName,
        saleId: this.ParentTransactionId,
        //#740 cachedData replace with tableData because when checked all 'selected' property not added.
        selectedLots: this.tableData.filter((x) => x.selected === true),
        stage: this.stage,
        transactionIds: this.SelectedRecordIds,
        // isShowAgent: this.saleServices.IsConductingBranchSaleProcessor
        isShowAgent: true,
      };
      modalRef.result.then(
        async (result) => {
          if (result) {
            this.getGridData();
          }
        },
        (reason) => {}
      );
    }
  }
  openBulkUpload(bulkUpload) {
    this.file = null;
    this.fileName = '';
    this.modalService.open(bulkUpload, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false });
  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);
    if (this.file) {
      if (
        this.file.type === 'application/vnd.ms-excel' ||
        this.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.IsValidFile = false;
        this.fileName = this.file.name;
        console.log('Accept');
      } else {
        this.fileName = '';
        this.errorMsg = 'File not valid';
        this.IsValidFile = true;
      }
    }
    console.log('type', this.file.type);
  }
  upload() {
    if (this.file === null) {
      this.IsValidFile = true;
      this.errorMsg = 'Please select file';
      return;
    }
    this.IsValidFile = false;
    this.errorMsg = '';
    const formData = new FormData();
    formData.append('processName', this.ProcessName);
    formData.append('uploadFile', this.file);

    this.listviewService.UploadFile(formData).subscribe(
      (Result) => {
        console.log(Result);
        if (Result === true) {
          this.file = null;
          this.fileName = '';
          console.log('done');
          this.getGridConfigData();
          this.modalService.dismissAll();
          this.msg.showMessage('Success', { body: 'Upload done' });
        } else {
          this.msg.showMessage('Fail', { body: Result.Message });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#region Copy
  openCopyConfirmation(id) {
    this.transactionId = id;
    this.router.navigate([`/process_control/${this.ProcessName}/copy_view`, id, this.ParentTransactionId]);
  }

  navigateDetailPage(id: any) {
    this.router.navigate(['./lots', id], { relativeTo: this.route });
  }

  goToDetailPage(item: any) {
    this.IsGotoDetailPage = true;
    const id = item[this.keyColumn];
    if (item.IsVendorBlock || item.IsBuyerBlock) {
      let a = JSON.stringify({
        IsVendorBlock: item.IsVendorBlock ? item.IsVendorBlock : false,
        IsBuyerBlock: item.IsBuyerBlock ? item.IsBuyerBlock : false,
      });
      sessionStorage.setItem('BlockCustomer', a);
    }
    this.navigateDetailPage(id);
  }

  goToNewLotPage() {
    this.navigateDetailPage('new');
  }

  confirmSaveRowRecord(row: any) {
    const msgRef = this.msg.showMessage('Warning', {
      header: 'Save This Record',
      body: 'Are you sure you want to save this record?',
      btnText: 'Confirm',
      isConfirmation: true,
      autoFocusOnConfirm: true,
    });

    msgRef.result.then(
      async (result) => {
        if (result) {
          if (this.productNameMessage == 'Product name is Not Exist') {
            return;
          }
          this.vendorIdMessage = '';
          this.vendorNameMessage = '';
          this.buyerIdMessage = '';
          this.buyerNameMessage = '';
          this.productNameMessage = '';
          this.productDescriptionMessage = '';
          this.breedMessage = '';
          this.BuyerBranchMessage = '';
          this.VendorBranchMessage = '';
          const vendorSap =
            row.edit_value.dmolotvinfovendorid && row.edit_value.dmolotvinfovendorid.indexOf('-') > 0
              ? row.edit_value.dmolotvinfovendorid.split('-')[1]
              : row.edit_value.dmolotvinfovendorid;
          const buyerSap =
            row.edit_value.dmolotbinfobuyerid && row.edit_value.dmolotbinfobuyerid.indexOf('-') > 0
              ? row.edit_value.dmolotbinfobuyerid.split('-')[1]
              : row.edit_value.dmolotbinfobuyerid;
          const validateLotData: any = {
            VendorId: vendorSap,
            VendorName: row.edit_value.dmolotvinfovendornam,
            BuyerId: buyerSap,
            BuyerName: row.edit_value.dmolotbinfobuyername,
            ProductName: row.edit_value.dmolotlotinfopdct,
            ProductDescription: row.edit_value.dmolotlotinfoproddesc,
            BreedName: row.edit_value.dmolotlotinfobrd,
            VendorBranchName:
              row.edit_value.dmolotvinfovendorbrc == undefined
                ? ''
                : row.edit_value.dmolotvinfovendorbrc.dmobranchbrcode == undefined
                ? row.edit_value.dmolotvinfovendorbrc
                : row.edit_value.dmolotvinfovendorbrc.dmobranchbrname + ' (' + row.edit_value.dmolotvinfovendorbrc.dmobranchbrcode + ')',
            BuyerBranchName:
              row.edit_value.dmolotbinfobuyerbrc == undefined
                ? ''
                : row.edit_value.dmolotbinfobuyerbrc.dmobranchbrcode == undefined
                ? row.edit_value.dmolotbinfobuyerbrc
                : row.edit_value.dmolotbinfobuyerbrc.dmobranchbrname + ' (' + row.edit_value.dmolotbinfobuyerbrc.dmobranchbrcode + ')',
          };
          this.lotSearchService.validateLotSummaryRecord(validateLotData).subscribe((data) => {
            this.vendorIdMessage = data[0].VendorIdMessage;
            this.vendorNameMessage = data[0].VendorNameMessage;
            this.buyerIdMessage = data[0].BuyerIdMessage;
            this.buyerNameMessage = data[0].BuyerNameMessage;
            this.productNameMessage = data[0].ProductNameMessage;
            this.productDescriptionMessage = data[0].ProductDescriptionMessage;
            this.breedMessage = data[0].BreedMessage;
            this.VendorBranchMessage = data[0].VendorBranchMessage;
            this.BuyerBranchMessage = data[0].BuyerBranchMessage;
            this.flag = false;
            if (this.vendorIdMessage === 'VendorId is Not Exist') {
              this.flag = true;
            }
            if (this.vendorNameMessage === 'Vendor name is Not Exist') {
              this.flag = true;
            }

            if (this.buyerIdMessage === 'BuyerId is Not Exist') {
              this.flag = true;
            }

            if (this.buyerNameMessage === 'Buyer name is Not Exist') {
              this.flag = true;
            }

            if (this.productNameMessage === 'Product name is Not Exist') {
              this.flag = true;
            }

            if (this.productDescriptionMessage === 'Product description is Not Exist') {
              this.flag = true;
            }

            if (this.breedMessage === 'Breed name is Not Exist') {
              this.flag = true;
            }
            if (data[0].BuyerBranchMessage === 'Buyer branch is Not Exist') {
              this.flag = true;
            }
            if (data[0].VendorBranchMessage === 'Vendor branch is Not Exist') {
              this.flag = true;
            }

            if (this.flag) {
              return false;
            }
            if (row.edit_value.dmolotvinfovendorbrc && row.edit_value.dmolotvinfovendorbrc.dmobranchbrcode !== undefined) {
              row.edit_value.dmolotvinfovendorbrc =
                row.edit_value.dmolotvinfovendorbrc.dmobranchbrname + ' (' + row.edit_value.dmolotvinfovendorbrc.dmobranchbrcode + ')';
            }
            if (row.edit_value.dmolotbinfobuyerbrc && row.edit_value.dmolotbinfobuyerbrc.dmobranchbrcode !== undefined) {
              row.edit_value.dmolotbinfobuyerbrc =
                row.edit_value.dmolotbinfobuyerbrc.dmobranchbrname + ' (' + row.edit_value.dmolotbinfobuyerbrc.dmobranchbrcode + ')';
            }
            if (row.edit_value.dmolotbinfobuyerpic) {
              row.edit_value.dmolotbinfobuyerpic = row.edit_value.dmolotbinfobuyerpic.toString().toUpperCase();
            }
            if (row.edit_value.dmolotvinfovendorpic) {
              row.edit_value.dmolotvinfovendorpic = row.edit_value.dmolotvinfovendorpic.toString().toUpperCase();
            }
            if (this.VendorCompanyCode) {
              row.edit_value.domlotvinfocompcode = this.VendorCompanyCode;
            }
            if (this.BuyerCompanyCode) {
              row.edit_value.dmolotbinfocompcode = this.BuyerCompanyCode;
            }
            if (row.edit_value.dmolotvinfovendorid && row.edit_value.dmolotvinfovendorid.indexOf('-') > 0) {
              row.edit_value.dmolotvinfovendorid = vendorSap;
            }
            if (row.edit_value.dmolotbinfobuyerid && row.edit_value.dmolotbinfobuyerid.indexOf('-') > 0) {
              row.edit_value.dmolotbinfobuyerid = buyerSap;
            }
            /* Entity Start 26 Feb Roshan */
            if (!row.edit_value.dmolotvinfovendorid) {
              row.edit_value.domlotvinfocompcode = '';
            }
            if (!row.edit_value.dmolotbinfobuyerid) {
              row.edit_value.dmolotbinfocompcode = '';
            }
            /* Entity End 26 Feb Roshan */
            const submitData: any = {
              Identifier: {
                Name: null,
                Value: null,
                TrnsctnID: row[this.keyColumn],
              },
              ProcessName: this.ProcessName,
              TriggerName: 'TRGR_LotPreProcessing_LotSave',
              UserName: this.userDetail.UserName,
              Data: [row.edit_value],
            };
            delete submitData.Data[0].GST;
            delete submitData.Data[0].TotalGST;
            delete submitData.Data[0].lotAgent;
            if (
              submitData.Data[0].dmolotbinfobuyerbrc == null ||
              submitData.Data[0].dmolotbinfobuyerbrc == undefined ||
              submitData.Data[0].dmolotbinfobuyerbrc.indexOf('(') === -1
            ) {
              if (submitData.Data[0].dmolotbinfobuyerbrc == null || submitData.Data[0].dmolotbinfobuyerbrc == undefined)
                submitData.Data[0].dmolotbinfobuyerbrc = '';
              else delete submitData.Data[0].dmolotbinfobuyerbrc;
            }
            if (
              submitData.Data[0].dmolotvinfovendorbrc == null ||
              submitData.Data[0].dmolotvinfovendorbrc == undefined ||
              submitData.Data[0].dmolotvinfovendorbrc.indexOf('(') === -1
            ) {
              if (submitData.Data[0].dmolotvinfovendorbrc == null || submitData.Data[0].dmolotvinfovendorbrc == undefined)
                submitData.Data[0].dmolotvinfovendorbrc = '';
              else delete submitData.Data[0].dmolotvinfovendorbrc;
            }
            delete submitData.Data[0].selected;

            const lotProcessData = {
              applicationData: submitData,
              saveLotFeesChargesRequest: null,
              lotChangesRequest: null,
              recalcVendorCommission: this.RecalcVendorCommission,
              recalcCharges: this.RecalcCharges,
              saleCompanyCode: this.updateSaleCompanyCode(row.edit_value.domlotvinfocompcode, row.edit_value.dmolotbinfocompcode),
              saleTransactionID: this.ParentTransactionId,
              lotTransactionID: null,
              isReversal: this.isReversal,
              isCalcFeesFieldsChanged: false,
              isCalcBuyerBranchRebate: false,
            };
            if (row.isCalcFeesFieldsChanged) {
              lotProcessData.isCalcFeesFieldsChanged = true;
            }
            if (row.edit_value.dmolotbinfobuyerid) {
              const ischanges = Object.keys(row.edit_value).some((x) => {
                if (row[x] !== row.edit_value[x]) {
                  return this.lot.isChangeValueForGuidTaxAmd(x);
                }
              });
              if (this.stage === 'Invoiced' && ischanges) {
                if (row.dmolotbinfobuyerid) {
                  let statusCheck = false;
                  Object.keys(row.edit_value).forEach((dmoGuid) => {
                    let newValue = '';
                    let oldValue = '';
                    if (dmoGuid == 'dmolotvinfovendorid' || dmoGuid == 'dmolotbinfobuyerid') {
                      oldValue =
                        row.edit_value[dmoGuid] == undefined || row.edit_value[dmoGuid] == null
                          ? ''
                          : row[dmoGuid].indexOf('-') > 0
                          ? row[dmoGuid].split('-')[1]
                          : row[dmoGuid];
                    } else {
                      oldValue = row[dmoGuid] == undefined || row[dmoGuid] == null ? '' : row[dmoGuid];
                    }
                    newValue = row.edit_value[dmoGuid] == undefined || row.edit_value[dmoGuid] == null ? '' : row.edit_value[dmoGuid];

                    if (newValue != oldValue && this.lot.isChangeValueForGuidTaxAmd(dmoGuid)) {
                      statusCheck = true;
                    }
                  });
                  let newBuyer = buyerSap;
                  const oldBuyerSap =
                    row.dmolotbinfobuyerid && row.dmolotbinfobuyerid.indexOf('-') > 0
                      ? row.dmolotbinfobuyerid.split('-')[1]
                      : row.dmolotbinfobuyerid;
                  newBuyer = newBuyer && newBuyer.indexOf('-') > 0 ? newBuyer.split('-')[1] : newBuyer;
                  // if (oldBuyerSap == newBuyer) {
                  //   newBuyer = null;
                  // }
                  if (statusCheck)
                    lotProcessData.lotChangesRequest = {
                      LotTransactionID: row[this.keyColumn],
                      BuyerId: oldBuyerSap,
                      NewBuyerId: newBuyer,
                    };
                }
              }
            }
            this.saleServices.ProcessLot(lotProcessData).subscribe((response) => {
              this.RecalcVendorCommission = false;
              this.RecalcCharges = false;
              this.HobbyFarmer === '';
              this.GSTFlag = '';
              this.IsAddNewRow = false;
              this.toastr.success('Grid updated successfully.');
              this.checkGSTApplicable(row);
              this.getGridData();
            });
          });
        }
      },
      (reason) => {}
    );
  }

  confirmCreateNewRecord() {
    this.msg.showMessage('Warning', {
      header: 'Create New Record',
      body: 'Are you sure you want to create new record?',
      btnText: 'Confirm',
      isConfirmation: true,
      callback: this.createNewRecord,
      caller: this,
    });
  }

  createNewRecord(modelRef: NgbModalRef, Caller: LotsGridViewComponent) {
    if (Caller.productNameMessage == 'Product name is Not Exist') {
      return;
    }
    const rowData = { ...Caller.newRow.edit_value };
    Caller.vendorIdMessage = '';
    Caller.vendorNameMessage = '';
    Caller.buyerIdMessage = '';
    Caller.buyerNameMessage = '';
    Caller.productNameMessage = '';
    Caller.productDescriptionMessage = '';
    Caller.breedMessage = '';
    rowData.dmolotvinfovendorid =
      rowData.dmolotvinfovendorid && rowData.dmolotvinfovendorid.indexOf('-') > 0
        ? rowData.dmolotvinfovendorid.split('-')[1]
        : rowData.dmolotvinfovendorid;
    rowData.dmolotbinfobuyerid =
      rowData.dmolotbinfobuyerid && rowData.dmolotbinfobuyerid.indexOf('-') > 0
        ? rowData.dmolotbinfobuyerid.split('-')[1]
        : rowData.dmolotbinfobuyerid;
    const validateLotData: any = {
      VendorId: rowData.dmolotvinfovendorid,
      VendorName: rowData.dmolotvinfovendornam,
      BuyerId: rowData.dmolotbinfobuyerid,
      BuyerName: rowData.dmolotbinfobuyername,
      ProductName: rowData.dmolotlotinfopdct,
      ProductDescription: rowData.dmolotlotinfoproddesc,
      BreedName: rowData.dmolotlotinfobrd,
      VendorBranchName:
        rowData.dmolotvinfovendorbrc == undefined
          ? ''
          : rowData.dmolotvinfovendorbrc.dmobranchbrcode == undefined
          ? rowData.dmolotvinfovendorbrc
          : rowData.dmolotvinfovendorbrc.dmobranchbrname + ' (' + rowData.dmolotvinfovendorbrc.dmobranchbrcode + ')',
      BuyerBranchName:
        rowData.dmolotbinfobuyerbrc == undefined
          ? ''
          : rowData.dmolotbinfobuyerbrc.dmobranchbrcode == undefined
          ? rowData.dmolotbinfobuyerbrc
          : rowData.dmolotbinfobuyerbrc.dmobranchbrname + ' (' + rowData.dmolotbinfobuyerbrc.dmobranchbrcode + ')',
    };

    Caller.lotSearchService.validateLotSummaryRecord(validateLotData).subscribe((data) => {
      Caller.vendorIdMessage = data[0].VendorIdMessage;
      Caller.vendorNameMessage = data[0].VendorNameMessage;
      Caller.buyerIdMessage = data[0].BuyerIdMessage;
      Caller.buyerNameMessage = data[0].BuyerNameMessage;
      Caller.productNameMessage = data[0].ProductNameMessage;
      Caller.productDescriptionMessage = data[0].ProductDescriptionMessage;
      Caller.breedMessage = data[0].BreedMessage;
      Caller.VendorBranchMessage = data[0].VendorBranchMessage;
      Caller.BuyerBranchMessage = data[0].BuyerBranchMessage;
      Caller.flag = false;
      if (Caller.vendorIdMessage === 'VendorId is Not Exist') {
        Caller.flag = true;
      }
      if (Caller.vendorNameMessage === 'Vendor name is Not Exist') {
        Caller.flag = true;
      }

      if (Caller.buyerIdMessage === 'BuyerId is Not Exist') {
        Caller.flag = true;
      }

      if (Caller.buyerNameMessage === 'Buyer name is Not Exist') {
        Caller.flag = true;
      }

      if (Caller.productNameMessage === 'Product name is Not Exist') {
        Caller.flag = true;
      }

      if (Caller.productDescriptionMessage === 'Product description is Not Exist') {
        Caller.flag = true;
      }

      if (Caller.breedMessage === 'Breed name is Not Exist') {
        Caller.flag = true;
      }
      if (Caller.BuyerBranchMessage === 'Buyer branch is Not Exist') {
        Caller.flag = true;
      }
      if (Caller.VendorBranchMessage === 'Vendor branch is Not Exist') {
        Caller.flag = true;
      }
      if (Caller.flag === true) {
        return false;
      }
      if (rowData['dmolotlotinfohgp'] == undefined) {
        rowData['dmolotlotinfohgp'] = false;
      }
      const valueData: any = {};
      Object.keys(rowData).forEach((key) => {
        if (rowData[key] != null && rowData[key] !== '') {
          if ('dmolotvinfogstreg' === key) {
            valueData['DMOLot_VInfo_GstReg'] = rowData[key];
          } else if ('dmolotlotinfogstrate' === key) {
            valueData['DMOLot_LotInfo_GSTRate'] = Caller.GstRate;
          } else if ('domlotvinfocompcode' === key && rowData.dmolotvinfovendorid) {
            valueData['DOMLot_VInfo_CompCode'] = rowData[key];
          } else if ('dmolotbinfocompcode' === key && rowData.dmolotbinfobuyerid) {
            valueData['DMOLot_BInfo_CompCode'] = rowData[key];
          } else {
            valueData[Caller.dmoMapping[key]] = rowData[key];
            if (
              valueData[Caller.dmoMapping[key]] &&
              (Caller.dmoMapping[key] === 'DMOLot_BInfo_BuyerPic' || Caller.dmoMapping[key] === 'DMOLot_VInfo_VendorPic')
            ) {
              valueData[Caller.dmoMapping[key]] = valueData[Caller.dmoMapping[key]].toString().toUpperCase();
            }
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
      const submitData: any = {
        ProcessName: Caller.ProcessName,
        UserName: Caller.userDetail.UserName,
        TriggerName: 'TRGR_LotPreProcessing_LotSave', //Trigger permissson  // Caller.TriggerName,
        Data: [valueData],
      };
      if (Caller.IsSubProcess) {
        submitData.ParentTransactionID = Caller.ParentTransactionId;
      }
      this.RecalcVendorCommission = true;
      this.RecalcCharges = true;

      const lotProcessData = {
        applicationData: submitData,
        saveLotFeesChargesRequest: null,
        lotChangesRequest: null,
        recalcVendorCommission: Caller.RecalcVendorCommission,
        recalcCharges: Caller.RecalcCharges,
        saleCompanyCode: Caller.updateSaleCompanyCode(this.VendorCompanyCode, this.BuyerCompanyCode),
        saleTransactionID: Caller.ParentTransactionId,
        lotTransactionID: null,
        isReversal: Caller.isReversal,
        isCalcBuyerBranchRebate: false,
      };
      if (
        Caller.stage === 'Invoiced' &&
        rowData.dmolotbinfobuyerid &&
        Object.keys(valueData).some((x) => Caller.lot.isChangeValueForNameTaxAmd(x))
      ) {
        lotProcessData.lotChangesRequest = {
          LotTransactionID: '',
          BuyerId: rowData.dmolotbinfobuyerid,
          NewBuyerId: rowData.dmolotbinfobuyerid,
        };
      }
      Caller.saleServices.ProcessLot(lotProcessData).subscribe((response) => {
        // Caller.transactionId = response.result.transactionId;
        Caller.HobbyFarmer === '';
        Caller.GSTFlag = '';
        Caller.toastr.success('Created new record successfully');
        Caller.newRow.edit_value = {};
        Caller.IsAddNewRow = false;
        Caller.saleServices.vendor.emit(Caller.ParentTransactionId);
        Caller.getGridData();
        Caller.isFilterClick = true;
        Caller.RecalcVendorCommission = false;
        Caller.RecalcCharges = false;
        modelRef.close();
      });
    });
  }

  lastTabEntered(event, isUpdate: boolean, row?: any) {
    event.srcElement.blur();
    event.preventDefault();
    if (isUpdate) {
      this.confirmSaveRowRecord(row);
    } else {
      this.confirmCreateNewRecord();
    }
  }

  rowEntered(event, isUpdate: boolean, row?: any) {
    event.srcElement.blur();
    event.preventDefault();
    if (!this.typeAheadEnter$.getValue()) {
      if (isUpdate) {
        this.confirmSaveRowRecord(row);
      } else {
        this.confirmCreateNewRecord();
      }
    } else {
      this.typeAheadEnter$.next(false);
    }
  }

  isValid(val: any) {
    return val != null && val !== '';
  }

  CalculationWeightQuanityCKGPricesHead(datafield: any, item: any) {
    this.GstRate = this.GstRateChanged;
    if (this.isGSTApplicable == false || this.isVendorGSTApplicable == false) {
      this.GstRate = 0;
    }
    switch (datafield) {
      case 'dmolotlotinfoqnty':
      case 'dmolotlotinfopricephd':
        if (
          this.isValid(item.edit_value.dmolotlotinfoqnty) &&
          this.isValid(item.edit_value.dmolotlotinfopricephd) &&
          (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === '$/head')
        ) {
          const turnover = item.edit_value.dmolotlotinfoqnty * item.edit_value.dmolotlotinfopricephd;
          this.SetValueDecimal('dmolotlotinfoturnovaud', turnover, item);

          if (
            this.isValid(item.edit_value.dmolotlotinfowtkg) &&
            !this.isValid(item.edit_value.dmolotlotinfopricecpkg) &&
            (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === '$/head')
          ) {
            let pricecpkg = 0.0;
            if (Number(item.edit_value.dmolotlotinfowtkg) > 0)
              pricecpkg = (item.edit_value.dmolotlotinfoturnovaud * 100) / item.edit_value.dmolotlotinfowtkg;
            this.SetValueDecimal('dmolotlotinfopricecpkg', pricecpkg, item);
          } else if (
            this.isValid(item.edit_value.dmolotlotinfowtkg) &&
            datafield === 'dmolotlotinfopricephd' &&
            (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === '$/head')
          ) {
            if (Number(item.edit_value.dmolotlotinfowtkg) > 0) {
              const pricecpkg = (item.edit_value.dmolotlotinfoturnovaud * 100) / item.edit_value.dmolotlotinfowtkg;
            } else {
              this.SetValueDecimal('dmolotlotinfopricecpkg', 0.0, item);
            }
          } else if (
            this.isValid(item.edit_value.dmolotlotinfopricecpkg) &&
            (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === '$/head')
          ) {
            if (Number(item.edit_value.dmolotlotinfopricecpkg) > 0) {
              const infowtkg = item.edit_value.dmolotlotinfoturnovaud / (item.edit_value.dmolotlotinfopricecpkg / 100);
              this.SetValueDecimal('dmolotlotinfowtkg', infowtkg, item);
            } else {
              this.SetValueDecimal('dmolotlotinfowtkg', 0.0, item);
            }
          }
        }
        if (
          this.isValid(item.edit_value.dmolotlotinfoqnty) &&
          this.isValid(item.edit_value.dmolotlotinfoturnovaud) &&
          datafield !== 'dmolotlotinfopricephd'
        ) {
          if (Number(item.edit_value.dmolotlotinfoqnty) > 0 && !this.isReversal) {
            const pricephd = item.edit_value.dmolotlotinfoturnovaud / item.edit_value.dmolotlotinfoqnty;
            this.SetValueDecimal('dmolotlotinfopricephd', pricephd, item);
          } else if (
            this.isValid(item.edit_value.dmolotlotinfoqnty) &&
            this.isValid(item.edit_value.dmolotlotinfowtkg) &&
            this.isReversal &&
            item.edit_value.dmolotlotinfopricetype === 'c/kg'
          ) {
            if (
              this.isValid(item.dmolotlotinfoqnty) &&
              this.isValid(item.dmolotlotinfopricecpkg) &&
              Number(item.edit_value.dmolotlotinfoqnty) <= Number(item.dmolotlotinfoqnty)
            ) {
              const qntPerc = (Number(item.edit_value.dmolotlotinfoqnty) * 100) / Number(item.dmolotlotinfoqnty);
              const infowtkg = (item.dmolotlotinfowtkg * qntPerc) / 100;
              this.SetValueDecimal('dmolotlotinfowtkg', infowtkg, item);
              const turnover = (infowtkg * item.edit_value.dmolotlotinfopricecpkg) / 100;
              this.SetValueDecimal('dmolotlotinfoturnovaud', turnover, item);
            }
          } else {
            this.SetValueDecimal('dmolotlotinfopricephd', 0.0, item);
          }
        }
        if (datafield === 'dmolotlotinfopricephd' && this.isValid(item.edit_value.dmolotlotinfopricephd)) {
          item.edit_value.dmolotlotinfopricetype = '$/head';
        }

        break;
      case 'dmolotlotinfopricecpkg':
      case 'dmolotlotinfowtkg':
        if (
          this.isValid(item.edit_value.dmolotlotinfowtkg) &&
          this.isValid(item.edit_value.dmolotlotinfopricecpkg) &&
          (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === 'c/kg')
        ) {
          const turnover = (item.edit_value.dmolotlotinfowtkg * item.edit_value.dmolotlotinfopricecpkg) / 100;
          this.SetValueDecimal('dmolotlotinfoturnovaud', turnover, item);
          if (
            this.isValid(item.edit_value.dmolotlotinfoqnty) &&
            !this.isValid(item.edit_value.dmolotlotinfopricephd) &&
            (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === 'c/kg')
          ) {
            if (Number(item.edit_value.dmolotlotinfoqnty) > 0) {
              const pricephd = item.edit_value.dmolotlotinfoturnovaud / item.edit_value.dmolotlotinfoqnty;
              this.SetValueDecimal('dmolotlotinfopricephd', pricephd, item);
            } else {
              this.SetValueDecimal('dmolotlotinfopricephd', 0.0, item);
            }
          } else if (
            this.isValid(item.edit_value.dmolotlotinfoqnty) &&
            (!this.isValid(item.edit_value.dmolotlotinfopricetype) || item.edit_value.dmolotlotinfopricetype === 'c/kg')
          ) {
            if (Number(item.edit_value.dmolotlotinfoqnty) > 0) {
              const pricephd = item.edit_value.dmolotlotinfoturnovaud / item.edit_value.dmolotlotinfoqnty;
              this.SetValueDecimal('dmolotlotinfopricephd', pricephd, item);
            } else {
              this.SetValueDecimal('dmolotlotinfopricephd', 0.0, item);
            }
          }
        } else if (
          this.isValid(item.edit_value.dmolotlotinfowtkg) &&
          this.isValid(item.edit_value.dmolotlotinfoturnovaud) &&
          datafield !== 'dmolotlotinfopricecpkg'
        ) {
          if (Number(item.edit_value.dmolotlotinfowtkg) > 0) {
            const pricecpkg = (item.edit_value.dmolotlotinfoturnovaud * 100) / item.edit_value.dmolotlotinfowtkg;
            this.SetValueDecimal('dmolotlotinfopricecpkg', pricecpkg, item);
          } else {
            this.SetValueDecimal('dmolotlotinfopricecpkg', 0.0, item);
          }
        } else if (
          this.isValid(item.edit_value.dmolotlotinfopricecpkg) &&
          this.isValid(item.edit_value.dmolotlotinfoturnovaud) &&
          datafield !== 'dmolotlotinfowtkg'
        ) {
          if (Number(item.edit_value.dmolotlotinfopricecpkg) > 0) {
            const infowtkg = item.edit_value.dmolotlotinfoturnovaud / (item.edit_value.dmolotlotinfopricecpkg / 100);
            this.SetValueDecimal('dmolotlotinfowtkg', infowtkg, item);
          } else {
            this.SetValueDecimal('dmolotlotinfowtkg', 0.0, item);
          }
        }

        if (datafield === 'dmolotlotinfopricecpkg' && this.isValid(item.edit_value.dmolotlotinfopricecpkg)) {
          item.edit_value.dmolotlotinfopricetype = 'c/kg';
        }

        break;
      case 'dmolotlotinfoturnovaud':
        if (
          this.isValid(item.edit_value.dmolotlotinfoturnovaud) &&
          this.isValid(item.edit_value.dmolotlotinfowtkg) &&
          item.edit_value.dmolotlotinfopricecpkg === ''
        ) {
          if (Number(item.edit_value.dmolotlotinfowtkg) > 0) {
            const infopricecpkg = (item.edit_value.dmolotlotinfoturnovaud * 100) / item.edit_value.dmolotlotinfowtkg;
            this.SetValueDecimal('dmolotlotinfopricecpkg', infopricecpkg, item);
          } else {
            this.SetValueDecimal('dmolotlotinfopricecpkg', 0.0, item);
          }
        } else if (
          this.isValid(item.edit_value.dmolotlotinfoturnovaud) &&
          this.isValid(item.edit_value.dmolotlotinfopricecpkg) &&
          item.edit_value.dmolotlotinfowtkg === ''
        ) {
          if (Number(item.edit_value.dmolotlotinfopricecpkg) > 0) {
            const inforwtkg = item.edit_value.dmolotlotinfoturnovaud / (item.edit_value.dmolotlotinfopricecpkg / 100);
            this.SetValueDecimal('dmolotlotinfowtkg', inforwtkg, item);
          } else {
            this.SetValueDecimal('dmolotlotinfowtkg', 0.0, item);
          }
        }

        if (
          this.isValid(item.edit_value.dmolotlotinfoturnovaud) &&
          this.isValid(item.edit_value.dmolotlotinfoqnty) &&
          item.edit_value.dmolotlotinfopricephd === ''
        ) {
          if (Number(item.edit_value.dmolotlotinfoqnty) > 0) {
            const pricephd = item.edit_value.dmolotlotinfoturnovaud / item.edit_value.dmolotlotinfoqnty;
            this.SetValueDecimal('dmolotlotinfopricephd', pricephd, item);
          } else {
            this.SetValueDecimal('dmolotlotinfopricephd', 0.0, item);
          }
        }
        break;
    }

    if (this.isValid(item.edit_value.dmolotlotinfoturnovaud)) {
      let infogst = 0.0;
      if (
        item.edit_value.dmolotvinfovendorid != undefined &&
        item.edit_value.dmolotvinfovendorid != null &&
        item.edit_value.dmolotvinfovendorid != ''
      )
        infogst = this.GstRate * (item.edit_value.dmolotlotinfoturnovaud / 100);
      else infogst = 0.0;
      this.SetValueDecimal('dmolotlotinfogst', infogst, item);
      const turnovergs = Number(item.edit_value.dmolotlotinfoturnovaud) + Number(item.edit_value.dmolotlotinfogst);
      this.SetValueDecimal('dmolotlotinfoturnovergs', turnovergs, item);
    } else {
      this.SetValueDecimal('dmolotlotinfogst', 0, item);
      this.SetValueDecimal('dmolotlotinfoturnovergs', 0, item);
    }
  }
  SetValueDecimal(controlName: any, value: any, item: any) {
    switch (controlName) {
      case 'dmolotlotinfopricecpkg':
        item.edit_value.dmolotlotinfopricecpkg = this.lot.round(value, 4).toFixed(4);
        break;
      case 'dmolotlotinfoturnovergs':
        item.edit_value.dmolotlotinfoturnovergs = this.lot.round(value, 2).toFixed(2);
        break;
      case 'dmolotlotinfoturnovaud':
        item.edit_value.dmolotlotinfoturnovaud = this.lot.round(value, 2).toFixed(2);
        break;
      case 'dmolotlotinfopricephd':
        item.edit_value.dmolotlotinfopricephd = this.lot.round(value, 2).toFixed(2);
        break;
      case 'dmolotlotinfowtkg':
        item.edit_value.dmolotlotinfowtkg = this.lot.round(value, 2).toFixed(2);
        break;
      case 'dmolotlotinfogst':
        let gstlot = this.lot.round(value, 4);
        gstlot = this.lot.round(gstlot, 3);
        gstlot = this.lot.round(gstlot, 2);
        //  item.edit_value.dmolotlotinfogst = this.lot.round(value, 4).toFixed(2);
        item.edit_value.dmolotlotinfogst = gstlot;
        break;
    }
  }
  fixedValue(item, dmo, toFixedValue = 2) {
    if (!!item.edit_value[dmo]) {
      item.edit_value[dmo] = parseFloat(item.edit_value[dmo]).toFixed(toFixedValue);
    }
  }
  ValidateAlphanumeric(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || (charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123)) {
      return true;
    }
    return false;
  }

  createDuplicateLot(rows: any) {
    this.transactionId = rows.TRNSCTNID;
    this.msg.showMessage('Warning', {
      header: 'Create Duplicate Lot',
      body: 'Are you sure you want to create duplicate lot?',
      btnText: 'Confirm',
      isConfirmation: true,
      callback: this.createDuplicateRecord,
      caller: this,
    });
  }

  createDuplicateRecord(modelRef: NgbModalRef, Caller: LotsGridViewComponent) {
    Caller.lotSearchService.createDuplicateLot(Caller.transactionId).subscribe((data) => {
      if (data != null && data != '') {
        Caller.getGridData();
        Caller.toastr.success('Created duplicate record successfully.');
      }
    });
  }

  calcFieldChanged(item: any) {
    item.isCalcFeesFieldsChanged = true;
  }

  async calcLotFeesChargesById(SaleTransactionID: string, LotTransactionID: string) {
    const bodyData = {
      SaleTransactionID,
      LotTransactionID,
      RecalcCharges: this.RecalcCharges,
      RecalcVendorCommission: this.RecalcVendorCommission,
    };

    if (this.isReversal) {
      delete bodyData.SaleTransactionID;
    }

    await this.apiESaleyardService.post('crmlot/calcLotFeesChargesById', bodyData).toPromise();
  }

  editRow(item: any) {
    if (this.tableData.filter((rowItem) => rowItem.isEdit).length) {
      return;
    }
    this.GridItem = item;
    this.checkIfUnsoldLotsVendorBuyerCartge(item);

    // Make edit
    item.isEdit = true;
    item.isDdl = false;
    item.isDdlBuyer = false;

    // Bind vendor branch DDL
    item.vendorBranchOptions = [];
    item.vendorBranchOptions.push({
      ValueField: item.dmolotvinfovendorbrc.substr(item.dmolotvinfovendorbrc.indexOf('(') + 1).replace(')', ''),
      TextField: item.dmolotvinfovendorbrc,
    });
    item.edit_value.dmolotvinfovendorbrc = item.vendorBranchOptions[0].ValueField;
    if (item.vendorBranchOptions[0].ValueField === '') {
      item.isDdl = true;
    }

    // Bind buyer branch DDL
    item.buyerBranchOptions = [];
    item.buyerBranchOptions.push({
      ValueField: item.dmolotbinfobuyerbrc.substr(item.dmolotbinfobuyerbrc.indexOf('(') + 1).replace(')', ''),
      TextField: item.dmolotbinfobuyerbrc,
    });
    item.edit_value.dmolotbinfobuyerbrc = item.buyerBranchOptions[0].ValueField;

    if (item.buyerBranchOptions[0].ValueField === '') {
      item.isDdlBuyer = true;
    }
    // Bind vendor PIC DDL
    // Entity Start Feb 03 2021 Roshan
    const VendorSap =
      item.dmolotvinfovendorid && item.dmolotvinfovendorid.indexOf('-') > -1
        ? item.dmolotvinfovendorid.split('-')[1]
        : item.dmolotvinfovendorid;
    // Entity End Feb 03 2021 Roshan
    if (Object.keys(item).find((x) => x === 'dmolotvinfovendorpic') && item.dmolotvinfovendorid) {
      this.getVendorPic(item, VendorSap, item.dmolotvinfovendorpic);
    } else {
      item.vendorPICOptions = [];
      item.vendorPICOptions.push(item.dmolotvinfovendorpic);
    }

    // Bind buyer PIC DDL
    // Entity Start Feb 03 2021 Roshan
    const BuyerSap =
      item.dmolotbinfobuyerid && item.dmolotbinfobuyerid.indexOf('-') > -1
        ? item.dmolotbinfobuyerid.split('-')[1]
        : item.dmolotbinfobuyerid;
    // Entity End Feb 03 2021 Roshan
    if (Object.keys(item).find((x) => x === 'dmolotbinfobuyerpic') && item.dmolotbinfobuyerid) {
      this.getBuyerPic(item, BuyerSap, item.dmolotbinfobuyerpic);
    } else {
      item.buyerPICOptions = [];
      item.buyerPICOptions.push(item.dmolotbinfobuyerpic);
    }
    this.checkGSTApplicable(item);
    if (item.dmolotvinfovendorid && item.dmolotvinfovendorid.indexOf('-') > -1) {
      this.lotSearchService.vendorCompany = item.dmolotvinfovendorid.split('-')[0];
    }
    if (item.dmolotbinfobuyerid && item.dmolotbinfobuyerid.indexOf('-') > -1) {
      this.lotSearchService.buyerCompany = item.dmolotbinfobuyerid.split('-')[1];
    }
  }
  checkGSTApplicable(item) {
    this.GstRate = this.GstRateChanged;
    this.isGSTApplicable = true;
    this.isVendorGSTApplicable = true;
    // Get gst applicable
    if (Object.keys(item).find((x) => x === 'dmolotlotinfopdct')) {
      this.lotSearchService.getGstApplicable(item.dmolotlotinfopdct).subscribe((x) => {
        if (x && x.length > 0) {
          if (x[0].dmoproductgst == 'No') {
            this.isGSTApplicable = false;
          } else {
            this.isGSTApplicable = true;
          }
        }
      });
    }
    // Get vendor gst flag
    if (Object.keys(item).find((x) => x === 'dmolotvinfovendorid') && item.dmolotvinfovendorid) {
      this.lotSearchService.getVendorData(item.dmolotvinfovendorid, 'VendorId').subscribe((x) => {
        if (x && x.Data.length > 0) {
          if (!(x.Data[0].dmocustmstrgstflg == 'Yes' && x.Data[0].dmocustmstrhobbyfarmer == 'No' && x.Data[0].dmocustmstrcustabn)) {
            this.isVendorGSTApplicable = false;
          } else {
            this.isVendorGSTApplicable = true;
          }
        }
      });
    }
  }
  vendorBranchSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorBranchSearch(text$);
  };
  branchSearch = (text$: Observable<string>) => {
    return this.lotSearchService.branchSearch(text$);
  };

  getGst() {
    this.lot.getGstRate().subscribe((res) => {
      this.GstRate = res.GSTRate;
      this.GstRateChanged = res.GSTRate;
    });
  }

  openLinkFromUrl() {}

  runReport(item: any, reportName: string) {
    let stage = '';
    if (this.stage === SaleStage.Inprocess) {
      stage = 'InProcess';
    } else if (this.stage === SaleStage.Invoiced) {
      stage = 'Invoiced';
    } else if (this.stage === SaleStage.Finalised) {
      stage = 'Finalised';
    } else if (this.stage === SaleStage.ReversalProcess) {
      stage = 'DraftReversalInstance';
    } else if (this.stage === SaleStage.ReversalCompleted) {
      stage = 'ReversedSale';
    }

    let customerNumber = null;
    if (reportName === 'TaxInvoice') {
      customerNumber = item.dmolotbinfobuyerid;
    } else if (reportName === 'AccountSale') {
      customerNumber = item.dmolotvinfovendorid;
    } else if (reportName.includes('Buyer')) {
      customerNumber = item.dmolotbinfobuyerid;
    } else if (reportName.includes('Vendor')) {
      customerNumber = item.dmolotvinfovendorid;
    }

    let url = '';
    customerNumber = customerNumber == '' ? 0 : customerNumber;
    customerNumber = customerNumber && customerNumber.indexOf('-') > 0 ? customerNumber.split('-')[1] : customerNumber;
    if (customerNumber == null) {
      url = `report/runReport?SaleTransactionID=${this.ParentTransactionId}&ReportName=${reportName}&Stage=${stage}`;
    } else {
      url = `report/runReport?SaleTransactionID=${this.ParentTransactionId}&CustomerNumber=${customerNumber}&ReportName=${reportName}&Stage=${stage}&Amended=true`;
    }

    this.apiESaleyardService.postGetFile(url, null, 'Blob').subscribe(
      (res: Blob) => {
        if (res.type === 'application/pdf') {
          const fileURL = URL.createObjectURL(res);
          window.open(fileURL, '_blank');
        } else {
          this.toastr.warning('There is no data for this report.');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setDocsMap() {
    this.docsMap[SaleStage.Inprocess] = [
      { label: 'Tax Invoice (Draft)', reportName: 'TaxInvoice' },
      { label: 'Account Sale (Draft)', reportName: 'AccountSale' },
      { label: 'RCTI - (Draft)', reportName: 'RCTI' },
      { label: 'Sale Summary (Draft)', reportName: 'SaleSummary' },
    ];

    this.docsMap[SaleStage.Invoiced] = [
      { label: 'Tax Invoice', reportName: 'TaxInvoice' },
      { label: 'Account Sale (Draft)', reportName: 'AccountSale' },
      { label: 'RCTI - (Draft)', reportName: 'RCTI' },
      { label: 'Sale Summary (Draft)', reportName: 'SaleSummary' },
      { label: 'Vendor Price List (Draft)', reportName: 'VendorSaleDetails' },
    ];

    this.docsMap[SaleStage.Finalised] = [
      { label: 'Tax Invoice', reportName: 'TaxInvoice' },
      { label: 'Account Sale', reportName: 'AccountSale' },
      { label: 'RCTI', reportName: 'RCTI' },
      { label: 'Sale Summary', reportName: 'SaleSummary' },
    ];

    this.docsMap[SaleStage.ReversalProcess] = [
      { label: 'Adjusted Tax Invoice', reportName: 'TaxInvoiceReversed' },
      { label: 'Adjusted Account Sale', reportName: 'AccountSaleReversed' },
      { label: 'Adjusted RCTI', reportName: 'RCTIReversed' },
      { label: 'Sale Summary', reportName: 'ReversedSale' },
      { label: 'Vendor Price List', reportName: 'VendorSaleDetailsReversed' },
    ];

    this.docsMap[SaleStage.ReversalCompleted] = [
      { label: 'Adjusted Tax Invoice', reportName: 'TaxInvoiceReversed' },
      { label: 'Adjusted Account Sale', reportName: 'AccountSaleReversed' },
      { label: 'Adjusted RCTI', reportName: 'RCTIReversed' },
      { label: 'Sale Summary', reportName: 'ReversedSale' },
      { label: 'Vendor Price List', reportName: 'VendorSaleDetailsReversed' },
    ];

    const saleTransTypeSubr = this.saleServices.currentSaleTransactionType$.subscribe((transType) => {
      if (transType === 'ZL02') {
        this.docsMap[SaleStage.Inprocess].push({ label: 'Sale Price Advice - Interim', reportName: 'VendorPriceAdvice' });
        this.docsMap[SaleStage.Finalised].push({ label: 'Sale Price Advice - Final', reportName: 'VendorPriceAdvice' });
      }
    });

    this.unsubscribe.push(saleTransTypeSubr);
  }
  //Changes Based on Parent Transaction ID #1038
  dmoFilterFn(term: string, $event: any) {
    if ($event.target.value !== '' && $event.target.value.length === 1 && $event.key.toLocaleLowerCase() !== 'backspace') {
      this.dmoValues = this.DMOData[term];
    }
    if ($event.target.value !== '') {
      this.DMOData[term] = this.dmoValues.filter(
        (x) => x.DataValue.toString().toLocaleLowerCase().indexOf($event.target.value.toString().toLocaleLowerCase()) > -1
      );
    } else {
      this.DMOData[term] = this.dmoValues;
    }
  }

  //#ESI-1375 - EXT (CR) #ES-582 - listing management - extract to excel - file accuracy [RISK]
  openExportGridConfigurationPopup(poptype: string, viewName: string, ExportType: string) {
    const modalRef = this.modalService.open(ExportGridViewConfigComponent, {
      windowClass: 'grid-config-view-modal',
      backdrop: 'static',
      keyboard: false,
    });
    const modalInstance: ExportGridViewConfigComponent = modalRef.componentInstance;
    modalInstance.gridConfigJson.ViewName = viewName;
    modalInstance.ProcessName = this.ProcessName;
    modalInstance.OldViewName = viewName;
    modalInstance.objBaseGrid = this;
    modalInstance.ExportType = ExportType.toUpperCase();
    modalInstance.ExportUserData.SortColumn = this._bodyData.SortColumn;
    modalInstance.ExportUserData.SortOrder = this._bodyData.SortOrder;
    modalInstance.ExportUserData.ProcessName = this._bodyData.ProcessName;
    modalInstance.ExportUserData.GridFilters = this._bodyData.GridFilters;
    modalInstance.ExportUserData.ParentTransactionID = this.ParentTransactionId;
    modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
    modalInstance.ExportUserData.ViewName = this.ProcessName === 'LMKOpportunities' ? 'View4' : 'AdminView';
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
      this.productNameMessage = 'Product name is Not Exist';
    }
  }
  ValidateProductOnKeyUp(event, item) {
    if (event.target.value && event.key != 'Tab' && event.key != 'Enter') {
      this.isProductSelected = false;
    }
    if (event.target.value == '') {
      this.isProductSelected = true;
      this.productNameMessage = '';
      this.handleUnsoldLots(false, item);
      this.handleVendorCartage(false, item);
      this.handleBuyerCartage(false, item);
    }
  }
  selectBranch($event, guid, item) {
    if (guid == 'dmolotbinfobuyerbrc') {
      if ($event && $event.item) {
        let customerCompany = item.edit_value.dmolotbinfobuyerid;
        customerCompany = customerCompany && customerCompany.indexOf('-') > 0 ? customerCompany.split('-')[0] : customerCompany;
        if (customerCompany && $event.item.dmobranchcompcode_KEY != customerCompany) {
          $event.preventDefault();
          const brnch = { dmobranchbrcode: '', dmobranchbrname: '' };
          item.edit_value.dmolotbinfobuyerbrc = '';
        }
      }
    } else {
      if ($event && $event.item) {
        let customerCompany = item.edit_value.dmolotvinfovendorid;
        customerCompany = customerCompany && customerCompany.indexOf('-') > 0 ? customerCompany.split('-')[0] : customerCompany;
        if (customerCompany && $event.item.dmobranchcompcode_KEY != customerCompany) {
          $event.preventDefault();
          const brnch = { dmobranchbrcode: '', dmobranchbrname: '' };
          item.edit_value.dmolotvinfovendorbrc = '';
        }
      }
    }
  }
}
