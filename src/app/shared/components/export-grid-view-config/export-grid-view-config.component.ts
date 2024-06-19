import { Component, OnInit } from '@angular/core';
import { ListviewService, MessageService } from '@app/core';
import { ColumnFilterService } from '../../../core/services/column-filter.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '../message/message.component';
import { BaseGrid } from '../grid-view/baseGrid';
import { environment } from '@env/environment';
import { formatDate } from '@angular/common';
import { UserDetail } from '@app/core/models/user-detail';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-export-grid-view-config',
  templateUrl: './export-grid-view-config.component.html',
  styleUrls: ['./export-grid-view-config.component.scss']
})
export class ExportGridViewConfigComponent implements OnInit {

  TextboxTypes = [
    {
      key: 'CONTAINS',
      value: 'Contains'
    },
    {
      key: 'DOES_NOT_CONTAIN',
      value: 'Does Not Contain'
    }, {
      key: 'ENDS_WITH',
      value: 'Ends with'
    },
    {
      key: 'STARTS_WITH',
      value: 'Starts With'
    },
    {
      key: 'NOT_NULL',
      value: 'Not Null'
    },
    {
      key: 'NULL',
      value: 'Null'
    }, {
      key: 'GREATER_THAN',
      value: 'Greater Than'
    },
    {
      key: 'GREATER_THAN_OR_EQUAL',
      value: 'Greater Than or Equal'
    },
    {
      key: 'LESS_THAN',
      value: 'Less Than'
    },
    {
      key: 'LESS_THAN_OR_EQUAL',
      value: 'Less Than or Equal'
    },
    {
      key: 'NOT_EQUAL',
      value: 'Not Equal'
    },
    {
      key: 'EQUAL',
      value: 'Equal'
    },

  ];

  constructor(
    private msg: MessageService,
    private listviewService: ListviewService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private columnFilter: ColumnFilterService,
    private userDetail: UserDetail) { }

  ColumnType = '';
  lstSortOrder = [{ Text: 'Asc', Value: 'asc' }, { Text: 'Desc', Value: 'desc' }];
  columnName: string;
  columnName1: string;
  ColumnList: any = [];
  ColumnListForDDL: any = [];
  StateList: any = [];
  StageList: any = [];
  DMOColumnList: any = [];

  OldViewName: string;
  fopratr: any;
  filterlength: number;
  columnListdata = [];

  GridColumnList = [];
  GridColumnFilterList = [];
  StateFilterList = [];
  StageFilterList = [];

  GridColumns: any = {};
  GridColumnFilters: any = {};
  GridStateFilter: any = {};
  GridStageFilter: any = {};
  objBaseGrid: BaseGrid;
  Toggle = {};
  conditionkey;
  stageState = 'Stage';
  comparisonField = true;

  TimeZone: string;
  fConditionOperator = [
    { value: 'And' },
    { value: 'Or' }
  ];
  ProcessName: string;
  gridguid = 'MCompContainer';
  ErrorMessage: any = '';
  showCustomeBar = false;
  iscustomerEdit = false;
  isDuplicate = false;
  customFilter: any = {
    OldFilterName: '', FilterName: '', ColumnName: '', DataType: '', DisplayName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
    Conditions: []
  };
  comparisionFilter = [];
  filterOperator: '';
  public formVal = true;
  public formValue = true;
  public flag = false;

  ExportColumnList: any = [];
  ExportType: string;
  CanvasType = null;
  ExternalCall = { FromURL: false, displayValue: 'DisplayName', GUID: 'GUID', DownloadFileURL: '' }
  ExportUserData = {
    ManageUsers: '', SortColumn: '-1', SortOrder: '-1', ProcessName: '', TimeZone: 0, ColumnList: '', GridFilters: [], TransactionIDs: '', ParentTransactionID: '', UserIds: '', TransactionID: '',
    ViewName: '',
    SelectedViewName: '',
    columns: [],
    configFor: ''
  };
  FileSetting = { IsChangeFileName: false, FileName: '' };
  FileExtension = { EXCEL: '.xlsx', PDF: 'pdf' };



