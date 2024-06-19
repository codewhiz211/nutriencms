import { Component, OnInit } from '@angular/core';
import { ListviewService, ColumnFilterService, MessageService } from '@app/core';

import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BaseGrid, MessageComponent } from '@app/shared';
import { EContractService } from '../../services/e-contract.service';
import { environment } from '@env/environment';
import { formatDate } from '@angular/common';
import { UserDetail } from '@app/core/models/user-detail';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-export-e-conract-config',
  templateUrl: './export-e-conract-config.component.html',
  styleUrls: ['./export-e-conract-config.component.scss']
})
export class ExportEConractConfigComponent implements OnInit {

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
  ColumnListForDDL: any = [];
  constructor(
    private msg: MessageService,
    private eservice: EContractService,
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
  StateList: any = [];
  StageList: any = [];

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
    OldFilterName: '', FilterName: '', ColumnName: '', DisplayName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
    Conditions: []
  };
  comparisionFilter = [];
  filterOperator: '';
  public formVal = true;
  public formValue = true;

  public flag = false;

  FileSetting = { IsChangeFileName: false, FileName: '' };
  FileExtension = { EXCEL: '.xlsx', PDF: 'pdf' };
  ExternalCall = { FromURL: false, displayValue: 'DisplayName', GUID: 'GUID', DownloadFileURL: '' }

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

  ExportType: string;
  ExportUserData = {
    ManageUsers: '', SortColumn: '-1', SortOrder: '-1', ProcessName: '', TimeZone: 0, ColumnList: '', GridFilters: [], TransactionIDs: '', ParentTransactionID: '', UserIds: '', TransactionID: '',
    ViewName: '',
    columns: [],
    configFor: '',
    SelectedViewName: '',
    ConfigProcessName: ''
  };

  /*------------------- Get Grid Data -------------------*/
  gridListData;
  disableIsDefaultView;

  ngOnInit() {
    this.getdmodata();
    if (this.gridConfigJson.ViewName !== '') {
      this.getGridConfigData();
    }
    this.TimeZone = this.userDetail.TimeZone.toString();
  }
  filterColumnName(event) {
    if (event) {
      this.ColumnType = event.Type;
    } else {
      this.ColumnType = '';
    }
  }

  /*------------------- Hide Comparision Value -------------------*/
  conditionKeys(event) {
    this.conditionkey = event;
    if (event.value === 'Not Null' || event.value === 'Null') {
      this.comparisonField = false;
    } else {
      this.comparisonField = true;
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
    this.eservice.getDMOList('LMKCRMEContractsRecords', 'EContract')
      .subscribe(
        data => {
          this.ColumnList = data;
          if(!!this.ColumnList){
            this.ColumnList.forEach(x => {
              this.ColumnListForDDL.push({
                'TextField': x.DisplayName,
                'ValueField': x,
                DMOG: x.DataModelObjectGroup == undefined ? 'Miscellaneous' : x.DataModelObjectGroup['Name']
              })
            });
          }        
          // this.getstatedata();
        }
      );
  }
  OnDestroy() {
    console.log('Destory');
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

  /*------------------- Stage/State data -------------------*/
  setFilterConditional(FilterType: string) {
    this.stageState = FilterType;
    if (FilterType === 'State') {
      this.getstatedata();
    } else if (FilterType === 'Stage') {
    } else {
      this.getstagedata();
    }
  }

  getGridConfigData() {
    this.gridConfigJson.OldViewName = this.gridConfigJson.ViewName;
    const getGridOptions = {
      ProcessName: 'LMKCRMEContractsRecords',
      GridGuid: this.gridguid,
      ViewName: this.gridConfigJson.ViewName
    };
    this.listviewService.GridConfig(getGridOptions)
      .subscribe(
        data => {
          this.gridListData = JSON.parse(data[0].Config);
          this.disableIsDefaultView = data[0].IsDefaultview;
          if (this.OldViewName !== '') {
            this.setEditViewData(data);
          }
        }
      );
  }

  /*------------------- Get Binding -------------------*/
  setEditViewData(data: any) {
    this.gridConfigJson.SortColumnCaption = JSON.parse(data[0].Config).SortColumnCaption;
    this.gridConfigJson.SortDirectionCaption = JSON.parse(data[0].Config).SortDirectionCaption;
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
  dropState(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.StateFilterList, event.previousIndex, event.currentIndex);
  }


  duplicateView() {
    this.gridConfigJson.OldViewName = this.gridConfigJson.ViewName;
    this.gridConfigJson.ViewName = '';
    this.gridConfigJson.IsDefaultView = false;
  }

  IsEmptyObject(obj: any) {
    return Object.keys(obj).length > 0 ? false : true;

  }

  CallBackMethod(modelRef: NgbModalRef, Caller: ExportEConractConfigComponent) {
    sessionStorage.removeItem('gridPage');
    Caller.objBaseGrid.getGridConfigData(Caller.gridConfigJson.ViewName);
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

  validatePageSize(event: any) {
    var specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Del', 'Delete'];
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    var val = event.target.value + event.key;;
    const regex = '^[0-9]+$';
    if (!val.match(regex)) {
      event.preventDefault();
    }
  }

  getDMOListOnly(colList) {
    return colList.filter(x => x.DataModelObjectGroup)
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

