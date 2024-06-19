import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { NgbDateFRParserFormatter } from '@app/core/services/ngb-date-fr-parser-formatter';
import { environment } from '@env/environment';
import { TableRowState } from '@app/core/models/table-row-state.model';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'generic-grid',
  templateUrl: './generic-grid.component.html',
  providers: [{
    provide: NgbDateParserFormatter,
    useClass: NgbDateFRParserFormatter
  }],
  styleUrls: ['./generic-grid.component.scss']
})
export class GenericGridComponent {

  dateTimeFormat;
  dateFormat;
  selectedAll = false;
  defaultCollaps: any = '';
  currentPage = 1;
  itemsPerPage: number;
  pageStatus: any = {};
  currentKey: string;
  checkList: any[] = [];
  colLenght: number;
  sortType: string;
  tolTip: string;
  TimeZone = this.userDetail.TimeZone.toString();
  dateTimeFormatNoSeconds; //MD Changes - #444 & CRM #961 

  @Input() pageNum = -1;
  @Input() headerMap: IHeaderMap;
  @Input() pageSizeOptions: number[] = [10, 20, 30, 40, 50, 100];
  @Input() Change_Log = false;
  @Input() sNo = false;
  @Input() tableName = 'plasmaTable';
  @Input() gotoName = 'goto';

  @Input() pageSizeOptionsName = 'pageSizeOptions';
  @Input() nextName = 'next';
  @Input() prevName = 'previous';

  @Input() dataSource: any;
  @Input() itemsCount: number;
  @Input() isExport: any;
  @Input() filterValue1: string;
  @Input() filterValue2: string;
  @Input() ConditionOpt1: string;
  @Input() ConditionOpt2: string;
  @Input() logicalOpt: string;
  @Input() FromDateobj: NgbDateStruct;
  @Input() ToDateobj: NgbDateStruct;
  @Input() BuyerAccessRole = true;
  @Input() rowState: TableRowState = {
    success: {
      property: '',
      values: []
    },
    fail: {
      property: '',
      values: []
    },
  };

  @Output() pageChange = new EventEmitter < any > ();
  @Output() actionClick = new EventEmitter < any > ();
  @Output() rowClick = new EventEmitter < any > ();


  GridSearchConfig: any = [];
  ConfigColumnsData: {
    colIndex: number,
    ConditionOpt1: string,
    filterValue1: string,
    logicalOpt: string,
    ConditionOpt2: string,
    filterValue2: string,
    activefiltercolindex: number
  };

  elRef: ElementRef;
  isRemoveFilter: boolean = false;

  constructor(
    elRef: ElementRef,
    private userDetail: UserDetail
  ) {
    this.elRef = elRef;
    this.itemsPerPage = 0;
    this.itemsCount = 0;
    this.sortType = 'asc';
    this.dateFormat = environment.Setting.dateFormat;
    this.dateTimeFormat = environment.Setting.dateTimeFormat;
    this.dateTimeFormatNoSeconds = environment.Setting.dateTimeFormatNoSeconds;
  }

  public applyRowStateClass(data: any, status: 'success' | 'fail') {
    return this.rowState[status].values
      .some(value => value === data[this.rowState[status].property])
  }