  dmoGuid: any = {
    guid: '',
    DisplyName: '',
    Name: '',
    type: ''
  };
  /*------------------- GRID JSON -------------------*/
  gridConfigJson = {
    ViewName: '',
    IsDefaultView: false,
    IdentityField: 'TRNSCTNID',
    Columns: {},
    ColumnList: '',
    SortColumn: '',
    SortColumnCaption: 'Select...',
    SortDirection: '',
    SortDirectionCaption: 'Select...',
    PageSize: 10,
    DMOFilters: [],
    StateFilters: [],
    StageFilters: [],
    CustomFilters: {},
    DetailViewMode: 'ShowInPopUp',
    OldViewName: ''

  };

  AllAddButton = false;
  filterRecord = [];
  /*------------------- Get Grid Data -------------------*/
  gridListData;
  disableIsDefaultView: boolean = false;

  ngOnInit() {
    this.getdmodata();
    this.TimeZone = this.userDetail.TimeZone.toString();

  }
  filterColumnName(event) {
    if (event) {
      this.ColumnType = event.Type;
    } else {
      this.ColumnType = '';
    }
  }
  
  /*------------------- Get Stage Data -------------------*/
  getstagedata() {
    this.listviewService.stageList(this.ProcessName).subscribe(
      data => {
        this.StageList = data;
        const distinctStage = this.StageList.filter(
          (key, i, arr) => arr.findIndex(t => t.DisplayName === key.DisplayName) === i
        );
        this.StageList = distinctStage;
      });
  }

  /*------------------- Get State Data -------------------*/
  getstatedata() {
    this.listviewService.stateList(this.ProcessName)
      .subscribe(
        data => {
          this.StateList = data;
          const distinctState = this.StateList.filter(
            (key, i, arr) => arr.findIndex(t => t.DisplayName === key.DisplayName) === i
          );
          this.StateList = distinctState;
        }
      );
  }

  /*------------------- Get DMO Data -------------------*/
  getdmodata() {
    var CanvasType = this.ProcessName === 'LMKOpportunities' ? 'View4' : 'AdminView';
    this.listviewService.dmoListOrderByDMO(this.ProcessName, CanvasType)
      .subscribe(
        data => {
          this.ColumnList = data;
          if (this.ProcessName === 'LMKLivestockSales' || this.ProcessName === 'LMKCRMCommissionAdjustment' || this.ProcessName === 'LMKLivestockLots') {
            let ind = this.ColumnList.findIndex(x => x.Name === 'BMVersion');
            this.ColumnList.splice(ind, 1);
            ind = this.ColumnList.findIndex(x => x.Name === 'WFVersion');
            this.ColumnList.splice(ind, 1);
          }

          if (this.ProcessName === 'LMKCRMCommissionAdjustment') {
            let ind = this.ColumnList.findIndex(x => x.Name === 'StageName');
            this.ColumnList.splice(ind, 1);
            ind = this.ColumnList.findIndex(x => x.Name === 'StateName');
            this.ColumnList.splice(ind, 1);

          } else if (this.ProcessName === 'LMKLivestockLots') {
            let ind = this.ColumnList.findIndex(x => x.Name === 'StageName');
            this.ColumnList.splice(ind, 1);
            ind = this.ColumnList.findIndex(x => x.Name === 'StateName');
            this.ColumnList.splice(ind, 1);

          } else if (this.ProcessName === 'LMKOPECESLot') {
            let ind = this.ColumnList.findIndex(x => x.DisplayName === 'Vendor');
            this.ColumnList[ind].DisplayName = 'Vendor Name';
            ind = this.ColumnList.findIndex(x => x.DisplayName === 'Vendor Domiclled Branch');
            this.ColumnList[ind].DisplayName = 'Vendor Branch';
            ind = this.ColumnList.findIndex(x => x.DisplayName === 'SAP Account Number');
            this.ColumnList[ind].DisplayName = 'Vendor Id';
            ind = this.ColumnList.findIndex(x => x.GUID === 'lmkoeelotdmopriceaud');
            this.ColumnList[ind].DisplayName = '$/Head';
            ind = this.ColumnList.findIndex(x => x.GUID === 'lmkoeelotdmopriceckg');
            this.ColumnList[ind].DisplayName = 'C/Kg';

          }
          // this.getstatedata();

          this.DMOColumnList = this.ColumnList.filter(column => column.Type !== 'DateWithCalendar' && column.Type !== 'CRTDON' && column.Type !== 'MODFON'
            && column.Type !== 'DateEditBox' && column.Type !== 'DateTimeBox' && column.Type !== 'StaticDateBox');

          this.ColumnList.filter(item => item.DataModelObjectGroup).forEach(x => {
            this.ColumnListForDDL.push({
              'TextField': x.DisplayName,
              'ValueField': x,
              DMOG: x.DataModelObjectGroup.Name
            })
          });
          this.getstagedata();
          this.getstatedata();
          this.getGridConfigData();

        }
      );
  }
  OnDestroy() {
    console.log('Destory');
  }
  
