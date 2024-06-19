import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';


import { GridViewExportComponent } from '../grid-view-export/grid-view-export.component';
import { GridViewConfigurationComponent } from '../grid-view-configuration/grid-view-configuration.component';
import { FormViewTcModelComponent } from '../form-view-tc-model/form-view-tc-model.component';
import { BulkUpdateModalComponent } from '../bulk-update-modal/bulk-update-modal.component';
import { MessageComponent } from '../message/message.component';

import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { ListviewService, ApplicationService, GridConfig, NgbDateFRParserFormatter, MessageService } from '@app/core';

import { BaseGrid } from './baseGrid';
import { CopyRecordComponent } from '../copy-record/copy-record.component';

import { saveAs } from 'file-saver';
import { EContractService } from '@app/modules/crm/e-contracts/services/e-contract.service';
import { SalesService } from '@app/modules/crm/sales/services/sales.service';
import { Title } from '@angular/platform-browser';
import { ProcessFormViewComponent } from '../process-form-view/process-form-view.component';
import { ChildFormViewComponent } from '@app/modules/process-control/pages/child-form-view/child-form-view.component';
import { SubProcessCopyRecordComponent } from '../sub-process-copy-record/sub-process-copy-record.component';
import { isNullOrUndefined } from 'util';
import { UserDetail } from '@app/core/models/user-detail';
import { ExportGridViewConfigComponent } from '../export-grid-view-config/export-grid-view-config.component';
import { SpinnerVisibilityService } from 'ng-http-loader';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
  styleUrls: ['./grid-view.component.scss']
})
export class GridViewComponent extends BaseGrid {
  rowSearchInput: string;
  pageNumberControlLength: number;
  DisplayName = sessionStorage.getItem('DisplayName') !== null ? sessionStorage.getItem('DisplayName') : "";
  IsPermissionSet = false;
  TransactionIDs: any;
  processName: any;
  errorMessage = '';
  FileExtension = '.xlsx';
  checkChildRecordAddCopyRecord = true;
  dmoValues = [];
  childProcess = false;
  @Output() openFormViewModal = new EventEmitter<any>();
  @Output() navigateDetailPage = new EventEmitter<any>();
  @Output() copyRowRecord = new EventEmitter<any>();
  @Output() openExportModal = new EventEmitter<any>();
  IsCoutLoad: boolean = false;
  // Properties
  @Input() set Config(obj: GridConfig) {
    this.ProcessName = (obj.ProcessName && obj.ProcessName.trim()) || '';
    this.ViewName = (obj.ViewName && obj.ViewName.trim()) || '';
    this.GridGuid = (obj.GridGuid && obj.GridGuid.trim()) || 'MCompContainer';
    this.PageSize = (obj.PageSize && obj.PageSize.trim()) || '10';
    this.ShowSelectAll = (obj.ShowSelectAll && obj.ShowSelectAll) || false;
    this.TimeZone = this.userDetail.TimeZone.toString();
    this.ColumnList = (obj.ColumnList && obj.ColumnList.trim()) || '';
    this.LstGridFilter = (obj.LstGridFilter && obj.LstGridFilter) || [];
    this.PageNumber = (obj.PageNumber && obj.PageNumber.trim()) || '0';
    this.PageCount = (obj.PageCount && obj.PageCount.trim()) || '0';
    this.HasGlobalSearch = obj.HasGlobalSearch === false ? false : true;
    this.IsSubProcess = obj.IsSubProcess === true ? true : false;
    this.HideDeleteActionIcon = obj.HideDeleteActionIcon === true ? true : false;
    this.HideDisplayName = obj.HideDisplayName === true ? true : false;
    this.ShowBulkUpdateButton = obj.ShowBulkUpdateButton === true ? true : false;
    this.ParentTransactionId = obj.ParentTransactionId;
    this.ParentDmoValue = obj.ParentDmoValue;
    this.ChildDmoGuid = obj.ChildDmoGuid;
    this.CanAddNewRow = obj.CanAddNewRow === true ? true : false;
    this.TriggerName = (obj.TriggerName && obj.TriggerName.trim()) || '';
    this.canInlineEdit = obj.canInlineEdit === true ? true : false;
    this.DmoColumnName = (obj.DmoColumnName && obj.DmoColumnName.trim()) || '';
    this.IsOtherAPICall = obj.IsOtherAPICall === true ? true : false;     
      //Entity related code start– Nidhi   
    this.SubProcessChild = obj.SubProcessChild;
    this.ParentFormDmoValue = obj.ParentFormDmoValue;
        //Entity related code end– Nidhi
    this.IsAddCopyRecPermissionChildPro = obj.IsAddCopyRecPermissionChildPro;
  }
  // For Child Process Load on Click
  @Input() ChildProcessPageLoad= true;

