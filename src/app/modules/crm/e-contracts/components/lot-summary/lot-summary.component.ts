
import { Component, OnInit, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

import { BaseGrid, GridViewConfigurationComponent, MessageComponent, BulkUpdateModalComponent, ExportGridViewConfigComponent } from '@app/shared';
import { ListviewService, ColumnFilterService, ApplicationService, MessageService } from '@app/core';
import { LotSearchService } from '@app/modules/crm/lots/services/lot-search.service';
import { EContractService } from '../../services/e-contract.service';
import { UserDetail } from '@app/core/models/user-detail';
import { SpinnerVisibilityService } from 'ng-http-loader';


@Component({
  selector: 'app-lot-summary',
  templateUrl: './lot-summary.component.html',
  styleUrls: ['./lot-summary.component.scss', '../../../../../shared/components/grid-view/grid-view.component.scss']
})
export class LotSummaryComponent extends BaseGrid implements OnInit, OnDestroy {


  numericFields = ['dmolotlotinfoqnty', 'dmolotlotinfopricephd', 'dmolotlotinfopricecpkg', 'dmolotlotinfoturnovaud', 'dmolotlotinfowtkg', 'dmolotlotinfotrnsclmqnt'];
  IsPermissionSet = false;
  dmoValues = [];
  IsCoutLoad: boolean = false;

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
    private econtract: EContractService,
    private msg: MessageService,
    private userDetail: UserDetail,
    private spinner: SpinnerVisibilityService
  ) {
    super(elRef,toastr);

    this.ProcessName = 'LMKOPECESLot';
    this.ViewName = '';
    this.GridGuid = 'MCompContainer';
    this.PageSize = '10';
    this.ShowSelectAll =  false;
    this.TimeZone = this.userDetail.TimeZone.toString();
    this.ColumnList = '';
    this.LstGridFilter = [];
    this.PageNumber = '0';
    this.PageCount = '0';
    this.HasGlobalSearch = false;
    this.IsSubProcess = true;
    this.HideDeleteActionIcon = true;
    this.HideDisplayName = true;
    this.ShowBulkUpdateButton = true;
    this.CanAddNewRow = false;
    this.TriggerName = 'TRGR_LotPreProcessing_Calculate';
    this.route.paramMap.subscribe(params => {
        this.ParentTransactionId = params.get('id');
    });
  }

  edit_item_value(event, datafield: string, item: any) {
    if (datafield === 'dmolotlotinfopricecpkg') {
      if (event !== '' && event != null) {
        item.edit_value.dmolotlotinfopricephd = '';
      }
    } else if (datafield === 'dmolotlotinfopricephd') {
      if (event !== '' && event != null) {
        item.edit_value.dmolotlotinfopricecpkg = '';
      }
      this.cdr.detectChanges();
    }
  }

  is_cell_disabled(item: any, datafield: string) {
    if (datafield === 'dmolotlotinfopricecpkg' && item.edit_value.dmolotlotinfopricecpkg === '' && item.edit_value.dmolotlotinfopricephd) {
      return true;
    } else if (datafield === 'dmolotlotinfopricephd' && item.edit_value.dmolotlotinfopricephd === '' && item.edit_value.dmolotlotinfopricecpkg) {
      return true;
    }
    return false;
  }

  vendorIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorIdSearch(text$);
  }

  vendorNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.vendorNameSearch(text$);
  }

  selectVendor(event: NgbTypeaheadSelectItemEvent, field: string, item: any) {
    this.lotSearchService.vendorData.forEach(vendor => {
      if (vendor[field] === event.item) {
        item.edit_value.dmolotvinfovendornam = vendor.dmocustmstrcustname1;
        item.edit_value.dmolotvinfogstreg = vendor.dmocustmstrgstflg;
        item.edit_value.dmolotvinfovendorid = vendor.dmocustmstrsapno;

        this.DMOData.dmolotvinfovendorbrc = [];
        if (vendor.dmocustmstracttype === 'Livestock') {
          this.DMOData.dmolotvinfovendorbrc.push({DataValue: vendor.dmocustmstrlstkbranch});
          item.edit_value.dmolotvinfovendorbrc = vendor.dmocustmstrlstkbranch;
        } else {
          this.DMOData.dmolotvinfovendorbrc.push({DataValue: vendor.dmocustmstrcustdombranch});
          item.edit_value.dmolotvinfovendorbrc = vendor.dmocustmstrcustdombranch;
        }

        this.lotSearchService.getVendorPIC(vendor.dmocustmstrsapno).subscribe(response => {
          this.DMOData.dmolotvinfovendorpic = [];
          response.forEach(p => this.DMOData.dmolotvinfovendorpic.push({DataValue: p.dmocuspiccustpic}));
          item.edit_value.dmolotvinfovendorpic = '';
          if (this.DMOData.dmolotvinfovendorpic.length === 1) {
            item.edit_value.dmolotvinfovendorpic = this.DMOData.dmolotvinfovendorpic[0];
          }

        });
      }
    });
  }

  buyerIdSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerIdSearch(text$);
  }

  buyerNameSearch = (text$: Observable<string>) => {
    return this.lotSearchService.buyerNameSearch(text$);
  }

  selectBuyer(event: NgbTypeaheadSelectItemEvent, field: string, item: any) {
    this.lotSearchService.buyerData.forEach(buyer => {
      if (buyer[field] === event.item) {
        item.edit_value.dmolotbinfobuyername = buyer.dmocustmstrcustname1;
        item.edit_value.dmolotbinfobuyerid = buyer.dmocustmstrsapno;

        this.DMOData.dmolotbinfobuyerbrc = [];
        if (buyer.dmocustmstracttype === 'Livestock') {
          this.DMOData.dmolotbinfobuyerbrc.push({DataValue: buyer.dmocustmstrlstkbranch});
          item.edit_value.dmolotbinfobuyerbrc = buyer.dmocustmstrlstkbranch;
        } else {
          this.DMOData.dmolotbinfobuyerbrc.push({DataValue: buyer.dmocustmstrcustdombranch});
          item.edit_value.dmolotbinfobuyerbrc = buyer.dmocustmstrcustdombranch;
        }

        this.lotSearchService.getBuyerPIC(buyer.dmocustmstrsapno).subscribe(response => {
          this.DMOData.dmolotbinfobuyerpic = [];
          response.forEach(p => this.DMOData.dmolotbinfobuyerpic.push({DataValue: p.dmocuspiccustpic}));
          item.edit_value.dmolotbinfobuyerpic = '';
          if (this.DMOData.dmolotbinfobuyerpic.length === 1) {
            item.edit_value.dmolotbinfobuyerpic = this.DMOData.dmolotbinfobuyerpic[0];
          }

        });

      }
    });
  }


  triggerSave() {
    this.confirmCreateNewRecord();
  }


  getGridConfigData(gridviewName?) {
    if (gridviewName) {
        this.ViewName = gridviewName;
    }
    this.listviewService.GridConfig(this)
        .subscribe(
            data => {
                let pushViewName = false;
                if (this.ViewName === '') {
                    pushViewName = true;
                    this.viewList = [];
                }
                if(data){
                  data.forEach(element => {
                    if (pushViewName) {
                        this.viewList.push({ IsDefaultview: element.IsDefaultview, Viewname: element.Viewname });
                    }
                    if (element.IsDefaultview || element.Viewname === this.ViewName) {
                        this.ViewName = element.Viewname;
                        this.gridConfigData = JSON.parse(element.Config);
                        this.isDefaultView = element.IsDefaultview;
                    }
                });
                }               
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
    this.keyColumn = gridConfig && gridConfig.IdentityField && gridConfig.IdentityField !== 'undefined' ?
        gridConfig.IdentityField : 'TRNSCTNID';
    this._bodyData.ViewName = gridConfig.ViewName;
    this._bodyData.ColumnList = gridConfig.ColumnList;
    this._bodyData.PageSize = gridConfig.PageSize;
    const colList = gridConfig.ColumnList.split(',');
    this.columns = [];
    if (this.CanAddNewRow) {
        this.newRow = {
            edit_value: {}
        };
    }
    this.columns.push({
      text: 'Sale ID',
      datafield: 'SALEID',
      dataType: 'SALEID',
      width: '10'
    });
    for (const objColumn of colList) {
      switch (gridConfig.Columns[objColumn].DisplayName) {
        case 'SAP Account Number':
          gridConfig.Columns[objColumn].DisplayName = 'Vendor ID';
          break;
        case 'Trading Name':
          gridConfig.Columns[objColumn].DisplayName = 'Vendor Name';
          break;
        case 'Total Weight':
          gridConfig.Columns[objColumn].DisplayName = 'Weight';
          break;
        case 'Quantity':
          gridConfig.Columns[objColumn].DisplayName = 'Qty';
          break;
      }
      
      if (objColumn === 'lmkoeelotdmopriceaud') {
        this.columns.push({
          text: '$/Head',
          datafield: objColumn,
          dataType: gridConfig.Columns[objColumn].Type,
          width: gridConfig.Columns[objColumn].Width
        });
      } else if(objColumn === 'lmkoeelotdmopriceckg') {
        this.columns.push({
          text: 'C/KG',
          datafield: objColumn,
          dataType: gridConfig.Columns[objColumn].Type,
          width: gridConfig.Columns[objColumn].Width
        });
      } else {
        this.columns.push({
          text: gridConfig.Columns[objColumn].DisplayName,
          datafield: objColumn,
          dataType: gridConfig.Columns[objColumn].Type,
          width: gridConfig.Columns[objColumn].Width
        });
      }

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

    if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() +'gridsort')) {
        const sort = JSON.parse(sessionStorage.getItem(sessionStorage.getItem('processName').toString() +'gridsort'));
        this._bodyData.SortColumn = sort.column;
        this.sortColumnName = sort.displayName;
        this._bodyData.SortOrder = sort.order;
    }
    if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridFlters')) {
        this.filters = JSON.parse(sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridFlters'));
    }
    if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() +'gridPage')) {
        const sort = JSON.parse(sessionStorage.getItem(sessionStorage.getItem('processName').toString() +'gridPage'));
        this._bodyData.PageSize = sort.pageSize;
        this._bodyData.PageNumber = +sort.pageNumber - 1;
    }
    this.getGridData();
    this.getDMOsMapping();
  }

  getGridData() {
    for (const column of this.columns) {
      if (this.numericFields.indexOf(column.datafield) > -1) {
        column.isNumeric = true;
      }
    }
    this._bodyData.GridFilters = [];
    Object.keys(this.filters).forEach(key => {
      this._bodyData.GridFilters.push(this.filters[key]);
    });

    // this code is not required because there are no need to give any permission, all data read only
    // if (!this.IsPermissionSet) {
    //   this.IsPermissionSet = true;
    //   this.listviewService.userActionPermission().subscribe(
    //     data => {
    //       this.IsDeletionAllow = data.IsDeletionAllow;
    //       this.IsCopyAllow = data.IsCopyAllow;
    //       this.IsBulkUpdateAllow = data.IsBulkUpdateAllow;
    //       this.IsBulkUploadAllow = data.IsBulkUploadAllow;
    //       this.IsViewAllow = true;
    //     });
    // }
    this.IsViewAllow = true;
    this._bodyData.ColumnList += ',lmkfmdmocostper';
    this.econtract.GridData(this._bodyData).subscribe(
      data => {                   
            this.spinner.show();           
            super.BindData(data);          
            this.spinner.hide();  
            this.isFilterClick = true;
            this.getprocessDataCount(data);           
        this.getMetricsData();
      });
  }

  getMetricsData() {
    this.metricsData = {
      'Total Qty': '2000',
      '#Total $/HD': '$563.81',
      '#Total C/Kg': '0',
      '#Total Combined': '563.81',
      'Total Kg': '117,246,049',
      'Price ex. GST': '$15,940,000.00',
      'GST': '$79643.45',
      'Price incl. GST': '$79643.45'
    };
  }

  getDMOsMapping() {
    if (this.CanAddNewRow) {
        this.listviewService.dmoListOrderByDMO(this.ProcessName)
          .subscribe(
              data => {
                if(data){
                  data.forEach((item: any) => {
                    this.dmoMapping[item.GUID] = item.Name;
                });
                }                 
              }
          );
    }
  }