  /*------------------- Remove Filter Conditions -------------------*/

  deletecDataRow(index) {
    this.customFilter.Conditions.splice(index, 1);
  } 

  /*------------------- Add Grid Columns -------------------*/
  AddGridColumn(column) {
    if (this.GridColumns[column.GUID] === undefined) {
      this.GridColumns[column.GUID] = '1';
      this.GridColumnList.push(column);
      console.log('grid selected column', this.GridColumnList);
    }
  }

  /*------------------- Add All Grid Columns -------------------*/
  AddALLGridColumn() {
    for (const objColumn of this.ColumnList) {
      if (this.GridColumns[objColumn.GUID] === undefined) {
        this.GridColumns[objColumn.GUID] = '1';
        this.GridColumnList.push(objColumn);
        this.AllAddButton = true;
      }
    }

  }

  /*------------------- Remove Grid Columns -------------------*/
  DeleteGridColumn(column: any) {
    const txt = this.GridColumnList.indexOf(column);
    if (txt > -1) {
      this.GridColumnList.splice(txt, 1);
    }
    delete this.GridColumns[column.GUID];
  }

  /*------------------- Remove All Grid Columns -------------------*/
  DeleteAllGridColumn(column: any) {
    this.GridColumnList = [];
    this.GridColumns = {};
  }
 
  getGridConfigData() {
    this.gridConfigJson.OldViewName = this.gridConfigJson.ViewName;
    const getGridOptions = {
      ProcessName: this.ProcessName,
      GridGuid: this.gridguid,
      ViewName: this.gridConfigJson.ViewName
    };
    this.listviewService.GridConfig(getGridOptions)
      .subscribe(
        data => {
          if (data && data.length > 0) {
            this.disableIsDefaultView = data[0].IsDefaultview;//Add By Nidhi to fix Is Default View Issue 12-Nov-2019
            this.gridListData = JSON.parse(data[0].Config);
            if (this.gridListData.StageFilters != undefined && this.gridListData.StageFilters.length == 0 && this.gridListData.StateFilters.length != 0) {
              this.stageState = 'State';
            } else if (this.gridListData.StateFilters.length == 0 && this.gridListData.StageFilters.length != 0) {
              this.stageState = 'Stage';
            } else {
              this.stageState = 'Stage';
            }
            if (this.OldViewName !== '') {
              this.setEditViewData(data);
            }
          }
        }
      );
  }