  constructor(
    private msg: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private listviewService: ListviewService,
    private applicationService: ApplicationService,
    public toastr: ToastrService,
    public elRef: ElementRef,
    private modalService: NgbModal,
    private columnFilter: ColumnFilterService,
    private econtract: EContractService,
    private saleService: SalesService,
    private titleService: Title,
    private userDetail: UserDetail,
    private spinner: SpinnerVisibilityService
  ) {
    super(elRef, toastr);
  }

  getGridConfigData(gridviewName?) {
    if (gridviewName) {
      this.ViewName = gridviewName;
    }
    // On Click Load Child Process
    this.listviewService.callData.subscribe(res => {
      if(this.ProcessName === res){
          this.childProcess = true;
        if(!this.IsAddCopyRecPermissionChildPro){
          this.checkChildRecordAddCopyRecord = false;
        }
      this.setConfigData(this.gridConfigData);
      }
    });
    this.listviewService.GridConfig(this)
      .subscribe(
        data => {
          if (data == null || data === '') {
            this.msg.showMessage('Fail', { body: 'Can\'t load configuration for grid view' });
            return false;
          }

          let pushViewName = false;
          if (this.ViewName === '') {
            pushViewName = true;
            this.viewList = [];
          }
          if (this.ViewName !== '' && data && data.length === 1) {
            sessionStorage.setItem('config', data[0].Config);
          }
          if (data) {
            data.forEach(element => {
              if (pushViewName) {
                this.viewList.push({ IsDefaultview: element.IsDefaultview, Viewname: element.Viewname });
              }
              else {
                if (this.viewList.filter(r => r.Viewname === element.Viewname).length <= 0) {
                  this.viewList.push({ IsDefaultview: element.IsDefaultview, Viewname: element.Viewname });
                }
              }
              if (sessionStorage.getItem('ViewName') !== null && element.Viewname === sessionStorage.getItem('ViewName')) {
                this.ViewName = sessionStorage.getItem('ViewName');
                this.gridConfigData = JSON.parse(sessionStorage.getItem('config'));
                this.isDefaultView = element.IsDefaultview;
              }
              if (sessionStorage.getItem('ViewName') === null) {
                if (element.IsDefaultview || element.Viewname === this.ViewName) {
                  this.ViewName = element.Viewname;
                  this.gridConfigData = JSON.parse(element.Config);
                  this.isDefaultView = element.IsDefaultview;
                }
              }
            });
          }
          // if (gridviewName) {
          //   let flg = false;
          //   for (let i = 0; i < this.viewList.length; i++) {
          //     if (this.viewList[i].Viewname === gridviewName) {
          //       flg = true;
          //       break;
          //     }
          //   }
          //   if (!flg) {
          //     this.viewList.push({ IsDefaultview: false, Viewname: gridviewName });
          //   }
          // }
          if(this.ChildProcessPageLoad === true){
          this.setConfigData(this.gridConfigData);
          }
        });
  }

