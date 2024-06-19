import { Component, AfterContentInit } from '@angular/core';
import { BaseGrid } from '@app/shared/components/grid-view/baseGrid';

import { ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbDateParserFormatter, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { ListviewService, ApplicationService, GridConfig, MessageService, ApiESaleyardService, NgbDateFRParserFormatter } from '@app/core';

import { saveAs } from 'file-saver';
import { EContractConfigComponent } from '../../components/e-contract-config/e-contract-config.component';
import { EContractService } from '../../services/e-contract.service';
import { EContractViewModalComponent } from '../../components/e-contract-view-modal/e-contract-view-modal.component';
import { GridViewExportComponent, MessageComponent, ExportGridViewConfigComponent } from '@app/shared';
import { Title } from '@angular/platform-browser';
import { UserDetail } from '@app/core/models/user-detail';
import { ExportEConractConfigComponent } from '../../components/export-e-conract-config/export-e-conract-config.component';
import { environment } from '@env/environment';
import { SpinnerVisibilityService } from 'ng-http-loader';
@Component({
  selector: 'app-e-contract-view',
  templateUrl: './e-contract-view.component.html',
  styleUrls: ['./e-contract-view.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
})
export class EContractViewComponent extends BaseGrid implements AfterContentInit {

  DisplayName = sessionStorage.getItem('DisplayName');
  IsPermissionSet = false;
  dmoValues = [];
  IsCoutLoad: boolean = false;
  processName: any;
  FileExtension = '.xlsx';
  // @Output() openFormViewModal = new EventEmitter<any>();
  // @Output() navigateDetailPage = new EventEmitter<any>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private listviewService: ListviewService,
    private applicationService: ApplicationService,
    public toastr: ToastrService,
    public elRef: ElementRef,
    private modalService: NgbModal,
    private columnFilter: ColumnFilterService,
    private eservice: EContractService,
    private msg: MessageService,
    private titleService: Title,
    private apiESaleyardService: ApiESaleyardService,
    private userDetail: UserDetail,
    private spinner: SpinnerVisibilityService
  ) {
    super(elRef,toastr);
    this.ProcessName = 'LMKOpportunities';
    this.ViewName = '';
    this.GridGuid = 'MCompContainer';
    this.PageSize = '10';
    this.ShowSelectAll = false;
    this.TimeZone = this.userDetail.TimeZone.toString();
    this.ColumnList = '';
    this.LstGridFilter = [];
    this.PageNumber = '0';
    this.PageCount = '0';
    this.HasGlobalSearch = true;
    this.IsSubProcess = false;
    this.HideDeleteActionIcon = false;
    this.HideDisplayName = false;
    this.ShowBulkUpdateButton = false;
    // this.ParentTransactionId = obj.ParentTransactionId;
    // this.ParentDmoValue = obj.ParentDmoValue;
    // this.ChildDmoGuid = obj.ChildDmoGuid;
    this.CanAddNewRow = false;
    this.TriggerName = '';
  }
  ngAfterContentInit() {
    sessionStorage.setItem('DisplayName', 'E-contract');
    this.DisplayName = sessionStorage.getItem('DisplayName');
  }
  getGridConfigData(gridviewName?) {
    if (gridviewName) {
      this.ViewName = gridviewName;
    }
    const requestBody = { ProcessName: 'LMKCRMEContractsRecords', GridGuid: this.GridGuid, ViewName: this.ViewName };
    this.listviewService.GridConfig(requestBody)
      .subscribe(
        data => {
          let pushViewName = false;
          if (this.ViewName === '') {
            pushViewName = true;
            this.viewList = [];
          }        
          if(this.ViewName!== '' && data.length === 1){
            sessionStorage.setItem('config',data[0].Config);
          }
          data.forEach(element => {
            if (pushViewName) {
              this.viewList.push({ IsDefaultview: element.IsDefaultview, Viewname: element.Viewname });
            }
            if (sessionStorage.getItem('ViewName') !== null && element.Viewname === sessionStorage.getItem('ViewName')) {
              this.ViewName = sessionStorage.getItem('ViewName');               
              this.gridConfigData = JSON.parse(sessionStorage.getItem('config'));
              this.isDefaultView = element.IsDefaultview;
            }
            if(sessionStorage.getItem('ViewName') === null){
            if (element.IsDefaultview || element.Viewname === this.ViewName) {
              this.ViewName = element.Viewname;
              this.gridConfigData = JSON.parse(element.Config);
              this.isDefaultView = element.IsDefaultview;
            }
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
    if (gridConfig == null) {
      this.msg.showMessage('Fail', {body: 'Can\'t load configuration for grid view'});
      return false;
    }
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
    for (const objColumn of colList) {
      if (objColumn == 'lmkopesdmohdnlotproduct' || objColumn == 'lmkopesdmohdnlotbreed') {
        this.columns.push({
          text: gridConfig.Columns[objColumn].DisplayName,
          datafield: objColumn,
          dataType: 'TextBox',
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
    if (sessionStorage.getItem('gridPage')) {
        const sort = JSON.parse(sessionStorage.getItem('gridPage'));
        this._bodyData.PageSize = sort.pageSize;
        this._bodyData.PageNumber = +sort.pageNumber - 1;
    }
    this.getGridData();
    this.getDMOsMapping();
  }

  getGridData() {
    this.route.paramMap.subscribe(params => {
      this.UrlProcessName = params.get('process_name');
      this._bodyData.GridFilters = [];
      if (this.ChildCustomfilters.childgrid === undefined && this.IsSubProcess && this.ParentTransactionId === undefined) {
        this.ChildCustomfilters.childgrid = {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: this.ParentDmoValue != undefined ? this.ParentDmoValue.split('~')[0] : ''
            }
          ],
          DataField: this.ChildDmoGuid[this.ProcessName].ChildProcessDmoGuid,
          LogicalOperator: 'Or',
          FilterType: 'Custom_Filter'
        };
      }
      if (this.ChildCustomfilters.esaleyardlistinggrid1 === undefined || this.ChildCustomfilters.esaleyardlistinggrid2 === undefined) {
        this.ChildCustomfilters.esaleyardlistinggrid1 = {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: 'Contract'
            }
          ],
          DataField: 'Contract',
          LogicalOperator: 'Or',
          FilterType: 'Stage_Filter'
        };
        this.ChildCustomfilters.esaleyardlistinggrid2 = {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: 'Closed'
            }
          ],
          DataField: 'Closed',
          LogicalOperator: 'Or',
          FilterType: 'Stage_Filter'
        };
      }

      this.ChildCustomfilters.esaleyardlistinggrid3 = 
      {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: "Draft Contract"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Pending"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Review & Agent Sign"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Pending Agent Signature"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Pending Forward Supply Approval"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Pending Signature"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Pending Vendor Signature"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Pending Buyer Signature"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Buyer and Vendor Signature Pending"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Sold"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Sale Completed"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Contract Executed"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Closed Contract"
          },
          {
            Condition: "EQUAL",
            ConditionValue: "Closed"
          }           
        ],
        DataField: "WFOSDISPNAME",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      };


 /*     if (this.ChildCustomfilters.esaleyardlistinggrid1 !== undefined) {
        this._bodyData.GridFilters.push(this.ChildCustomfilters.esaleyardlistinggrid1);
      }
      if (this.ChildCustomfilters.esaleyardlistinggrid2 !== undefined) {
        this._bodyData.GridFilters.push(this.ChildCustomfilters.esaleyardlistinggrid2);
      }*/
      if (this.ChildCustomfilters.esaleyardlistinggrid3 !== undefined) {
        this._bodyData.GridFilters.push(this.ChildCustomfilters.esaleyardlistinggrid3);
      }

      if (this.ChildCustomfilters.childgrid !== undefined && this.ParentTransactionId === undefined) {
        this._bodyData.GridFilters.push(this.ChildCustomfilters.childgrid);
      }

      Object.keys(this.filters).forEach(key => {
        this._bodyData.GridFilters.push(this.filters[key]);
      });

      if (!this.IsPermissionSet) {
        this.IsPermissionSet = true;
        this.listviewService.userActionPermission().subscribe(
          data => {
            // this.IsDeletionAllow = data.IsDeletionAllow;
            // this.IsCopyAllow = data.IsCopyAllow;
            // this.IsBulkUpdateAllow = data.IsBulkUpdateAllow;
            // this.IsBulkUploadAllow = data.IsBulkUploadAllow;
            this.IsViewAllow = true;
          });
      }
      if(this.activeStateFilter.length===0){
      Object.keys(this.filters).forEach(key => {
        if(this.filters[key].FilterType === 'State_Filter' || 'Stage_Filter'){
          this.activeStateFilter.push(this.filters[key].DataField);
        }
        if(this.filters[key].FilterType === 'Global_Search'){
          this.elRef.nativeElement.querySelector('#globalSearch').value = this.filters[key].GridConditions[0].ConditionValue;
        }
        if(this.filters[key].FilterType === 'MyRecord'){
         this.selectedAllMyRecordFilter = this.filters[key].GridConditions[0].ConditionValue;
        }
        if(this.filters[key].FilterType === 'DMO_Filter'){
          this.selectedDmoFilter[this.filters[key].DataField] = this.filters[key].GridConditions[0].ConditionValue;           
         }
      });
    }
    this._bodyData.ColumnList +=',lmkopesecdmorecordid';
    this._bodyData.configProcessName = 'LMKCRMEContractsRecords';
      this.eservice.GridData(this._bodyData).subscribe(
        data => {           
            this.spinner.show();           
            super.BindData(data);          
            this.spinner.hide();
            this.getprocessDataCount(data);            
        });
    });
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
  getGridConfig(viewName: string) {
    if (viewName === '') {
      this.openGridConfigurationPopup('GridConfiguration', viewName);
    } else {
      this.ViewName = viewName;      
      sessionStorage.setItem('ViewName',this.ViewName); 
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
                console.log('grid full data', data);
                if (data === true) {
                   // alert('Grid Data Submited Successfully.');
                }
            }
        );
  }

  openGridConfigurationPopup(poptype: string, viewName: string) {
    const modalRef = this.modalService.open(EContractConfigComponent,
      { windowClass : 'grid-config-view-modal', backdrop: 'static', keyboard: false }
    );
    const modalInstance: EContractConfigComponent = modalRef.componentInstance;
    modalInstance.gridConfigJson.ViewName = viewName;
    modalInstance.ProcessName = this.ProcessName;
    modalInstance.OldViewName = viewName;
    modalInstance.objBaseGrid = this;
  }

  // openNewExportPopup(ExportType: string) {
  //   if(this.SelectedRecordIds.length==0)
  //   return;
  //   this.eservice.getDMOList('LMKCRMEContractsRecords', 'EContract').subscribe(Result => {
  //     const modalRef = this.modalService.open(GridViewExportComponent, { backdrop: 'static' });
  //     const modalInstance: GridViewExportComponent = modalRef.componentInstance;
  //     modalInstance.ExportType = ExportType.toUpperCase();
  //     modalInstance.ExportPopup = modalRef;
  //     modalInstance.ExportUserData.SortColumn = this._bodyData.SortColumn;
  //     modalInstance.ExportUserData.SortOrder = this._bodyData.SortOrder;
  //     modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.join(',');
  //     modalInstance.ExternalCall = {
  //       FromURL: true,
  //       GUID: 'GUID',
  //       displayValue: 'DisplayName',
  //       DownloadFileURL: this.eservice.getEndPoint(ExportType)
  //     };
  //     modalInstance.FileSetting = {
  //       FileName: 'e-contract',
  //       IsChangeFileName: true
  //     };
  //     modalInstance.ExportUserData.GridFilters = this._bodyData.GridFilters;
  //     modalInstance.ExportUserData.ProcessName = "LMKCRMEContractsRecords";
  //     modalInstance.ExportUserData.columns = this.columns;
  //     modalInstance.setDmoList(Result);
  //   },
  //     err => {
  //       console.log(err);
  //     });
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
    // const SelectedItem = this.tableData.filter(x => x.selected === true);

    // // Set modal popup configuration
    // const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    // const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    // modalInstance.MessagePopup = modalMsgRef;
    // modalInstance.IsConfirmation = true;
    // modalInstance.Caller = this;
    // if (SelectedItem.length > 0) {
    //   console.log(SelectedItem);
    //   modalInstance.ConfirmationText = 'Yes, delete selected item.';
    //   modalInstance.IsDelete = true;
    //   modalInstance.IsConfirmation = true;
    //   modalInstance.MessageHeader = 'Delete Selected Item';
    //   modalInstance.Message = 'Do you want to delete selected item.';
    //   modalInstance.ButtonText = 'Confirm Delete';
    //   modalInstance.CallBackMethod = this.deleteSelectedConfirmation;
    // } else {
    //   modalInstance.MessageHeader = 'Warning !';
    //   modalInstance.Message = 'Select atleast one record to delete.';
    //   modalInstance.ButtonText = 'Ok';
    // }
  }

  FilterList(item): string {
    let dataType = item.map(e => e.dataType).join(',');
    if (dataType && (['Global_Search', 'CreatedDateTime', 'LastUpdatedDateTime', 'DateTimeZone', 'CRTDON', 'MODFON', 'DateTimeBox', 'DateEditBox', 'DateWithCalendar', 'CreatedDate', 'LastUpdatedDate', 'StaticDateBox','StaticDateBox,StaticDateBox','CRTDON,CRTDON','MODFON,MODFON','CreatedDate,CreatedDate','DateWithCalendar,DateWithCalendar','CreatedDateTime,CreatedDateTime'].indexOf(dataType) > -1))
      return item.map(e => e.RowValue).join(',');
    else
      return item.map(e => e.ConditionValue).join(',');
    //return item.map(e => e.ConditionValue).join(',');
  }
  openConfirmation(id) {
    // this.transactionId = id;
    // this.showErrorMessage('Are you sure you want to delete?', 'Delete Record', 'Confirm Delete', this.deleteConfirmation,
    // true, false, true, 'Yes, delete this record');
  }
  // 'Are you sure you want to delete this video?', 'Delete Video Record', 'Confirm Delete',
  // this.deleteConfirmation, true, false, true, 'Yes, delete this video.'

  /* -------------------------Delete Single Record---------------------- */
  // deleteConfirmation(modelRef: NgbModalRef, Caller: GridViewComponent) {
  //   if (Caller.transactionId) {
  //     Caller.listviewService.deleteGridData(Caller.transactionId).subscribe(
  //       result => {
  //         if (result === true) {
  //           Caller.getGridData();
  //           modelRef.close();
  //         }
  //       });
  //   } else {
  //     modelRef.close();
  //   }
  // }

  /* -------------------------Delete Selected Item---------------------- */
  // deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: GridViewComponent) {
  //   const SelectedItem = Caller.tableData.filter(x => x.selected === true).map(x => x.TRNSCTNID).join(',');
  //   if (SelectedItem) {
  //     Caller.listviewService.deleteGridData(SelectedItem).subscribe(
  //       result => {
  //         if (result === true) {
  //           Caller.getGridData();
  //           modelRef.close();
  //         }
  //       });
  //   } else {
  //     modelRef.close();
  //   }
  // }

  /* -------------------------End Delete Selected Item---------------------- */
  openNewFormViewPopup() {    
    const selectedList = this.tableData.filter(x => x.selected === true);
    // get count of unique transaction type
    const trnCount = new Set(selectedList.map(x=>x.lmkopecdmotranstype)).size;
    if (selectedList.findIndex(x => x.WFOSDISPNAME === 'Closed') > -1) {
      this.msg.showMessage('Warning', {
        body: `One or many of the selected record(s) are in the 'Closed' State. Please ensure that you have selected open records to continue`,
      });
    } else if (selectedList.findIndex(x => x.WFOSDISPNAME === 'Draft Contract' ||
     x.WFOSDISPNAME === 'Review & Agent Sign' || x.WFOSDISPNAME === 'Pending Forward Supply Approval') > -1) {       
       const draftContract = selectedList.find(x => x.WFOSDISPNAME === 'Draft Contract')?.WFOSDISPNAME;
       const PendingForward = selectedList.find(x => x.WFOSDISPNAME === 'Pending Forward Supply Approval')?.WFOSDISPNAME;
       const reviewsign = selectedList.find(x => x.WFOSDISPNAME === 'Review & Agent Sign')?.WFOSDISPNAME;
      this.msg.showMessage('Warning', {
        body: `One or more  of the selected record(s) are in the
        ${ draftContract === undefined ? '' : "'"+draftContract+"'"}
        ${ PendingForward === undefined ? '' : draftContract !== undefined ? ' or ' +"'"+PendingForward+"'" : "'"+PendingForward+"'"}
        ${ reviewsign === undefined ? '' :(PendingForward !== undefined || draftContract !== undefined) ? ' or '+"'"+reviewsign+"'" : "'"+reviewsign+"'"}
        state. Please ensure that you have selected open records to continue`,
      });
    } else if (selectedList.findIndex(x => x.WFOSDISPNAME === 'Closed Contract') > -1) {
      this.msg.showMessage('Warning', {
        body: `One or many of the selected record(s) are in the 'Closed Contract' State. Please ensure that you have selected open records to continue`,
      });
    } else {
      if (trnCount > 1) {
        this.msg.showMessage('Warning', {
          body: 'Cannot create Sale from different Transaction Types.'});
      } else {
        const modalRef = this.modalService.open(EContractViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
        const modalInstance: EContractViewModalComponent = modalRef.componentInstance;
        modalInstance.processName = this.ProcessName;
        modalInstance.SelectedRecordIds = this.SelectedRecordIds;
        modalInstance.ContractId = this.tableData.filter(x => x.selected === true).map(item=> item.lmkopesecdmorecordid).join(',');
        modalInstance.saleTypeValue = this.tableData.filter(x => x.selected === true).map(item=> item.lmkopecdmosaletype).join(',');
        modalInstance.transactionTypeKeyValue = selectedList[0].lmkopecdmotranstype;
        modalRef.result.then(async (result) => {
          if (result) {
            // debugger
            // this.getGridData();
          }
        }, (reason) => {
        }
        );
      }
    }
  }
  bindColumnFilterDdl(item) {
    const FilterData = this.columnFilter.GetFilterByDataType(item.dataType); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
      if (!this.ColumnData[item.datafield]) {
        this.showItemLoading = false;
        this.listviewService.DMOData(this.ProcessName, item.datafield).subscribe(
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
    // if (this.SelectedRecordIds.length === 0) {
    //   const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    //   const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    //   modalInstance.MessagePopup = modalMsgRef;
    //   modalInstance.IsConfirmation = false;
    //   modalInstance.Message = 'No record selected for bulk update';
    // } else {
    //   const modalRef = this.modalService.open(BulkUpdateModalComponent, { size: 'lg' });
    //   const modalInstance: BulkUpdateModalComponent = modalRef.componentInstance;
    //   modalInstance.transactionIds = this.SelectedRecordIds;
    //   modalInstance.processName = this.ProcessName;
    //   modalRef.result.then(async (result) => {
    //     if (result) {
    //       this.getGridData();
    //     }
    //   }, (reason) => {
    //   });
    // }

  }
  openBulkUpload(bulkUpload) {
    this.file = null;
    this.fileName = '';
    this.modalService.open(bulkUpload, { ariaLabelledBy: 'modal-basic-title',backdrop: 'static', keyboard: false });
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
    // this.transactionId = id;
    // if (this.IsSubProcess && this.ParentDmoValue === undefined) {
    //   this.router.navigate([`/process_control/${this.ProcessName}/copy_view`, id, this.ParentTransactionId]);
    // } else if (this.IsSubProcess && this.ParentTransactionId === undefined) {
    //   this.router.navigate([`/process_control/${this.ProcessName}/copy_view`, id]);
    // } else {
    //   const modalRef = this.modalService.open(CopyRecordComponent, { size: 'lg' });
    //   const modalInstance: CopyRecordComponent = modalRef.componentInstance;
    //   modalInstance.transactionId = id;
    //   modalRef.result.then(async (result) => {
    //     if (result) {
    //       this.getGridData();
    //     }
    //   }, (reason) => {
    //   });
    // }
  }

  isCRM() {
    return sessionStorage.AppName === 'LMKLivestockSales';
  }

  goToDetailPage(id: any, navigateOn?: string, NeedToEncrypt?: boolean) {
    if (navigateOn) {
      if (navigateOn === 'SALEID') {

        if (NeedToEncrypt) {
          this.eservice.getTranscationId(id, 'LMKLivestockSales', 'dmocrmheaderinfsaleid').subscribe(Result => {
            window.open('/crm/sales/'+encodeURIComponent(Result.TransctionId), '_blank');
          });
        }  else {
          this.eservice.getTranscationId(id, 'LMKLivestockSales', 'dmocrmheaderinfsaleid').subscribe(Result => {
            window.open('/crm/sales/'+encodeURIComponent(Result.TransctionId), '_blank');
          });
        }
      } else if (navigateOn === 'ID') {

      } else if (navigateOn === 'contractView') {
        this.router.navigate(['/crm/contract_view', id]);
      }
    } else {
      if (this.isCRM()) {
        window.open('/crm/contract_view/'+encodeURIComponent(id), '_blank');
        // this.navigateDetailPage.emit(id);
      } else if (this.IsSubProcess) {
        this.router.navigate([`/process_control/${this.ProcessName}/child_view`, id]);
      } else {
        this.router.navigate([`/process_control/${this.ProcessName}/detail_view`, id]);
      }
    }
  }

  goToNewLotPage() {
    //this.navigateDetailPage.emit('new');
  }


  confirmSaveRowRecord(row: any) {
    // const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    // const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    // modalInstance.Message = 'Are you sure you want to save?';
    // modalInstance.ButtonText = 'Confirm Save';
    // modalInstance.MessageHeader = 'Save this Record';
    // modalInstance.MessagePopup = modalMsgRef;
    // modalInstance.IsConfirmation = true;
    // modalInstance.CallBackMethod = null;
    // modalInstance.Caller = null;
    // modalInstance.IsDelete = false;
    // modalInstance.IsDefaultView = true;
    // modalInstance.ConfirmationText = '';

    // modalMsgRef.result.then(async (result) => {
    //   if (result) {
    //     const submitData: any = {
    //       Identifier: {
    //         Name: null,
    //         Value: null,
    //         TrnsctnID: row[this.keyColumn]
    //       },
    //       ProcessName: this.ProcessName,
    //       TriggerName: 'Save Data',
    //       UserName: JSON.parse(localStorage.currentUser).UserName,
    //       Data: [row.edit_value]
    //     };

    //     this.applicationService.updateApplication(submitData).subscribe(data => {
    //       this.toastr.success('Grid updated successfully.');
    //       this.getGridData();
    //     });
    //   }
    //   }, (reason) => {
    //   }
    // );

  }

  confirmCreateNewRecord() {
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

  // createNewRecord(modelRef: NgbModalRef, Caller: GridViewComponent) {

  //   const rowData = {...Caller.newRow.edit_value};
  //   const valueData: any = {};
  //   Object.keys(rowData).forEach(key => {
  //     if (rowData[key] != null && rowData[key] !== '') {
  //       valueData[Caller.dmoMapping[key]] = rowData[key];
  //     }
  //   });
  //   const submitData: any = {
  //     ProcessName: Caller.ProcessName,
  //     UserName: JSON.parse(localStorage.currentUser).UserName,
  //     TriggerName: Caller.TriggerName,
  //     Data: [valueData]
  //   };

  //   if (Caller.IsSubProcess) {
  //     submitData.ParentTransactionID = Caller.ParentTransactionId;
  //   }

  //   Caller.applicationService.insertApplication(submitData).subscribe(data => {
  //     Caller.toastr.success('Created new record successfully');
  //     Caller.newRow.edit_value = {};
  //     Caller.getGridData();
  //     modelRef.close();
  //   }, error => {
  //     Caller.toastr.error(error.error.message);
  //     modelRef.close();
  //   });

  // }

  viewBulkLogRecord() {
    this.route.paramMap.subscribe(params => {
      this.processName = params.get('process_name');
      window.open(`/process_control/${this.processName}/bulk-log`, '_blank');
    });
  }

  downloadTemplate() {
    this.route.paramMap.subscribe(params => {
      this.processName = params.get('process_name');
      this.applicationService.DownloadBulkLog(this.processName).subscribe(result => {
        this.SaveUploadLog(result);
      })
    });
  }

  SaveUploadLog(FileData: any) {
    let appDispName:any;
    if (sessionStorage.getItem('DisplayName')) {
      appDispName = sessionStorage.getItem('DisplayName');
      }
    const curDate = new Date();
    const fileName = appDispName.replace(' ','_')+'_Template' +
      "_" + (curDate.getMonth() + 1).toString()
      + "_" + curDate.getDate()
      + "_" + curDate.getFullYear()
      + "_" + curDate.getHours()
      + "_" + curDate.getMinutes()
      + "_" + curDate.getSeconds()
      + this.FileExtension;
    saveAs(FileData, fileName);
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
   
  }

  IsHideDownloadBtn(item: any) {
    return !item.lmkopecdmotranstype.includes('Private');
  }

  downloadPDF(item: any) {    
    const header = {
      roleGuid: environment.Setting.signRoleKey.vendor
    };

    this.apiESaleyardService.postGetFile(`LegalDocument/downloadfile?oppTranctnid=${item.TRNSCTNID}`, null, 'Blob', header).subscribe(
      (res: Blob) => {
        if (res.type === 'application/octet-stream') {                    
          const fileName = 'Private_Sale_Agreement'
            + '_' + item.lmkopesecdmorecordid + '.pdf';
          saveAs(res, fileName);
         // const fileURL = URL.createObjectURL(res);
         // window.open(fileURL, '_blank');
        } else {
          this.toastr.warning('No Contract pdf file for this record');
        }
      }
    );
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
    // if (this.SelectedRecordIds.length == 0)
    //   return;

    this.eservice.getDMOList('LMKCRMEContractsRecords', 'EContract').subscribe(Result => {
      const modalRef = this.modalService.open(ExportEConractConfigComponent,
        { windowClass: 'grid-config-view-modal', backdrop: 'static', keyboard: false }
      );
      const modalInstance: ExportEConractConfigComponent = modalRef.componentInstance;
      modalInstance.gridConfigJson.ViewName = viewName;
      modalInstance.ProcessName = "LMKCRMEContractsRecords";
      modalInstance.OldViewName = viewName;
      modalInstance.objBaseGrid = this;
      modalInstance.ExportType = ExportType.toUpperCase();
      modalInstance.ExportUserData.SortColumn = this._bodyData.SortColumn;
      modalInstance.ExportUserData.SortOrder = this._bodyData.SortOrder;
      modalInstance.ExportUserData.ProcessName = "LMKOpportunities";
      modalInstance.ExportUserData.GridFilters = this._bodyData.GridFilters;
      modalInstance.ExportUserData.ParentTransactionID = this.ParentTransactionId;
      modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
      modalInstance.ExportUserData.SelectedViewName = viewName;
      modalInstance.ExportUserData.ConfigProcessName = 'LMKCRMEContractsRecords';
      modalInstance.ExternalCall = {
        FromURL: true,
        GUID: 'GUID',
        displayValue: 'DisplayName',
        DownloadFileURL: this.eservice.getEndPoint(ExportType)
      };
      modalInstance.FileSetting = {
        FileName: 'e-contract',
        IsChangeFileName: true
      };
    },
      err => {
        console.log(err);
      });
  }
  //Entity related code– Nidhi 
  getprocessDataCount(data: any): void {
    if (this.TableInfo.Recordes === -1 || this.isFilterClick === true) {
      this.IsCoutLoad = false;
      this.eservice.SalesProcessDataCount(this._bodyData).subscribe(recordsCount => {
        this.TableInfo.Recordes = recordsCount.RecordsCount;
        this.IsCoutLoad = true;
        this.isFilterClick = false;
        this.setPaging(data);
      });
     }else {
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

  getCompCode(event:any,datafield:any){    
    if(datafield === 'lmkecondmovensapno'){
      const comp =   event['lmkopesdmovendcompname'].lastIndexOf('(') > -1 ? event['lmkopesdmovendcompname'].substr(event['lmkopesdmovendcompname'].lastIndexOf('(') + 1).replace(')', '') : event['lmkopesdmovendcompname'];
      return comp + '-'+ event['lmkecondmovensapno'];
    } else if(datafield === 'lmkecondmobuyrsapno'){
      const comp =   event['lmkopesdmobuyercompname'].lastIndexOf('(') > -1 ? event['lmkopesdmobuyercompname'].substr(event['lmkopesdmobuyercompname'].lastIndexOf('(') + 1).replace(')', '') : event['lmkopesdmobuyercompname'];
      return comp + '-'+ event['lmkecondmobuyrsapno'];
    }
  }
}