  /*------------------- Get Binding -------------------*/
  setEditViewData(data: any) {
    this.gridConfigJson.SortColumnCaption = JSON.parse(data[0].Config).SortColumnCaption;
    this.gridConfigJson.SortDirectionCaption = JSON.parse(data[0].Config).SortDirectionCaption;
    this.gridConfigJson.SortColumn = JSON.parse(data[0].Config).SortColumn;
    this.gridConfigJson.SortDirection = JSON.parse(data[0].Config).SortDirection;
    this.gridConfigJson.IsDefaultView = data[0].IsDefaultview;
    this.gridConfigJson.StateFilters = this.StateFilterList;
    this.gridConfigJson.StageFilters = this.StageFilterList;
    this.gridConfigJson.PageSize = JSON.parse(data[0].Config).PageSize;
    let _configData = JSON.parse(data[0].Config);

    _configData.ColumnList.split(',').forEach(columnKey => {
      _configData.Columns[columnKey]['GUID'] = columnKey;
      if (this.ColumnList.filter(d => d.GUID === columnKey).length > 0) {
        this.GridColumnList.push(this.ColumnList.filter(d => d.GUID === columnKey)[0]);
      }
      else {
        this.GridColumnList.push(JSON.parse(JSON.stringify(_configData.Columns[columnKey])));
      }
      this.GridColumns[columnKey] = '1';
      this.gridConfigJson.DMOFilters.push(columnKey);
    });

    _configData.DMOFilters.forEach(DmoFilterKey => {
      this.GridColumnFilters[DmoFilterKey.GUID] = '1';
      if (this.ColumnList.filter(d => d.GUID === DmoFilterKey.GUID).length > 0) {
        this.GridColumnFilterList.push(this.ColumnList.filter(d => d.GUID === DmoFilterKey.GUID)[0]);
      }
      else {
        this.GridColumnFilterList.push(DmoFilterKey);
      }
    });

    _configData.StateFilters.forEach(objState => {
      this.GridStateFilter[objState.GUID] = '1';
      this.StateFilterList.push(objState);
    });

    _configData.StageFilters.forEach(objStage => {
      this.GridStageFilter[objStage.GUID] = '1';
      this.StageFilterList.push(objStage);
    });

    this.gridConfigJson.CustomFilters = JSON.parse(JSON.stringify(_configData.CustomFilters));
    this.filterlength = Object.keys(this.gridConfigJson.CustomFilters).length;
  }

  /*------------------- Set Sort Column Value -------------------*/
  setSortColumn(objColumn) {
    if (objColumn) {
      this.gridConfigJson.SortColumn = objColumn.GUID;
      this.gridConfigJson.SortColumnCaption = objColumn.DisplayName;
    } else {
      this.gridConfigJson.SortColumnCaption = 'Select...';
    }

  }

  /*------------------- Set Sort Order Value -------------------*/
  setSortOrder(objOption: any) {
    if (objOption) {
      this.gridConfigJson.SortDirection = objOption['Value'];
      this.gridConfigJson.SortDirectionCaption = objOption['Text'];
    } else {
      this.gridConfigJson.SortDirectionCaption = 'Select...';
    }
  }

  setFilterColumnName(objOption: string) {
    this.customFilter.ColumnName = objOption['DisplayName'];
  }
  // Toggle Grid & Filters
  clickEvent(SectionKey) {
    if (this.Toggle[SectionKey] === undefined) {
      this.Toggle[SectionKey] = false;
    } else {

      this.Toggle[SectionKey] = !this.Toggle[SectionKey];
    }
  }
  // Toggle Grid & Filters
  getToggle(SectionKey) {
    if (this.Toggle[SectionKey] === undefined) {
      this.Toggle[SectionKey] = false;

    }
    return this.Toggle[SectionKey];
  }