  nextPage($event, dmog?: any) {
    if (!!dmog) {
      this.defaultCollaps = dmog;
    }
    if (this.currentPage < this.TotalPage) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
    }
    this.pageChange.emit(this.getPageStatus());
  }

  previousPage($event, dmog ? : any) {
    if (!!dmog) {
      this.defaultCollaps = dmog;
    }
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
    } else {
      this.currentPage = this.TotalPage;
    }
    this.pageChange.emit(this.getPageStatus());
  }

  pageChangeClick(item) {
    this.itemsPerPage = item;
    this.currentPage = 1;
    this.pageChange.emit(this.getPageStatus());
  }

  goToPage(pageselected: number) {
    if (pageselected <= this.TotalPage) {
      this.currentPage = parseInt(pageselected.toString());
      this.pageChange.emit(this.getPageStatus());
    }
  }

  onRowClick(rowind, data) {
    data.index = rowind;
    this.rowClick.emit(data);
  }

  onAction(index, act, ColumnFilter ? : any) {
    const data = {
      rowIndex: index,
      action: act,
      ColumnFilterDropdown: ColumnFilter
    };
    this.actionClick.emit(data);
  }

  bindColumnFilterDdl(colInd, frmVal) {
    //For reset Filter Form
    if (this.isRemoveFilter === true) {
      frmVal.reset();
    } else {
      frmVal.submitted = false;
    }
    const data = {
      colIndex: colInd,
      action: 'Filter_Header',
      colData: this.headerMap.config.header.columns[colInd],
      ConditionOpt1: '',
      ConditionOpt2: ''
    };

    // check sesson storage
    if (sessionStorage.getItem('storage_GridSearchConfig')) {
      this.GridSearchConfig = JSON.parse(sessionStorage.getItem('storage_GridSearchConfig'));
    }

    if (this.GridSearchConfig.filter(d => d.colIndex === colInd).length > 0) {
      const index = this.GridSearchConfig.map(item => item.colIndex).indexOf(colInd);
      this.ConfigColumnsData = this.GridSearchConfig[index];
      frmVal.ConditionOpt1.value = frmVal.ConditionOpt1.value === '' ? this.ConfigColumnsData.ConditionOpt1 : frmVal.ConditionOpt1.value;
      frmVal.ConditionOpt2.value = frmVal.ConditionOpt2.value === '' ? this.ConfigColumnsData.ConditionOpt2 : frmVal.ConditionOpt2.value;
      frmVal.logicalOpt.value = frmVal.logicalOpt.value === '' ? this.ConfigColumnsData.logicalOpt : frmVal.logicalOpt.value;
      frmVal.filterValue1.value = frmVal.filterValue1.value === '' ? this.ConfigColumnsData.filterValue1 : frmVal.filterValue1.value;
      frmVal.filterValue2.value = frmVal.filterValue2.value === '' ? this.ConfigColumnsData.filterValue2 : frmVal.filterValue2.value;

      this.ConfigColumnsData = {
        colIndex: colInd,
        ConditionOpt1: frmVal.ConditionOpt1.value,
        filterValue1: frmVal.filterValue1.value,
        logicalOpt: frmVal.logicalOpt.value,
        ConditionOpt2: frmVal.ConditionOpt2.value,
        filterValue2: frmVal.filterValue2.value,
        activefiltercolindex: -1
      };

      this.GridSearchConfig[index] = this.ConfigColumnsData;
    } else {
      if (data.colData.dataType === 'Date' || data.colData.dataType === 'Currency') {
        frmVal.ConditionOpt1.value = 'GREATER_THAN';
        frmVal.ConditionOpt2.value = 'GREATER_THAN';
      } else {
        frmVal.ConditionOpt1.value = 'CONTAINS';
        frmVal.ConditionOpt2.value = 'CONTAINS';
      }

      frmVal.filterValue1.value = '';
      frmVal.filterValue2.value = '';

      this.ConfigColumnsData = {
        colIndex: colInd,
        ConditionOpt1: frmVal.ConditionOpt1.value,
        filterValue1: frmVal.filterValue1.value,
        logicalOpt: frmVal.logicalOpt.value,
        ConditionOpt2: frmVal.ConditionOpt2.value,
        filterValue2: frmVal.filterValue2.value,
        activefiltercolindex: -1
      };

      this.GridSearchConfig.push(this.ConfigColumnsData);
    }

    this.actionClick.emit(data);
  }

  SetGridSearchConfig(colInd, frmVal, dataType) {
    if (dataType === 'Date' || dataType === 'Currency') {
      frmVal.ConditionOpt1.value = frmVal.ConditionOpt1.value === '' ? 'GREATER_THAN' : frmVal.ConditionOpt1.value;
      frmVal.ConditionOpt2.value = frmVal.ConditionOpt2.value === '' ? 'GREATER_THAN' : frmVal.ConditionOpt2.value;
    } else {
      frmVal.ConditionOpt1.value = frmVal.ConditionOpt1.value === '' ? 'CONTAINS' : frmVal.ConditionOpt1.value;
      frmVal.ConditionOpt2.value = frmVal.ConditionOpt2.value === '' ? 'CONTAINS' : frmVal.ConditionOpt2.value;
    }

    this.ConfigColumnsData = {
      colIndex: colInd,
      ConditionOpt1: frmVal.ConditionOpt1.value,
      filterValue1: frmVal.filterValue1.value,
      logicalOpt: frmVal.logicalOpt.value,
      ConditionOpt2: frmVal.ConditionOpt2.value,
      filterValue2: frmVal.filterValue2.value,
      activefiltercolindex: -1
    };

    if (this.GridSearchConfig.filter(d => d.colIndex === colInd).length > 0) {
      const index = this.GridSearchConfig.map(item => item.colIndex).indexOf(colInd);
      this.GridSearchConfig[index] = this.ConfigColumnsData;
    } else {
      this.GridSearchConfig.push(this.ConfigColumnsData);
    }
  }

  onFilterClick(colInd, frmVal, actiontype, ColumnFilter) {
    const data = {
      colIndex: colInd,
      action: actiontype,
      colData: this.headerMap.config.header.columns[colInd],
      filterData: {
        filterValue1: '',
        filterValue2: '',
        ConditionOpt1: {},
        ConditionOpt2: {},
        logicalOpt: {},
      },
      ColumnFilterDropdown: ColumnFilter
    };

    if (this.headerMap.config.header.columns[colInd].Filed === 'Checkbox') {
      const SelectedRecordIds: Array < string > = [];
      for (const chkbox of frmVal.filterValue1) {
        if (chkbox.checked === true) {
          SelectedRecordIds.push(chkbox.value);
        }
      }
      data.filterData.filterValue1 = SelectedRecordIds.join(',');
    } else {
      if (frmVal.filterValue1 && frmVal.filterValue1.value !== '') {
        let val1 = frmVal.filterValue1.value;
        if (this.headerMap.config.header.columns[colInd].dataType === 'Date') {
          val1 = this.convertToSystemDataAndTime(val1, 'yyyy-MM-dd HH:mm:ss', 0, frmVal.ConditionOpt1.value);
        }
        data.filterData.filterValue1 = val1;
      }

      if (frmVal.filterValue2 && frmVal.filterValue2.value !== '') {
        let val2 = frmVal.filterValue2.value;
        if (this.headerMap.config.header.columns[colInd].dataType === 'Date') {
          val2 = this.convertToSystemDataAndTime(val2, 'yyyy-MM-dd HH:mm:ss', 0, frmVal.ConditionOpt2.value);
        }
        data.filterData.filterValue2 = val2;
      }

      data.filterData.ConditionOpt1 = {
        Text: frmVal.ConditionOpt1.selectedOptions[0] ? frmVal.ConditionOpt1.selectedOptions[0].innerText : '',
        Value: frmVal.ConditionOpt1.value
      };
      data.filterData.ConditionOpt2 = {
        Text: frmVal.ConditionOpt2.selectedOptions[0] ? frmVal.ConditionOpt2.selectedOptions[0].innerText : '',
        Value: frmVal.ConditionOpt2.value
      };
      data.filterData.logicalOpt = {
        Text: frmVal.logicalOpt.selectedOptions[0] ? frmVal.logicalOpt.selectedOptions[0].innerText : '',
        Value: frmVal.logicalOpt.value
      };
    }

    if (actiontype === 'FilterClear_Click') {
      frmVal.filterValue1.value = '';
      frmVal.filterValue2.value = '';
      frmVal.ConditionOpt2.value = '';
      frmVal.ConditionOpt1.value = '';
      frmVal.logicalOpt.value = '';
    }
    this.SetGridSearchConfig(colInd, frmVal, data.colData.dataType);

    if (this.validate(data)) {
      this.currentPage = 1;
      this.getPageStatus();
      sessionStorage.setItem('storage_GridSearchConfig', JSON.stringify(this.GridSearchConfig));
      this.actionClick.emit(data);
    }
  }

  OnRemoveFilterClick() {
    this.GridSearchConfig = [];
    if (sessionStorage.getItem("storage_GridSearchConfig")) {
      sessionStorage.removeItem("storage_GridSearchConfig");
      this.isRemoveFilter = true;
    }
  }

  addChange(act, i) {
    if (act.checked) {
      this.checkList.push(i);
    } else {
      this.checkList = this.checkList.filter(x => x !== i);
    }
  }

  selectAllCheckBox() {
    if (this.selectedAll) {
      for (const i of this.dataSource) {
        i.selected = true;
      }
    } else {
      for (const i of this.dataSource) {
        i.selected = false;
      }
    }

  }
  checkIfAllSelected() {
    this.selectedAll = this.dataSource.every(chkItem => {
      return chkItem.selected === true;
    });
  }
  getKey(obj) {
    const keys = Object.keys(obj);
    this.currentKey = keys[0];
    return keys[0];
  }
  //#endregion

  //#region Private functions

  private getPageStatus(): any {
    this.pageStatus.pageSize = (this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[0]);
    this.pageStatus.currentPage = this.currentPage;
    this.pageStatus.tableName = this.tableName;
    return this.pageStatus;
  }

  public getColorName(key, index): string {
    if (key.Color) {
      if (key.CompareWith) {
        if (key.Condition === 'equal') {
          if (key.CompareWith === this.dataSource[index][key.objectKey]) {
            return key.Color;
          }
        } else if (key.Condition === 'notEqual') {
          if (key.CompareWith !== this.dataSource[index][key.objectKey]) {
            return key.Color;
          }
        } else if (key.Condition === 'contains') {
          if (this.dataSource[index][key.objectKey].includes(key.CompareWith)) {
            return key.Color;
          }
        }
      } else if (key.CompareColumn) {

        if (key.Condition === 'equal') {
          if (this.dataSource[index][key.CompareColumn] === key.CompareValue) {
            return key.Color;
          }
        } else if (key.Condition === 'notEqual') {
          if (this.dataSource[index][key.CompareColumn] !== key.CompareValue) {
            return key.Color;
          }
        }
      } else {
        return key.Color;
      }
    }
  }
  public textSeprator(data, separator) {
    if (data) {
      const ar = data.split(separator);
      if (ar.length > 1) {
        return ar[0] + ',...';
      }
      return data;
    }
  }
  public textSepratorHover(data, separator) {
    if (data) {
      const ar = data.split(separator);
      if (ar.length > 1) {
        this.tolTip = ar.join('\n');
        return ar.join('<br>');
      }
      return data;
    }
  }
  //#endregion

  //#region Properties

  get last(): number {
    const l = ((this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[0]) * this.currentPage);
    if (l > this.itemsCount) {
      return this.itemsCount;
    } else {
      return l;
    }
  }

  get first(): number {
    if (this.pageNum > 0) {
      this.currentPage = 1;
      this.getPageStatus();
    }
    this.pageNum = -1;
    return (this.currentPage - 1) * (this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[0]) + 1;
  }
  get TotalPage(): number {
    return Math.ceil(this.itemsCount / (this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[0]));
  }
  get colSpan(): number {
    this.colLenght = Object.keys(this.headerMap.config.header.columns).length;
    if (this.sNo === true) {
      this.colLenght = this.colLenght + 1;
    }
    const cols = Object.keys(this.headerMap.config.header.action);
    if (cols.filter(x => x === 'Checkbox').length > 0) {
      this.colLenght = this.colLenght + 1;
    }
    if (cols.filter(x => x === 'Edit' || x === 'Delete').length > 0) {
      this.colLenght = this.colLenght + 1;
    }
    return this.colLenght;
  }

  get actionWidth(): number {
    let wdth = 30;
    const cols = Object.keys(this.headerMap.config.header.action);
    if (this.headerMap.config.header.action['Edit'] === true) {
      wdth = wdth + 10;
    }
    if (this.headerMap.config.header.action['Delete'] === true) {
      wdth = wdth + 10;
    }
    if (this.headerMap.config.header.action['Copy'] === true) {
      wdth = wdth + 10;
    }
    return wdth;
  }
  //#endregion

  sort(index, type, ColumnFilter) {
    let data = {};
    data = {
      colIndex: index,
      action: type,
      colData: this.headerMap.config.header.columns[index],
      ColumnFilterDropdown: ColumnFilter
    };
    this.sortType = type === 'asc' ? 'desc' : 'asc';
    this.actionClick.emit(data);
  }

  convertToLocalDataAndTime(value, format, zone, DmoType) {
    try {
      if (value != '') {
        const d = new Date(value); // val is in UTC
        if (DmoType === 'StaticDateBox') {
          return formatDate(d, format, 'en-US');
        } else {

          const localOffset = zone * 60000;
          const localTime = d.getTime() - localOffset;
          d.setTime(localTime);
          return formatDate(d, format, 'en-US');
        }
      }

    } catch (error) {
      console.log('Datevalue-' + value + 'error' + error);
      return '';
    }
  }

  validate(event): boolean {

    if (event.filterData.ConditionOpt1 && (event.filterData.ConditionOpt1.Value === '' || event.filterData.ConditionOpt1.Value === 'Select...')) {
      return false;
    } else if (event.filterData.filterValue1 === '' || event.filterData.filterValue1 == null) {
      return false;
    } else {
      return true;
    }
  }

  convertToSystemDataAndTime(value, format, zone, ConditionOption) {
    if (value == null || value === '') {
      return null;
    }
    try {
      let modifiedDateValue;
      let dateArray = value.split("/");
      if (environment.Setting.dateFormat === "dd/MM/yyyy") {
        modifiedDateValue = dateArray[1].toString() + '/' + dateArray[0].toString() + '/' + dateArray[2].toString();
      } else {
        modifiedDateValue = dateArray[0].toString() + '/' + dateArray[1].toString() + '/' + dateArray[2].toString();
      }
      let timeZone;
      if (!zone) {
        timeZone = this.userDetail.TimeZone.toString();
      } else {
        timeZone = zone;
      }
      const d = new Date(modifiedDateValue); // val is in UTC
      const localOffset = timeZone * 60000;

      if (['GREATER_THAN', 'LESS_THAN_OR_EQUAL'].indexOf(ConditionOption) > -1) {
        d.setHours(23, 59, 59, 999);
      } else {
        d.setHours(0, 0, 0, 0);
      }

      const localTime = d.getTime() + localOffset;
      d.setTime(localTime);
      return formatDate(d, format, 'en-US');
    } catch (error) {
      console.log('Datevalue-' + value + 'error' + error);
      return '';
    }
  }  
//MD Changes - #444 & CRM #961 
  convertToUTCDataAndTime(value, format) {
    try {
      if (value != '') {
        const d = new Date(value); // val is in UTC
        const zone = this.userDetail.TimeZone;
        const localOffset = zone * 60000;
        const localTime = d.getTime() - localOffset;
        d.setTime(localTime);
        return formatDate(d, format, 'en-US');
      }

    } catch (error) {
      console.log('Datevalue-' + value + 'error' + error);
      return '';
    }
  }
  // MD Internal Tickets - #1081
  public isDate(value: string) {
    const regex = /([0-9]){1,2}\/([0-9]{2})\/([0-9]){4}/;
    return value.match(regex);
  }

  addCommaSeparator(val:any){    
    if(!!val && val.includes('|')){      
      const value = val.split('|');
      let list = '';
      value.forEach((el) => {
        list = list+ el+ ',';
      });
      return list.replace(/,\s*$/, "");
    }
    return val;
  }
}