  setConfigData(gridConfig: any) {
    if (gridConfig == null) {
      this.msg.showMessage('Fail', { body: 'Can\'t load configuration for grid view' });
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
    // #1096 - Requirement (Cosmetic) | LM Grid missing currency unit on Start Price, Reserve Price, Name :sanjeev, Date : 17 May 20202
    for (const objColumn of colList) {
      this.columns.push({
        text: gridConfig.Columns[objColumn].DisplayName,
        datafield: objColumn,
        dataType: gridConfig.Columns[objColumn].Type,
        width: gridConfig.Columns[objColumn].Width,
        dmoValuedataType: gridConfig.Columns[objColumn].DataType
      });
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
    if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridPage')) {
      const sort = JSON.parse(sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridPage'));
      //this._bodyData.PageSize = sort.pageSize;//Commentd because pagesize is not reflect if any changes in pagesize in Gridconfig 
      this._bodyData.PageNumber = +sort.pageNumber - 1;
    }
    this.getGridData();
    this.getDMOsMapping();
  }

  getGridData() {
    this.route.paramMap.subscribe(params => {
      this.UrlProcessName = params.get('process_name');
      if(this.childProcess)
      this._bodyData.RefererProcessName = this.UrlProcessName;
      else
      this._bodyData.RefererProcessName = "";
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
          FilterType: 'Column_Filter'
        };
      }
      if (this.ProcessName === 'LMKOpportunities' && this.UrlProcessName === 'LMKESaleyardListings') {
        if (this.ChildCustomfilters.esaleyardlistinggrid1 === undefined || this.ChildCustomfilters.esaleyardlistinggrid2 === undefined) {
          this.ChildCustomfilters.esaleyardlistinggrid1 = {
            GridConditions: [
              {
                Condition: "EQUAL",
                ConditionValue: "Bid & Offer"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Classified"
              }
            ],
            DataField: "lmkopesdmololistingtype",
            FilterType: "Column_Filter"
          };
        }
        if (this.ChildCustomfilters.esaleyardlistinggrid2 === undefined || this.ChildCustomfilters.esaleyardlistinggrid2 === undefined) {
          this.ChildCustomfilters.esaleyardlistinggrid2 =
          {
            GridConditions: [
              {
                Condition: "EQUAL",
                ConditionValue: "Live"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Review"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Available Soon"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Bid Open"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Closing Soon"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Passed In"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Closed"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Withdraw/Cancel"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Sold"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Hold"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "Draft Contract"
              },
              {
                Condition: "EQUAL",
                ConditionValue: "In Queue"
              }
            ],
            DataField: "WFOSDISPNAME",
            LogicalOperator: "Or",
            FilterType: "Column_Filter"
          };
        }
        if (this.ChildCustomfilters.esaleyardlistinggrid1 !== undefined) {
          this._bodyData.GridFilters.push(this.ChildCustomfilters.esaleyardlistinggrid1);
        }
        if (this.ChildCustomfilters.esaleyardlistinggrid2 !== undefined) {
          this._bodyData.GridFilters.push(this.ChildCustomfilters.esaleyardlistinggrid2);
        }
      } else if (this.ProcessName === 'LMKOpportunities' && this.UrlProcessName === 'LMKCRMEContractsRecords') {
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
        }

        if (this.ChildCustomfilters.esaleyardlistinggrid1 !== undefined) {
          this._bodyData.GridFilters.push(this.ChildCustomfilters.esaleyardlistinggrid1);
        }
      } else if (this.ProcessName === 'LMKLivestockSales') {
        this._bodyData.ColumnList = this._bodyData.ColumnList.concat(',dmocrmheaderinfsaledate,dmocrmhisalecreatedfrom');
      }

      if (this.ChildCustomfilters.childgrid !== undefined && this.ParentTransactionId === undefined) {
        this._bodyData.GridFilters.push(this.ChildCustomfilters.childgrid);
      }

      Object.keys(this.filters).forEach(key => {
        this._bodyData.GridFilters.push(this.filters[key]);
      });

      if (this.activeStateFilter.length === 0) {
        Object.keys(this.filters).forEach(key => {
          if (this.filters[key].FilterType === 'State_Filter' || 'Stage_Filter') {
            this.activeStateFilter.push(this.filters[key].DataField);
          }
          if (this.filters[key].FilterType === 'Global_Search') {
            //#887 - #382 - ETKT - #360 - All App-Generic -Global search for Date should with DD/MM/YYYY format
            this.elRef.nativeElement.querySelector('#globalSearch').value = this.filters[key].GridConditions[0].RowValue;
          }
          if (this.filters[key].FilterType === 'MyRecord') {
            this.selectedAllMyRecordFilter = this.filters[key].GridConditions[0].ConditionValue;
          }
          if (this.filters[key].FilterType === 'DMO_Filter') {
            this.selectedDmoFilter[this.filters[key].DataField] = this.filters[key].GridConditions[0].ConditionValue;
          }
        });
      }
      if (!this.IsPermissionSet) {
        this.IsPermissionSet = true;
        this.listviewService.userActionPermission(this.ProcessName).subscribe(
          data => {
            this.IsDeletionAllow = data.IsDeletionAllow;
            this.IsCopyAllow = data.IsCopyAllow;
            this.IsBulkUpdateAllow = data.IsBulkUpdateAllow;
            this.IsBulkUploadAllow = data.IsBulkUploadAllow;
            this.IsNewEntryAllow = data.IsNewEntryAllow;
            this.IsExcelAllow = data.IsExcelAllow;
            this.IsPDFAllow = data.IsPDFAllow;

          });
      }
      if (this.IsOtherAPICall) {
        this.econtract.GridData(this._bodyData).subscribe(
          data => {
            this.spinner.show();           
            super.BindData(data);                                       
            this.spinner.hide();
            this.getprocessDataCount(data);             
          });
      } else {
        this.listviewService.GridData(this._bodyData, true).subscribe(
          data => {             
            this.spinner.show();           
            super.BindData(data);           
            this.spinner.hide(); 
            this.getprocessDataCount(data);           
          });
      }

    });
  }