  /*------------------- Drag & Drop -------------------*/
  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.GridColumnList, event.previousIndex, event.currentIndex);
  }

  IsEmptyObject(obj: any) {
    return Object.keys(obj).length > 0 ? false : true;

  }

  CallBackMethod(modelRef: NgbModalRef, Caller: ExportGridViewConfigComponent) {
    sessionStorage.removeItem('gridPage');
    Caller.objBaseGrid.getGridConfigData(Caller.gridConfigJson.ViewName);
  }

  isNameDuplicate(FilterName: any) {
    var filterCount = Object.keys(this.gridConfigJson.CustomFilters).length;
    if (filterCount > 0) {
      var isExistfilter = (this.gridConfigJson.CustomFilters[this.customFilter.FilterName] === undefined
        ? isExistfilter = true : isExistfilter = false);
      if (isExistfilter === false) {
        if (this.gridConfigJson.CustomFilters[this.customFilter.FilterName].FilterName === FilterName
          && this.iscustomerEdit === false) {
          this.ErrorMessage = 'You cannot create two custom filters with same name.';
          this.isDuplicate = true;
        }
        else if (this.customFilter.OldFilterName !== '' && this.customFilter.OldFilterName !== FilterName
          && this.iscustomerEdit === true) {
          if (this.gridConfigJson.CustomFilters[this.customFilter.FilterName].FilterName === FilterName) {
            this.ErrorMessage = 'You cannot create two custom filters with same name.';
            this.isDuplicate = true;
          }
        }
        else {
          this.ErrorMessage = '';
          this.isDuplicate = false;
        }
      }
      else {
        this.ErrorMessage = '';
        this.isDuplicate = false;
      }
    }
  }

  getColumn(guid: any) {
    var column;
    this.ColumnList.filter(element => {
      if (element.GUID === guid) {
        if (element.DataModelObjectGroup !== undefined) {
          column = element.DataModelObjectGroup.Name;
        } else {
          column = element.Name;
        }
      }
    });
    return column;
  }


  Export() {
    if (this.ExportType === 'EXCEL') {
      this.exportToFile();
    }
    else if (this.ExportType === 'PDF') {
      this.exportToFile();
    }
    else {
      this.msg.showMessage('Warning', { body: 'Export type is missing' });
      return false;
    }
  }

  exportToFile() {
    if (!this.ExternalCall.FromURL) {
      if (this.setSelectedColumn()) {
        if (this.ExportType === 'EXCEL') {
          this.listviewService.ExportToExcel(this.ExportUserData)
            .subscribe(
              (resultBlob: Blob) => {
                this.SaveExportFile(resultBlob);
              }
            );
        } else if (this.ExportType === 'PDF') {
          this.listviewService.ExportToPDF(this.ExportUserData)
            .subscribe(
              (resultBlob: Blob) => {
                this.SaveExportFile(resultBlob);
              }
            );
        }
      }
    } else {
      if (this.setSelectedColumn()) {
        this.listviewService.ExportFileWithEndPointURL(this.ExportUserData, this.ExternalCall.DownloadFileURL)
          .subscribe(
            (resultBlob: Blob) => {
              this.SaveExportFile(resultBlob);
            }
          );
      }
    }
  }

  setSelectedColumn(): boolean { 
    const selectedColumns = [];
    this.GridColumnList.filter((prop) => {
      const gridCol = { DisplayName: prop.DisplayName, Name: prop.NAME, Type: prop.Type, DataType: prop.DataType };
      this.gridConfigJson.Columns[prop.GUID] = gridCol;
      selectedColumns.push(prop.GUID);
    });

    if (selectedColumns.length === 0) {
      this.msg.showMessage('Warning', { body: 'Please select a column' });
      return false;
    } else if (selectedColumns.length > 10 && this.ExportType === 'PDF') {
      this.msg.showMessage('Warning', { body: 'More than 10 columns are not allowed for export type PDF' });
      return false;
    }
    this.ExportUserData.ColumnList = selectedColumns.join(',');
    return true;
  }

  SaveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    if (this.FileSetting.IsChangeFileName) {
      fileName = this.FileSetting.FileName +
        '_' + (curDate.getMonth() + 1).toString()
        + '_' + curDate.getDate()
        + '_' + curDate.getFullYear()
        + '_' + curDate.getHours()
        + '_' + curDate.getMinutes()
        + '_' + curDate.getSeconds()
        + this.FileExtension[this.ExportType];
    }
    else {
      fileName = this.ExportUserData.ProcessName +
        '_' + (curDate.getMonth() + 1).toString()
        + '_' + curDate.getDate()
        + '_' + curDate.getFullYear()
        + '_' + curDate.getHours()
        + '_' + curDate.getMinutes()
        + '_' + curDate.getSeconds()
        + this.FileExtension[this.ExportType];
    }
    saveAs(FileData, fileName);
    this.activeModal.close(true);
  }

}

