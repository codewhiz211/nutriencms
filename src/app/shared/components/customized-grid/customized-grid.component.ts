import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { formatDate } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { NgbDateFRParserFormatter } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-customized-grid',
  templateUrl: './customized-grid.component.html',
  styleUrls: ['./customized-grid.component.scss'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class CustomizedGridComponent implements OnInit {

  dateFormat;
  selectedAll = false;
  //#region Variables

  currentPage = 1;
  itemsPerPage: number;
  pageStatus: any = {};
  currentKey: string;
  checkList: any[] = [];
  colLenght: number;
  sortType: string;
  tolTip: string;
  // first: number;
  // last: number;

  //#endregion

  //#region Input Variable
  @Input()
  headerMap: IHeaderMap;
  @Input()
  pageSizeOptions: number[] = [10, 20, 30, 40, 50, 100];

  @Input()
  sNo = false;
  @Input()
  tableCss = false;
  @Input()
  tableName = 'plasmaTable';
  @Input()
  gotoName = 'goto';

  @Input()
  pageSizeOptionsName = 'pageSizeOptions';

  @Input()
  nextName = 'next';

  @Input()
  prevName = 'previous';

  @Input()
  dataSource: any;

  @Input()
  itemsCount: number;

  @Output()
  pageChange = new EventEmitter<any>();

  @Output()
  actionClick = new EventEmitter<any>();

  @Output()
  rowClick = new EventEmitter<any>();

  @Input()
  pageIndex:number = 0;

  //#endregion

  elRef: ElementRef;
  pageX: any;
  curCol: any;
  curColWidth: any;

  constructor(
    elRef: ElementRef
  ) {
    this.elRef = elRef;
    this.itemsPerPage = 0;
    this.itemsCount = 0;
    this.sortType = 'asc';
    this.dateFormat = environment.Setting.dateFormat;
  }

  ngOnInit() {
    const el = this.elRef.nativeElement.querySelector('#tableHeadRow');
    el.addEventListener('mousemove', (event: any) => {this.mouseMove(event); });

    window.addEventListener('mouseup', (event: any) => {this.mouseUp(event); });
  }


  nextPage($event) {
    const TotalPage = this.TotalPage;
    if (this.currentPage < TotalPage) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
    }
    this.pageChange.emit(this.getPageStatus());
  }
  previousPage($event) {
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
  onAction(index, act, ColumnFilter?: any) {
    const data = {
      rowIndex: index,
      action: act,
      ColumnFilterDropdown: ColumnFilter
    };
    this.actionClick.emit(data);
  }
  onLinkAction(rowIndex: number, objectKey: string) {
    const data = {
      rowIndex,
      action: 'Link',
      objectKey
    };
    this.actionClick.emit(data);
  }
  bindColumnFilterDdl(colInd) {
    const data = {
      colIndex: colInd,
      action: 'Filter_Header',
      colData: this.headerMap.config.header.columns[colInd]
    };
    this.actionClick.emit(data);
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
      const SelectedRecordIds: Array<string> = [];
      for (const chkbox of frmVal.filterValue1) {
        if (chkbox.checked === true) {
          SelectedRecordIds.push(chkbox.value);
        }
      }
      data.filterData.filterValue1 = SelectedRecordIds.join(',');
    } else {
      data.filterData.ConditionOpt1 = {
        Text: frmVal.ConditionOpt1.selectedOptions[0] ? frmVal.ConditionOpt1.selectedOptions[0].innerText : '',
        Value: frmVal.ConditionOpt1.value
      };
      data.filterData.ConditionOpt2 = {
        Text: frmVal.ConditionOpt2.selectedOptions[0] ? frmVal.ConditionOpt2.selectedOptions[0].innerText : '',
        Value: frmVal.ConditionOpt2.value
      };
      data.filterData.filterValue1 = frmVal.filterValue1.value;
      data.filterData.filterValue2 = frmVal.filterValue2.value;
      data.filterData.logicalOpt = {
        Text: frmVal.logicalOpt.selectedOptions[0].innerText,
        Value: frmVal.logicalOpt.value
      };
    }
    if (this.validate(data)) {
      this.currentPage = 1;
      this.getPageStatus();
      this.actionClick.emit(data);
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
    this.pageStatus.pageSize = (this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[this.pageIndex]);
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
    const l = ((this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[this.pageIndex]) * this.currentPage);
    if (l > this.itemsCount) {
      return this.itemsCount;
    } else {
      return l;
    }
  }

  get first(): number {
    return (this.currentPage - 1) * (this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[this.pageIndex]) + 1;
  }
  get TotalPage(): number {
    return Math.ceil(this.itemsCount / (this.itemsPerPage > 0 ? this.itemsPerPage : this.pageSizeOptions[this.pageIndex]));
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
    if (type === 'asc') {
      this.sortType = 'desc';
      data = {
        colIndex: index,
        action: this.sortType,
        colData: this.headerMap.config.header.columns[index],
        ColumnFilterDropdown: ColumnFilter
      };
    } else {
      this.sortType = 'asc';
      data = {
        colIndex: index,
        action: this.sortType,
        colData: this.headerMap.config.header.columns[index],
        ColumnFilterDropdown: ColumnFilter
      };
    }
    this.actionClick.emit(data);
  }
  convertToLocalDataAndTime(value, format, zone) {
    try {
      if (value != '') {
        const d = new Date(value); // val is in UTC
        const localOffset = zone * 60000;
        const localTime = d.getTime() - localOffset;
        d.setTime(localTime);
        return formatDate(d, format, 'en-US');
      }

    } catch (error) {
      return '';
    }
  }
  validate(event): boolean {
    if (event.filterData.ConditionOpt1.Value === 'NOT_NULL' || event.filterData.ConditionOpt1.Value === 'NULL') {
      event.filterData.filterValue1 = event.filterData.ConditionOpt1.Value;
      return true;
    }
    if (event.filterData.ConditionOpt2.Value === 'NOT_NULL' || event.filterData.ConditionOpt2.Value === 'NULL') {
      event.filterData.filterValue1 = event.filterData.ConditionOpt2.Value;
      return true;
    }
    if (event.filterData.ConditionOpt1 && (event.filterData.ConditionOpt1.Value === '' ||
      event.filterData.ConditionOpt1.Value === 'Select...')) {
      return false;
    } else if (event.filterData.filterValue1 === '') {
      return false;
    } else {
      return true;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(this.headerMap.config.header.columns, event.previousIndex, event.currentIndex);
    }
  }

  mouseMove(e) {
    if (this.curCol) {
      const diffX = e.pageX - this.pageX;
      this.curCol.style.minWidth = (this.curColWidth + diffX) + 'px';
    }

  }

  mouseDown(e) {
    this.curCol = e.target.parentElement.parentElement;
    this.pageX = e.pageX;
    this.curColWidth = this.curCol.offsetWidth;
  }

  mouseUp(event) {
    this.curCol = undefined;
    this.pageX = undefined;
    this.curColWidth = undefined;
}

}