//Entity related code– Nidhi 
  getprocessDataCount(data) {
    if (this.IsOtherAPICall) {
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
    else {
      if (this.TableInfo.Recordes === -1 || this.isFilterClick === true) {
        this.IsCoutLoad = false;
        this.listviewService.GetProcessDataCount(this._bodyData).subscribe(recordsCount => {
          this.TableInfo.Recordes = recordsCount.RecordsCount;
          this.IsCoutLoad = true;
          this.isFilterClick = false;
          this.setPaging(data);
        });
      }
      else {
        this.setPaging(data);
      }
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

  getDMOsMapping() {
    if (this.CanAddNewRow) {
      this.listviewService.dmoListOrderByDMO(this.ProcessName)
        .subscribe(
          data => {
            if (!!data && data.length) {
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
    let pTransId;
    // if(this.IsSubProcess && this.ParentTransactionId === undefined){
    //   this.route.paramMap.subscribe(params => {pTransId = params.get('id');})
    // }
    if (!this.DMOData[dmoGuid]) {
      this.showItemLoading = false;
      this.listviewService.DMOData(this.ProcessName, dmoGuid, pTransId).subscribe(
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
      sessionStorage.setItem('ViewName', this.ViewName);
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
      { windowClass: 'grid-config-view-modal', backdrop: 'static', keyboard: false }
    );
    const modalInstance: GridViewConfigurationComponent = modalRef.componentInstance;
    modalInstance.gridConfigJson.ViewName = viewName;
    modalInstance.ProcessName = this.ProcessName;
    modalInstance.OldViewName = viewName;
    modalInstance.objBaseGrid = this;
  }

  // openNewExportPopup(ExportType: string) {
  //   if (this.isCRM()) {
  //     let exportBody = { columns: this.columns,SelectedRecordIds: this.SelectedRecordIds, _bodyData:this._bodyData,ExportType:ExportType };
  //     this.openExportModal.emit(exportBody);
  //   } else {
  //     const modalRef = this.modalService.open(GridViewExportComponent, { backdrop: 'static' });
  //     const modalInstance: GridViewExportComponent = modalRef.componentInstance;
  //     modalInstance.ExportType = ExportType.toUpperCase();
  //     modalInstance.ExportPopup = modalRef;
  //     modalInstance.ExportUserData.SortColumn = this._bodyData.SortColumn;
  //     modalInstance.ExportUserData.SortOrder = this._bodyData.SortOrder;
  //     modalInstance.ExportUserData.ProcessName = this._bodyData.ProcessName;
  //     modalInstance.ExportUserData.GridFilters = this._bodyData.GridFilters;
  //     modalInstance.ExportUserData.ParentTransactionID = this.ParentTransactionId;
  //     modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
  //     modalInstance.ExportUserData.columns = this.columns;
  //   }
  // }

  /* ---------------------Open Confirmation Popup for single delete-------------- */
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsDelete: boolean, IsDefaultView: boolean,
  //   IsConfirmation: boolean, confirmationText: string) {
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
    console.log(this.tableData);
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
      this.msg.showMessage('Warning', { body: 'At least one record must be selected in order to delete' });
      // modalInstance.MessageHeader = 'Warning !';
      // modalInstance.Message = 'At least one record must be selected in order to delete.';
      // modalInstance.ButtonText = 'Ok';
    }
  }

  FilterList(item): string {
    //#887 - #382 - ETKT - #360 - All App-Generic -Global search for Date should with DD/MM/YYYY format
    let dataType = item.map(e => e.dataType).join(',');
    // #CRMI-1662 - EXT - 891-890 | Filtering date column defect  - Biresh
    if (dataType && (['Global_Search', 'CreatedDateTime', 'LastUpdatedDateTime', 'DateTimeZone', 'CRTDON', 'MODFON', 'DateTimeBox', 'DateEditBox', 'DateWithCalendar', 'CreatedDate', 'LastUpdatedDate', 'StaticDateBox','StaticDateBox,StaticDateBox','CRTDON,CRTDON','MODFON,MODFON','CreatedDate,CreatedDate','DateWithCalendar,DateWithCalendar','CreatedDateTime,CreatedDateTime'].indexOf(dataType) > -1))
      return item.map(e => e.RowValue).join(',');
    else
      return item.map(e => e.ConditionValue).join(',');
  }
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete Record',
      body: 'Are you sure youwant to delete this record?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this record',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete?', 'Delete Record', 'Confirm Delete', this.deleteConfirmation,
    //   true, false, true, 'Yes, delete this record');
  }
  // 'Are you sure you want to delete this video?', 'Delete Video Record', 'Confirm Delete',
  // this.deleteConfirmation, true, false, true, 'Yes, delete this video.'

  /* -------------------------Delete Single Record---------------------- */
  deleteConfirmation(modelRef: NgbModalRef, Caller: GridViewComponent) {
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
  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: GridViewComponent) {
    if (Caller.ProcessName === 'LMKLivestockSales') {
      if (Caller.tableData.findIndex(x => x.selected === true && x.WFODISPNAME !== 'In Process') > -1) {
        Caller.msg.showMessage('Warning', { body: "Sale records in this stage cannot be deleted", header: ' ' });
        // Caller.showErrorMessage('Please select In-Process stage records only. ', 'Error', 'Ok', null, false, false, false, '');
      }
      else {
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

    }

    else {
      const SelectedItem = Caller.tableData.filter(x => x.selected === true).map(x => x.TRNSCTNID).join(',');
      if (SelectedItem) {
        Caller.listviewService.deleteGridData(SelectedItem).subscribe(
          result => {
            if (result === true) {
              Caller.getGridData();
              modelRef.close();
            }
          });
      } else {
        modelRef.close();
      }

    }



  }

  /* -------------------------End Delete Selected Item---------------------- */
  openNewFormViewPopup() {    
    if (this.isCRM() || this.ProcessName == 'LMKCRMCommissionAdjustment') {
      this.openFormViewModal.emit();
    } else if (this.IsSubProcess && this.ParentDmoValue === undefined) {
      // this.router.navigate([`/process_control/${this.ProcessName}/child_form_view`, this.ParentTransactionId]);
      const modalRef = this.modalService.open(ProcessFormViewComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: ProcessFormViewComponent = modalRef.componentInstance;
      modalInstance.processName = this.ProcessName;
      modalInstance.parentTransactionId = this.ParentTransactionId;
      modalInstance.ParentDmoValue = this.ParentDmoValue;
      modalInstance.ChildDmoGuid = this.ChildDmoGuid;
      //Entity related code start– Nidhi
      modalInstance.SubProcessChild = this.SubProcessChild;
      modalInstance.ParentFormDmoValue = this.ParentFormDmoValue;   
      //Entity related code end – Nidhi   
      modalInstance.IsAddCopyRecPermissionChildPro = this.IsAddCopyRecPermissionChildPro;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
          this.isFilterClick = true;
        }
      }, (reason) => {
      }
      );
    } else if (this.IsSubProcess && this.ParentTransactionId === undefined) {
      

      const modalRef = this.modalService.open(ProcessFormViewComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: ProcessFormViewComponent = modalRef.componentInstance;
      modalInstance.processName = this.ProcessName;
      modalInstance.ParentDmoValue = this.ParentDmoValue;
      modalInstance.ChildDmoGuid = this.ChildDmoGuid;
      //Entity related code start– Nidhi
      modalInstance.SubProcessChild = this.SubProcessChild;
      modalInstance.ParentFormDmoValue = this.ParentFormDmoValue; 
      //Entity related code end– Nidhi     
      modalInstance.IsAddCopyRecPermissionChildPro = this.IsAddCopyRecPermissionChildPro;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
          this.isFilterClick = true;
        }
      }, (reason) => {
      }
      );

      // this.router.navigate([`/process_control/${this.ProcessName}/child_form_view`]);
    } else {
      // const modalRef = this.modalService.open(FormViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      // const modalInstance: FormViewModalComponent = modalRef.componentInstance;
      const modalRef = this.modalService.open(FormViewTcModelComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: FormViewTcModelComponent = modalRef.componentInstance;
      modalInstance.processName = this.ProcessName;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
          this.isFilterClick = true;
        }
      }, (reason) => {
      }
      );
    }
  }
  bindColumnFilterDdl(item) {
    const FilterData = this.columnFilter.GetFilterByDataType(item.dataType, item.dmoValuedataType); // Calling Function to get ColumnFilter Condition data
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
    if (this.SelectedRecordIds.length === 0) {
      // const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
      // const modalInstance: MessageComponent = modalMsgRef.componentInstance;
      // modalInstance.MessagePopup = modalMsgRef;
      // modalInstance.IsConfirmation = false;
      // modalInstance.Message = 'No record selected for bulk update';
      this.msg.showMessage('Warning', { body: 'No record selected for bulk update' });
    } else {
      const modalRef = this.modalService.open(BulkUpdateModalComponent, { size: 'lg' });
      const modalInstance: BulkUpdateModalComponent = modalRef.componentInstance;
      modalInstance.transactionIds = this.SelectedRecordIds;
      modalInstance.processName = this.ProcessName;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
          this.isFilterClick = true;
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
      if (Result.status === 'Success') {
        this.file = null;
        this.fileName = '';
        var message = "Total Count: " + Result.result.TotalCount + ", " + "Pass Count: " + Result.result.PassCount + " and " + "Error Count: " + Result.result.ErrorCount;
        this.getGridConfigData();
        this.modalService.dismissAll();
        this.msg.showMessage('Success', {
          header: 'File uploaded successfully',
          body: message,
        });
        // this.showErrorMessage(message, 'File uploaded successfully.', 'Ok', null, false, true, false, '');
      } else {
        this.msg.showMessage('Fail', { body: Result.Message });
        // this.showErrorMessage(Result.Message, 'Error', 'Ok', null, false, true, false, '');
      }
    }, error => { console.log(error); });
  }
  //#region Copy
  openCopyConfirmation(id) {
    this.transactionId = id;
    if (this.isCRM()) {
      this.copyRowRecord.emit({ id });
    } else if(this.isCommissionAdjustment()) {
      this.copyRowRecord.emit({ id });
    } else if (this.IsSubProcess && this.ParentDmoValue === undefined) {
      // form open in popup
      const modalRef = this.modalService.open(SubProcessCopyRecordComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: SubProcessCopyRecordComponent = modalRef.componentInstance;
      modalInstance.transactionId = id;
      modalInstance.parentTransactionId = this.ParentTransactionId;
      modalInstance.processName = this.ProcessName;
      modalInstance.ParentDmoValue = this.ParentDmoValue;
      modalInstance.ChildDmoGuid = this.ChildDmoGuid;
        //Entity related code – Nidhi
      modalInstance.SubProcessChild = this.SubProcessChild;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
        }
      }, (reason) => {
      });
      // this.router.navigate([`/process_control/${this.ProcessName}/copy_view`, id, this.ParentTransactionId]);
    } else if (this.IsSubProcess && this.ParentTransactionId === undefined) {
      // form open in popup
      const modalRef = this.modalService.open(SubProcessCopyRecordComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: SubProcessCopyRecordComponent = modalRef.componentInstance;
      modalInstance.transactionId = id;
      modalInstance.processName = this.ProcessName;
      modalInstance.ParentDmoValue = this.ParentDmoValue;
      modalInstance.ChildDmoGuid = this.ChildDmoGuid;      
      //Entity related code- Nidhi 
      modalInstance.SubProcessChild = this.SubProcessChild;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
        }
      }, (reason) => {
      });
      // this.router.navigate([`/process_control/${this.ProcessName}/copy_view`, id]);
    } else {
      const modalRef = this.modalService.open(CopyRecordComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: CopyRecordComponent = modalRef.componentInstance;
      modalInstance.transactionId = id;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
        }
      }, (reason) => {
      });
    }
  }

  isCRM() {
    return sessionStorage.AppName === 'LMKLivestockSales';
  }
  isCRMProceedManagement() {
    return sessionStorage.AppName === 'LMKLivestockSales' && this.SelectedRecordIds.length === 1 && this.isFinilised == false;
  }
  isCommissionAdjustment() {
    return sessionStorage.AppName === 'LMKCRMCommissionAdjustment';
  }
  goToDetailPage(id: any, column: string) {
    if (this.isCRM()) {
      this.navigateDetailPage.emit({ Id: id, Column: column });
    } else if (this.isCommissionAdjustment()) {
      this.navigateDetailPage.emit({ Id: id, Column: column });
    } else if (this.IsSubProcess) {
      const modalRef = this.modalService.open(ChildFormViewComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: ChildFormViewComponent = modalRef.componentInstance;
      modalInstance.processName = this.ProcessName;
      modalInstance.transactionId = id;
      modalInstance.ParentDmoValue = this.ParentDmoValue;
      modalInstance.ChildDmoGuid = this.ChildDmoGuid;      
      //Entity related code– Nidhi 
      modalInstance.SubProcessChild = this.SubProcessChild;
      modalRef.result.then(async (result) => {
        if (result) {
          this.getGridData();
          this.isFilterClick = true;
        }
      }, (reason) => {
      });
      // this.router.navigate([`/process_control/${this.ProcessName}/child_view`, id]);
    } else if (this.ProcessName === 'LMKOpportunities') {
      this.navigateDetailPage.emit({ id, processUrlName: 'LMKESaleyardListings' });
    } else {
      this.navigateDetailPage.emit({ id, processUrlName: this.ProcessName });
    }
  }

  goToNewLotPage() {
    this.navigateDetailPage.emit('new');
  }

  //#endregion

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

    const msgRef = this.msg.showMessage('Warning', {
      header: 'Save This Record',
      body: 'Are you sure you want to save this record?',
      btnText: 'Confirm',
      isConfirmation: true,
    });

    // modalMsgRef.result.then(async (result) => {
    msgRef.result.then(async (result) => {
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
    });
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

  createNewRecord(modelRef: NgbModalRef, Caller: GridViewComponent) {

    const rowData = { ...Caller.newRow.edit_value };
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

  viewBulkLogRecord() {
    let curLogProcessName = '';
    this.route.paramMap.subscribe(params => {
      if (!this.IsSubProcess) {
        curLogProcessName = params.get('process_name')
      } else {
        curLogProcessName = this.ProcessName;
      }
      window.open(`/process_control/${curLogProcessName}/bulk-log`, '_blank');
    });
  }

  downloadTemplate() {
    let curProcessName = '';
    this.route.paramMap.subscribe(params => {
      if (!this.IsSubProcess) {
        curProcessName = params.get('process_name')
      } else {
        curProcessName = this.ProcessName;
      }
      this.applicationService.DownloadBulkLog(curProcessName).subscribe(result => {
        this.SaveUploadLog(result);
      })
    });
  }

  SaveUploadLog(FileData: any) {
    let appDispName: any;
    if (sessionStorage.getItem('DisplayName')) {
      //appDispName = this.ProcessName;//sessionStorage.getItem('DisplayName');
      appDispName = localStorage.getItem(this.ProcessName + '~~~DownloadBulkTemp');
      if (appDispName === undefined || appDispName === null)
      appDispName = sessionStorage.getItem('DisplayName');
    }
    const curDate = new Date();
    const fileName = appDispName.replace(' ', '_') + '_Template' +
      "_" + (curDate.getMonth() + 1).toString()
      + "_" + curDate.getDate()
      + "_" + curDate.getFullYear()
      + "_" + curDate.getHours()
      + "_" + curDate.getMinutes()
      + "_" + curDate.getSeconds()
      + this.FileExtension;
    saveAs(FileData, fileName);
  }

  public onPageNumberChange(keydown: KeyboardEvent) {
    if (keydown.key === 'Backspace')
      this.pageNumberControlLength = keydown.target['value'].length - 2;
    else {
      if ((keydown.keyCode >= 48 && keydown.keyCode <= 57) || (keydown.keyCode >= 96 && keydown.keyCode <= 105))
        this.pageNumberControlLength = keydown.target['value'].length;
    }
  }
  openProceedManagement(proceedManagement: any) {
    this.file = null;
    this.fileName = '';
    const modalRef = this.modalService.open(proceedManagement, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false });
    const modalInstance = modalRef.componentInstance;
    this.TransactionIDs = this.SelectedRecordIds[0];
  }
  updateDueDatefromPMgt() {
    if (this.datemodel != '' && this.datemodel != null && this.datemodel != undefined) {
      let SelectedDueDate = this.datemodel;
      SelectedDueDate = `${SelectedDueDate.month}/${SelectedDueDate.day}/${SelectedDueDate.year}`;
      if (this.saleService.isFutureDate(this.tableData.find(x => x.selected === true).dmocrmheaderinfsaledate, SelectedDueDate)) {
        const bodyData = {
          SaleTransactionID: this.TransactionIDs,
          VendorTermsTranId: '',
          DueDate: SelectedDueDate
        };
        this.saleService.UpdateVendorTerms(bodyData).subscribe(x => {
          this.modalService.dismissAll();
          this.toastr.success('Data saved successfully');
        });
      } else {
        this.msg.showMessage('Fail', { body: 'Payment date cannot be in the past' });
        // this.showErrorMessage('Payment date cannot be in the past ',
        //   'Error', 'Ok', null, false, false, false, '');
      }
    } else {
      this.errorMessage = 'Please Input Valid Date.';
    }
  }
  ValidateDueDate(date: any) {
    const duedate = this.isDate(date);
    if (duedate == false) {
      this.errorMessage = 'Please input valid date.';
    }
    else
      this.errorMessage = '';
  }

  isDate(date: any) {
    if (date !== undefined && date !== null && date !== '') {
      let DueDate = `${date.month}/${date.day}/${date.year}`;
      const regex = "(0?[1-9]|1[012])/(0?[1-9]|[12][0-9]|3[01])/((19|20)\\d\\d)";
      if (DueDate.match(regex)) return true; else return false;
    }
  }
  get isExcelAndPDFDisabled() {
    if (this.ProcessName === 'LMKCRMCommissionAdjustment' && this.SelectedRecordIds.length === 0) {
      return true;
    } else {
      return false;
    }
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
    if (this.ProcessName === '' || this.ProcessName === 'commissionadjustment') {
      const url = (this.router.url).split('/');
      if (url[2] === 'LMKESaleyardListings') {
        this.ProcessName = 'LMKOpportunities';
        sessionStorage.AppName = 'LMKOpportunities';
        this._bodyData.ProcessName = this.ProcessName;
      } else if (url[2] === 'commissionadjustment') {
        this.ProcessName = url[3];
        sessionStorage.AppName = url[3];
        this._bodyData.ProcessName = this.ProcessName;
      } else if (url[2] === 'sales') {
        this.ProcessName = 'LMKLivestockSales';
        sessionStorage.AppName = 'LMKLivestockSales';
        this._bodyData.ProcessName = this.ProcessName;
      } else {
        this.ProcessName = url[2];
        sessionStorage.AppName = url[2];
        this._bodyData.ProcessName = this.ProcessName;
      }
      if (this.ProcessName !== '') {
        this.applicationService.getDisplayNameByProcessName(this.ProcessName).subscribe(res => {
          if (res != null && res.length > 0) {
            sessionStorage.setItem('DisplayName', res[0].DisplayName);
            this.DisplayName = sessionStorage.getItem('DisplayName');
            this.titleService.setTitle('Nutrien | ' + this.DisplayName);
          }
        });
        this.getGridConfigData();
      }
    }
  }
  //Changes Based on Parent Transaction ID #1038
  dmoFilterFn(guid: string, $event: any) {
    this.DMODataFilter[guid] = $event.target.value;
    //  if($event.target.value !== '' && $event.target.value.length === 1 && $event.key.toLocaleLowerCase() !== 'backspace'){
    //    this.dmoValues = this.DMOData[term];
    //  }
    //  if($event.target.value !== '' && !isNullOrUndefined(this.dmoValues)){
    //  this.DMOData[term] = this.dmoValues.filter(x => x.DataValue.toString().toLocaleLowerCase().indexOf($event.target.value.toString().toLocaleLowerCase()) > -1);
    //  }
    //  else{
    //   this.DMOData[term] = this.dmoValues;
    //  }
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
    modalInstance.ExportUserData.SelectedViewName = viewName;
  }
}



