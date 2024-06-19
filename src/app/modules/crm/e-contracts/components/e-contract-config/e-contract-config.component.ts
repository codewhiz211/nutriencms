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

// import { GridViewComponent } from '../grid-view/grid-view.component';

@Component({
  selector: 'app-e-contract-config',
  templateUrl: './e-contract-config.component.html',
  styleUrls: ['./e-contract-config.component.scss']
})
export class EContractConfigComponent implements OnInit {

  TextboxTypes = [
    {
      key: 'CONTAINS',
      value: 'Contains'
    },
    {
      key: 'DOES_NOT_CONTAIN',
      value: 'Does Not Contain'
    },{
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
    },{
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
  ErrorMessage:any='';
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
    OldViewName:''

  };

  AllAddButton = false;
  filterRecord = [];
  /*------------------- Get Grid Data -------------------*/
  gridListData;
  disableIsDefaultView;

  ngOnInit() {
    // this.ProcessName = 'LMKOpportunities';
    this.getdmodata();
    // this.columnFilter.GetFilterByDataType();
    // this.getstagedata();
    // this.getstatedata();
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
    if (event.value === 'Not Null' || event.value === 'Null'){
      this.comparisonField = false;
    } else {
      this.comparisonField = true;
    }
  }

   /*------------------- Get Stage Data -------------------*/
   getstagedata() {
    this.listviewService.stageList(this.ProcessName).subscribe(
      data => {
        if(data){
          this.StageList = data;
          const distinctStage = this.StageList.filter(
            (key, i, arr) => arr.findIndex(t => t.DisplayName === key.DisplayName) === i
          );
          this.StageList = distinctStage;
        }       
      });
  }

  /*------------------- Get State Data -------------------*/
  getstatedata() {
    this.listviewService.stateList(this.ProcessName)
      .subscribe(
        data => {
          if(data){
            this.StateList = data;
            const distinctState = this.StateList.filter(
              (key, i, arr) => arr.findIndex(t => t.DisplayName === key.DisplayName) === i
            );
            this.StateList = distinctState;
          }        
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
              this.ColumnListForDDL.push( {
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

  /*------------------- Add Filter Conditions -------------------*/
  onSubmit(val, userForm) {
    if (val) {
      const currCondition = {
        ColumnName: this.customFilter.ColumnName.GUID,
        DataType: this.customFilter.ColumnName.Type,
        ConditionValue: this.customFilter.ConditionValue,
        ColumnDisplayName: this.customFilter.ColumnName.DisplayName,
        ConditionVal: this.conditionkey.value,
        Condition: this.conditionkey.key,
      };
      this.customFilter.Conditions.push(currCondition);
      const filtrName = this.customFilter.FilterName;
      userForm.resetForm();
      userForm.form.controls.filterName.setValue(filtrName);
    }

  }
  /*------------------- Remove Filter Conditions -------------------*/

  deletecDataRow(index) {
    this.customFilter.Conditions.splice(index, 1);
  }
  /*------------------- Save Custom Filter -------------------*/
  saveFilter(fval, filterForm) {
    if (fval) {
      const _filter = {
        FilterName: this.customFilter.FilterName,
        LogicalOperator: this.customFilter.LogicalOperator,
        Conditions: this.customFilter.Conditions
      };
      for (const condRow of _filter.Conditions) {
        if (condRow.DataType && (['DateEditBox', 'DateWithCalendar', 'CreatedDate', 'LastUpdatedDate', 'StaticDateBox'].indexOf(condRow.DataType) > -1)) {
          condRow.ConditionValue = this.convertToSystemDataAndTime(condRow.ConditionValue, 'MM/dd/yyyy HH:mm:ss', 0, condRow.Condition);
        }
        if (condRow.DataType && (['CreatedDateTime', 'LastUpdatedDateTime', 'DateTimeZone', 'CRTDON', 'MODFON', 'DateTimeBox'].indexOf(condRow.DataType) > -1)) {
          condRow.ConditionValue = this.convertToSystemDataAndTime(condRow.ConditionValue, 'MM/dd/yyyy HH:mm:ss', 0, condRow.Condition);
        }
      }
      this.filterRecord = this.comparisionFilter;
      this.customFilter.Conditions = [];
      if (this.customFilter.OldFilterName !== '') {
        delete this.gridConfigJson.CustomFilters[this.customFilter.OldFilterName];
      }
      this.gridConfigJson.CustomFilters[this.customFilter.FilterName] = _filter;
      console.log('filter name', _filter);

      this.filterlength = _filter.Conditions.length;
      console.log('grid filter length', _filter.Conditions.length);
      filterForm.resetForm();
      this.customFilter = {
        OldFilterName: '', FilterName: '', ColumnName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
        Conditions: []
      };
    }
  }

  /*------------------- Delete Custom Filter -------------------*/
  DeleteCustomFilter(customFilterKey: string) {
    delete this.gridConfigJson.CustomFilters[customFilterKey];
    this.customFilter = {
      OldFilterName: '', FilterName: '', ColumnName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
      Conditions: []
    };
  }

  CancelCustomFilter() {
    this.customFilter = {
      OldFilterName: '', FilterName: '', ColumnName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
      Conditions: []
    };
  }

  /*------------------- Edit Custom Filter -------------------*/
  EditCustomFilter(customFilterKey) {
    if (this.showCustomeBar === false) {
      this.showCustomeBar = true;
    }
    this.customFilter = {
      OldFilterName: '', FilterName: '', ColumnName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
      Conditions: []
    };

    this.customFilter.Conditions = JSON.parse(JSON.stringify(customFilterKey.value.Conditions));
    this.customFilter.FilterName = customFilterKey.value.FilterName;
    this.customFilter.OldFilterName = customFilterKey.value.FilterName;
    this.customFilter.LogicalOperator = customFilterKey.value.LogicalOperator;

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

  /*------------------- Add DMO Filter -------------------*/
  AddColumnFilter(column) {
    if (this.GridColumnFilters[column.GUID] === undefined) {
      this.GridColumnFilters[column.GUID] = '1';
      this.GridColumnFilterList.push(column);
      console.log('dmodata', this.gridConfigJson.DMOFilters);
    }
  }
  /*------------------- Delete DMO Filter -------------------*/
  DeleteColumnFilter(column) {
    const txt = this.GridColumnFilterList.indexOf(column);
    if (txt > -1) {
      this.GridColumnFilterList.splice(txt, 1);
    }
    delete this.GridColumnFilters[column.GUID];
  }
  /*------------------- Add All DMO Filter -------------------*/
  AddALLColumnFilter() {
    for (const objColumn of this.ColumnList) {
      if (this.GridColumnFilters[objColumn.GUID] === undefined) {
        this.GridColumnFilters[objColumn.GUID] = '1';
        this.GridColumnFilterList.push(objColumn);
      }
    }
  }
  /*------------------- Delete All DMO Filter -------------------*/
  DeleteAllColumnFilter(column: any) {
    this.GridColumnFilterList = [];
    this.GridColumnFilters = {};
  }


  /*------------------- Add State Filter -------------------*/
  // stateGuid: any = {
  //   guid: ''
  // }
  AddStateFilter(State) {
    if (this.GridStateFilter[State.GUID] === undefined) {
      this.GridStateFilter[State.GUID] = '1';
      this.StateFilterList.push(State);
      //console.log('dmodata', this.gridConfigJson.StateFilters);
    }
  }
  /*------------------- Delete State Filter -------------------*/
  DeleteStateFilter(State) {
    const txt = this.StateFilterList.indexOf(State);
    if (txt > -1) {
      this.StateFilterList.splice(txt, 1);
    }
    delete this.GridStateFilter[State.GUID];
  }

  /*------------------- Add Stage Filter -------------------*/

  AddStageFilter(Stage) {
    if (this.GridStageFilter[Stage.GUID] === undefined) {
      this.GridStageFilter[Stage.GUID] = '1';
      this.StageFilterList.push(Stage);

    }
  }
  DeleteStageFilter(Stage) {
    const stageData = this.StageFilterList.indexOf(Stage);
    if (stageData > -1) {
      this.StageFilterList.splice(stageData, 1);
    }
    delete this.GridStageFilter[Stage.GUID];
  }

  /*------------------- Show Hide Filter -------------------*/
  showCustomBar() {
    this.customFilter = {
      OldFilterName: '', FilterName: '', ColumnName: '', Condition: '', ConditionValue: '', LogicalOperator: '',
      Conditions: []
    };

    if (this.showCustomeBar === false) {
      this.showCustomeBar = true;
    } else {
      this.showCustomeBar = false;
    }
  }

  /*------------------- Set Default View -------------------*/
  setIsDefaultView() {
    this.gridConfigJson.IsDefaultView = !this.gridConfigJson.IsDefaultView;
    console.log('check status', this.gridConfigJson.IsDefaultView);
  }

  /*------------------- Stage/State data -------------------*/
  setFilterConditional(FilterType: string) {
    this.stageState = FilterType;
    if (FilterType === 'State') {
      this.getstatedata();
    } else if (FilterType === 'Stage') {
      // this.listviewService.stageList(this.ProcessName)
      //   .subscribe(
      //     data => {
      //       this.StageList = data;
      //     }
      //   );
    } else {
      this.getstagedata();
    }


  }


  /*------------------- Save Grid Data -------------------*/
  setGridConfigData() {
    const selectedCols = [];
    this.GridColumnList.filter((prop) => {
      const gridCol = { DisplayName: prop.DisplayName, Name: prop.NAME, Type: prop.Type };
      this.gridConfigJson.Columns[prop.GUID] = gridCol;
      selectedCols.push(prop.GUID);
    });
    this.gridConfigJson.DMOFilters = [];
    this.GridColumnFilterList.filter((prop) => {
      const gridColList = { DisplayName: prop.DisplayName, GUID: prop.GUID, Type: prop.Type };
      this.gridConfigJson.DMOFilters.push(gridColList);
    });

    if (this.stageState === 'State') {
      this.gridConfigJson.StateFilters = [];
      this.StateFilterList.filter((prop) => {
        const stateFList = { DisplayName: prop.DisplayName, GUID: prop.GUID };
        this.gridConfigJson.StateFilters.push(stateFList);
      });
      this.gridConfigJson.StageFilters = [];
    } else {
      this.gridConfigJson.StageFilters = [];
      this.StageFilterList.filter((prop) => {
        const stageFList = { DisplayName: prop.DisplayName, GUID: prop.GUID };
        this.gridConfigJson.StageFilters.push(stageFList);
      });
      this.gridConfigJson.StateFilters = [];
    }

    this.gridConfigJson.ColumnList = selectedCols.join(',');
    const GridFinalJson = {
      ProcessName: 'LMKCRMEContractsRecords',
      ContainerID: this.gridguid,
      FinalJson: JSON.stringify(this.gridConfigJson),
      ViewName: this.gridConfigJson.ViewName,
      IsDefaultView: this.gridConfigJson.IsDefaultView,
      OldViewName: this.gridConfigJson.OldViewName
    };
    if (this.GridColumnList.length >= 1 && this.gridConfigJson.ViewName !== '') {
      this.listviewService.sendGridConfig(GridFinalJson)
        .subscribe(
          data => {
            if (data === true) {
              this.msg.showMessage('Success', {
                body: 'Grid configuration saved successfully',
                callback: this.CallBackMethod,
                caller: this,
                isConfirmation: true,
                btnText: 'Ok'
              })
              this.activeModal.close(true);
              this.getGridConfigData();
            }
          }
        );
    } else {
      if (this.gridConfigJson.ViewName == '') {
        this.msg.showMessage('Warning', {body: 'View name required'});
        // this.showErrorMessage('View name required', 'Warning !', null, false, true, false);
      } else {
        this.msg.showMessage('Warning', {body: 'Columns required'});
        // this.showErrorMessage('Columns required', 'Warning !', null, false, true, false);
      }

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
          // this.disableIsDefaultView = this.gridListData.IsDefaultView;
          // set default view 
          this.disableIsDefaultView = data[0].IsDefaultview;
          // if (this.gridListData.StageFilters != undefined && this.gridListData.StageFilters.length == 0 && this.gridListData.StateFilters.length != 0) {
          //             this.stageState = 'State';
          //           } else if (this.gridListData.StateFilters.length == 0 && this.gridListData.StageFilters.length != 0) {
          //             this.stageState = 'Stage';
          //           } else {
          //             this.stageState = 'Stage';
          //           }
          if(this.OldViewName !== ''){
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
      else{
        this.GridColumnFilterList.push(DmoFilterKey);
      }      
    });

    _configData.StateFilters.forEach(objState => {
      this.GridStateFilter[objState.GUID] = '1';
      this.StateFilterList.push(objState);
    });

    // _configData.StageFilters.forEach(objStage => {
    //   this.GridStageFilter[objStage.GUID] = '1';
    //   this.StageFilterList.push(objStage);
    // });

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
    this.gridConfigJson.OldViewName =  this.gridConfigJson.ViewName;
    this.gridConfigJson.ViewName = '';
    this.gridConfigJson.IsDefaultView = false;
  }


  /*------------------- Delete Grid Config Data -------------------*/
  deleteGridConfig() {
    const configGridOptions = {
      ProcessName: 'LMKCRMEContractsRecords',
      GridGuid: this.gridguid,
      ViewName: this.gridConfigJson.ViewName.trim()
    };
    this.listviewService.deleteGridConfigData(configGridOptions)
      .subscribe(
        data => {
          if (data === true) {
            alert('View has been deleted successfully.');
            this.activeModal.close(true);
            this.getGridConfigData();
            window.location.reload();
          }
        }
      );
  }


  IsEmptyObject(obj: any) {
    return Object.keys(obj).length > 0 ? false : true;

  }

  /*------------------- Show Popup -------------------*/
  // showErrorMessage(ErrorMsg: string, header: string, CallBackMethodName, IsConfirmation: boolean, IsDefaultView: boolean,
  //                  IsDelete: boolean) {
  //   const errorPop = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
  //   const modalInstance: MessageComponent = errorPop.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.MessageHeader = header;
  //   modalInstance.MessagePopup = errorPop;

  //   modalInstance.IsConfirmation = IsConfirmation;
  //   modalInstance.CallBackMethod = CallBackMethodName;
  //   modalInstance.Caller = this;
  //   modalInstance.isCancelabel = false;
  //   modalInstance.IsDefaultView = IsDefaultView;
  // }
  CallBackMethod(modelRef: NgbModalRef, Caller: EContractConfigComponent) {
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
  ResetConfig(){
    const model = {
      ContainerID: this.gridguid,
      ViewName: this.gridConfigJson.ViewName,
      ProcessName: 'LMKCRMEContractsRecords'
    }
    this.listviewService.resetGridConfg(model).subscribe(result=> {
      this.activeModal.close(true);
      if(result.status){
        this.msg.showMessage('Success', {
          body: 'Reset Grid configuration successfully',
          isConfirmation: true,
          callback: null,
          caller: this,
          btnText:'OK',
        }).result.then(res=> {
          if(res) {
            this.objBaseGrid.getGridConfigData(this.gridConfigJson.ViewName);
          }
        });
      }
    })
  }
  getDMOListOnly(colList) {
    return colList.filter(x => x.DataModelObjectGroup)
  }
  convertToSystemDataAndTime(value, format, zone, ConditionOption) {
    if (value == null || value === '') {
      return null;
    }
    try 
    {
        let modifiedDateValue;
        let dateArray = value.split("/");
        if (environment.Setting.dateFormat === "dd/MM/yyyy") {
          modifiedDateValue = dateArray[1].toString() + '/' + dateArray[0].toString() + '/' + dateArray[2].toString();
        } else {
           modifiedDateValue = dateArray[0].toString() + '/' + dateArray[1].toString() + '/' + dateArray[2].toString();
        }
        let timeZone;
        if (!zone) {
          timeZone = this.TimeZone;
        } else {
          timeZone = zone;
        }
        const d = new Date(modifiedDateValue);
        const localOffset = timeZone * 60000;         
        if(['GREATER_THAN', 'LESS_THAN_OR_EQUAL'].indexOf(ConditionOption) > -1){
            d.setHours(23,59,59,999);
        }
        else{
            d.setHours(0,0,0,0);
        }             
        //covert to UTC fotmate
        const localTime = d.getTime()+ localOffset;
        d.setTime(localTime);
        return formatDate(d, format, 'en-US');      
    } 
    catch (error) {
      console.log('Datevalue-' + value + 'error' + error);
      return value;
    }
  }
}