//Changes Based on Parent Transaction ID #1038
  BindDMODropDown(dmoGuid) {
    if (!this.DMOData[dmoGuid]) {
      this.showItemLoading = false;
      this.DMOData[dmoGuid] = [];
      if (dmoGuid === 'dmolotlotinfopdct' || dmoGuid === 'dmolotlotinfobrd') {
        this.lotSearchService.getLotProduct(this.ParentTransactionId).subscribe(data => {
          this.showItemLoading = true;
          if (dmoGuid === 'dmolotlotinfopdct') {
            data.ProductMasterData.forEach(item =>
              this.DMOData[dmoGuid].push({DataValue: item.PMProductCode, Description: item.PMProductDescription})
            );
          } else {
            data.productBreedData.forEach(item => this.DMOData[dmoGuid].push({DataValue: item.PBProductBreedCode}));
          }
        });
      } else {
        this.listviewService.DMOData(this.ProcessName, dmoGuid,this.ParentTransactionId).subscribe(
          data => {
            this.DMOData[dmoGuid] = data;
            this.showItemLoading = true;
          },
          err => {
            this.showItemLoading = true;
          });
      }
    }
  }

  selectDDLOption(datafield: string, row: any, item: any) {
    if (datafield === 'dmolotlotinfopdct') {
      row.edit_value.dmolotlotinfoproddesc = item.Description;
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
    };
    this.listviewService.sendGridConfig(GridFinalJson)
        .subscribe(
            data => {
                // console.log('grid full data', data);
                // if (data === true) {
                //     alert('Grid Data Submited Successfully.');
                // }
            }
        );
  }

  openGridConfigurationPopup(poptype: string, viewName: string) {
    const modalRef = this.modalService.open(GridViewConfigurationComponent,
      { windowClass : 'grid-config-view-modal', backdrop: 'static', keyboard: false }
    );
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

  /* ---------------------Open Confirmation Popup for single delete-------------- */
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsDelete: boolean, IsDefaultView: boolean,
  //                  IsConfirmation: boolean, confirmationText: string) {
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

  /* ---------------------Open Confirmation Popup for selected item delete-------------- */
  showDeleteMessage() {
    const SelectedItem = this.tableData.filter(x => x.selected === true);

    // Set modal popup configuration
    // const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    // const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    // modalInstance.MessagePopup = modalMsgRef;
    // modalInstance.IsConfirmation = true;
    // modalInstance.Caller = this;
    if (SelectedItem.length > 0) {
      console.log(SelectedItem);
      this.msg.showMessage('Warning', {
        header: 'Delete Selected Item',
        body: 'Do you want to delete selected item?',
        btnText: 'Confirm Delete',
        checkboxText: 'Yes, delete selected item',
        isDelete: true,
        callback: this.deleteSelectedConfirmation,
        caller: this,
      })
      // modalInstance.ConfirmationText = 'Yes, delete selected item.';
      // modalInstance.IsDelete = true;
      // modalInstance.IsConfirmation = true;
      // modalInstance.MessageHeader = 'Delete Selected Item';
      // modalInstance.Message = 'Do you want to delete selected item.';
      // modalInstance.ButtonText = 'Confirm Delete';
      // modalInstance.CallBackMethod = this.deleteSelectedConfirmation;
    } else {
      this.msg.showMessage('Warning', {body: 'Select at least one record to delete'});
      // modalInstance.MessageHeader = 'Warning !';
      // modalInstance.Message = 'Select atleast one record to delete.';
      // modalInstance.ButtonText = 'Ok';
    }
  }

  FilterList(item): string {
    return item.map(e => e.ConditionValue).join(',');
  }
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete Record',
      body: 'Are you sure you want to delete?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this record',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete?', 'Delete Record', 'Confirm Delete', this.deleteConfirmation,
    // true, false, true, 'Yes, delete this record');
  }
  // 'Are you sure you want to delete this video?', 'Delete Video Record', 'Confirm Delete',
  // this.deleteConfirmation, true, false, true, 'Yes, delete this video.'

  /* -------------------------Delete Single Record---------------------- */
  deleteConfirmation(modelRef: NgbModalRef, Caller: LotSummaryComponent) {
    if (Caller.transactionId) {
      Caller.listviewService.deleteGridData(Caller.transactionId).subscribe(
        result => {
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
  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: LotSummaryComponent) {
    const SelectedItem = Caller.tableData.filter(x => x.selected === true).map(x => x.TRNSCTNID).join(',');
    if (SelectedItem) {
      Caller.listviewService.deleteGridData(SelectedItem).subscribe(
        result => {
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

  /* -------------------------End Delete Selected Item---------------------- */

  bindColumnFilterDdl(item) {
    const FilterData = this.columnFilter.GetFilterByDataType(item.dataType); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
      if (!this.ColumnData[item.datafield]) {
        this.showItemLoading = false;
        this.listviewService.DMOData(this.ProcessName, item.datafield, this.ParentTransactionId).subscribe(
          data => {
            this.ColumnData[item.datafield] = data;
            this.showItemLoading = true;
          });
      }
    } else {
      this.ColumnData[item.datafield] = FilterData;
    }
  }

  bulk_update() {
    if (this.SelectedRecordIds.length === 0) {
      // const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
      // const modalInstance: MessageComponent = modalMsgRef.componentInstance;
      // modalInstance.MessagePopup = modalMsgRef;
      // modalInstance.IsConfirmation = false;
      // modalInstance.Message = 'No record selected for bulk update';
      this.msg.showMessage('Warning', {body: 'No record selected for bulk update'});
    } else {
      const modalRef = this.modalService.open(BulkUpdateModalComponent, { size: 'lg' });
      const modalInstance: BulkUpdateModalComponent = modalRef.componentInstance;
      modalInstance.transactionIds = this.SelectedRecordIds;
      modalInstance.processName = this.ProcessName;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
        }
      }, (reason) => {
      });
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
      if (this.file.type === 'application/vnd.ms-excel' ||
        this.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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

    this.listviewService.UploadFile(formData).subscribe(Result => {
      console.log(Result);
      if (Result === true) {
        this.file = null;
        this.fileName = '';
        console.log('done');
        this.getGridConfigData();
        this.modalService.dismissAll();
        this.msg.showMessage('Success', {body: 'Upload done'});
        // this.showErrorMessage('Upload done', 'Upload file', 'Ok', null, false, true, false, '');
      } else {
        this.msg.showMessage('Fail', {body: Result.Message});
        // this.showErrorMessage(Result.Message, 'Error', 'Ok', null, false, true, false, '');
      }
    }, error => { console.log(error); });
  }
  //#region Copy
  openCopyConfirmation(id) {
    this.transactionId = id;
    this.router.navigate([`/process_control/${this.ProcessName}/copy_view`, id, this.ParentTransactionId]);
  }

  navigateDetailPage(id: any) {
    this.router.navigate(['./lot_view', id], {relativeTo: this.route});
  }

  // goToDetailPage(id: any,view, flag) {
  //   if(view !== '')
  //   this.navigateDetailPage(id);
  // }
  goToDetailPage(id: any, navigateOn?: string, NeedToEncrypt?: boolean) {
    if (navigateOn) {
      if (navigateOn === 'SALEID') {

        this.econtract.getTranscationId(id, 'LMKLivestockSales', 'dmocrmheaderinfsaleid').subscribe(Result => {
          if (Result) {
            window.open('/crm/sales/'+encodeURIComponent(Result.TransctionId), '_blank');
          } else {
            this.toastr.warning(`The sale doesn't exist.`);
          }
        });
      } else if (navigateOn === 'ID') {

      } else if (navigateOn === 'contractView') {
        this.navigateDetailPage(id);
      }
    } else {
     this.navigateDetailPage(id);
    }
  }

  goToNewLotPage() {
    this.navigateDetailPage('new');
  }

  confirmSaveRowRecord(row: any) {
    const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    modalInstance.Message = 'Are you sure you want to save?';
    modalInstance.ButtonText = 'Confirm Save';
    modalInstance.MessageHeader = 'Save this Record';
    modalInstance.MessagePopup = modalMsgRef;
    modalInstance.IsConfirmation = true;
    modalInstance.CallBackMethod = null;
    modalInstance.Caller = null;
    modalInstance.IsDelete = false;
    modalInstance.IsDefaultView = true;
    modalInstance.ConfirmationText = '';

    modalMsgRef.result.then(async (result) => {
      if (result) {
        const submitData: any = {
          Identifier: {
            Name: null,
            Value: null,
            TrnsctnID: row[this.keyColumn]
          },
          ProcessName: this.ProcessName,
          TriggerName: 'Save Data',
          UserName: this.userDetail.UserName,
          Data: [row.edit_value]
        };

        this.applicationService.updateApplication(submitData).subscribe(data => {
          this.toastr.success('Grid updated successfully.');
          this.getGridData();
        });
      }
      }, (reason) => {
      }
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
    })
    // this.showErrorMessage(
    //   'Are you sure you want to create?',
    //   'Create New Record',
    //   'Confirm Create',
    //   this.createNewRecord,
    //   false,
    //   true,
    //   true,
    //   ''
    // );
  }

  createNewRecord(modelRef: NgbModalRef, Caller: LotSummaryComponent) {

    const rowData = {...Caller.newRow.edit_value};
    const valueData: any = {};
    Object.keys(rowData).forEach(key => {
      if (rowData[key] != null && rowData[key] !== '') {
        valueData[Caller.dmoMapping[key]] = rowData[key];
      }
    });
    const submitData: any = {
      ProcessName: Caller.ProcessName,
      UserName: this.userDetail.UserName,
      TriggerName: Caller.TriggerName,
      Data: [valueData]
    };

    if (Caller.IsSubProcess) {
      submitData.ParentTransactionID = Caller.ParentTransactionId;
    }

    Caller.applicationService.insertApplication(submitData).subscribe(data => {
      Caller.toastr.success('Created new record successfully');
      Caller.newRow.edit_value = {};
      Caller.getGridData();
      modelRef.close();
    }, error => {
      Caller.toastr.error(error.error.message);
      modelRef.close();
    });

  }
  public textSepratorHover(data, separator) {
    if (data) {
      const ar = data.split(separator);
      if (ar.length > 1) {
        return ar;
      }
      return data;
    }
  }
  openLinkFromUrl() {  
    const url = (this.router.url).split('/'); 
    if(this.ProcessName === 'LMKOPECESLot' && url[2] === 'contract_view'){     
      sessionStorage.AppName = 'LMKOpportunities';
      this._bodyData.ProcessName = this.ProcessName;
    }
  }
      //Changes Based on Parent Transaction ID #1038
      dmoFilterFn(term: string, $event: any){
        if($event.target.value !== '' && $event.target.value.length === 1 && $event.key.toLocaleLowerCase() !== 'backspace'){
          this.dmoValues = this.DMOData[term];
        }
        if($event.target.value !== ''){
        this.DMOData[term] = this.dmoValues.filter(x => x.DataValue.toString().toLocaleLowerCase().indexOf($event.target.value.toString().toLocaleLowerCase()) > -1);
        }
        else{
         this.DMOData[term] = this.dmoValues;
        }
       }

  //#ESI-1375 - EXT (CR) #ES-582 - listing management - extract to excel - file accuracy [RISK]
  openExportGridConfigurationPopup(poptype: string, viewName: string, ExportType: string) {
    const modalRef = this.modalService.open(ExportGridViewConfigComponent,
      { windowClass: 'grid-config-view-modal', backdrop: 'static', keyboard: false }
    );
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
//Entity related code– Nidhi 
  getprocessDataCount(data: any): void {
    if (this.TableInfo.Recordes === -1 || this.isFilterClick === true) {
      this.IsCoutLoad = false;
      this.econtract.SalesProcessDataCount(this._bodyData).subscribe(recordsCount => {
        this.TableInfo.Recordes = recordsCount.RecordsCount;
        this.IsCoutLoad = true;
        this.isFilterClick = false;
        this.setPaging(data);
      });
    } else {
      this.setPaging(data);
    }
  }

  setPaging(data){
    this.IsCoutLoad = true;
    this.TableInfo.PageSize = this._bodyData.PageSize;
      this.TableInfo.PageNumber = parseInt(data.PageNumber, 10) + 1;
      this.TableInfo.PageCount = Math.ceil(parseInt(this.TableInfo.Recordes, 10) / parseInt(this._bodyData.PageSize, 10));
      this.TableInfo.Start = ((parseInt(data.PageNumber, 10) <= 0 ? 0 : (parseInt(data.PageNumber, 10))) * this._bodyData.PageSize) + 1;
      this.TableInfo.End = ((this.TableInfo.PageNumber) * this._bodyData.PageSize) > this.TableInfo.Recordes ?
        this.TableInfo.Recordes : ((this.TableInfo.PageNumber) * this._bodyData.PageSize);
      this.setTooltips(this.elRef.nativeElement.querySelector('#gridView'));
      this.hideFooter = true;
      sessionStorage.setItem(sessionStorage.getItem('processName').toString() + 'gridPage', JSON.stringify({ pageSize: this._bodyData.PageSize, pageNumber: this.TableInfo.PageNumber }));
  }
//Entity related code– Nidhi 
  ngOnDestroy(): void {
    sessionStorage.removeItem(this.ProcessName + 'gridsort');
    sessionStorage.removeItem(this.ProcessName + 'gridFlters');
    sessionStorage.removeItem(this.ProcessName + 'gridPage');
  }
  getCompCode(event:any,datafield:any){
    if(datafield === 'lmkoeelotdmospaaccno'){
      const comp =   event['lmkoeelotdmovendcompname'].lastIndexOf('(') > -1 ? event['lmkoeelotdmovendcompname'].substr(event['lmkoeelotdmovendcompname'].lastIndexOf('(') + 1).replace(')', '') : event['lmkoeelotdmovendcompname'];
      return comp + '-'+ event['lmkoeelotdmospaaccno'];
    } else if(datafield === 'lmkoeelotdmobuyerid'){
      const comp =   event['lmkoeelotdmobuycompname'].lastIndexOf('(') > -1 ? event['lmkoeelotdmobuycompname'].substr(event['lmkoeelotdmobuycompname'].lastIndexOf('(') + 1).replace(')', '') : event['lmkoeelotdmobuycompname'];
      return comp + '-'+ event['lmkoeelotdmobuyerid'];
    }
  }
}

