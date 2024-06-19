import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ColumnFilterService, IHeaderMap } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';
import { ApiLmkService } from '@app/core/services/api-lmk.service';
import { CustomizedGridComponent } from '@app/shared';
import { environment } from '@env/environment';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-download-agencyglxml',
  templateUrl: './download-agencyglxml.component.html',
  styleUrls: ['./download-agencyglxml.component.scss']
})
export class DownloadAgencyglxmlComponent implements OnInit {
 
  @ViewChild(CustomizedGridComponent, { static: false })
  private gridView: CustomizedGridComponent;

  searchForm: FormGroup;
  submitted = false;
  showSearchForm = false;
  isSearched = false;
  globalSearchValue = '';
  pageIndex:number=1;
  

  headerMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'DocumentNumber',
            displayName: 'Document Number',
            dataType: 'Link',
            width: '14%'
          },
          {
            objectKey: 'AgencyNumber',
            displayName: 'Agency Number',
            dataType: 'Link',
            width: '14%'
          },
          {
            objectKey: 'Action',
            displayName: 'Action',
            width: '14%'
          },
          {
            objectKey: 'CRTDON',
            displayName: 'Created On',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '14%'
          },
          {
            objectKey: 'IsProcessed',
            displayName: 'Is Processed',
            width: '14%'
          },
          {
            objectKey: 'Response',
            displayName: 'Response',
            width: '16%'
          },
          {
            objectKey: 'DocumentNumber',
            displayName: 'View',
            dataType: 'LinkWithSpecialChar',
            SpecialChar: 'Download',
            width: '14%'
          }
        ],
        action: {
        },
        columnFilter: {}
      },
      paging: true
    }
  };
  dataSource: any = [];
  itemsCount: number;
  bodyData = {
    PageSize: 20,
    PageNumber: 1,
    SortColumn: 'ID',
    SortOrder: 'desc',
    GridFilters: []
  };
  filters: any = {};

  constructor(private api: ApiLmkService, 
    private columnFilter: ColumnFilterService, 
    private userDetail: UserDetail,
    @Inject(LOCALE_ID) private locale: string) { }

  ngOnInit() {
    this.search();
  }
  search() {
    this.submitted = true;
    this.isSearched = true;
    let global_filter = null;
    if (this.globalSearchValue === '') {
      delete this.filters['Global_Search~$~dmoName'];
    } else {
      global_filter = {
        GridConditions: [{
          Condition: 'CONTAINS',
          ConditionValue: this.globalSearchValue
        }
        ],
        DataField: 'dmoName',
        LogicalOperator: 'Or',
        FilterType: 'Global_Search'
      };
    }
    if (global_filter && Object.keys(global_filter).length !== 0) {
      this.filters['Global_Search~$~dmoName'] = global_filter;
    }
    this.generateFilter();
  }
  private async generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    await this.getGLxmlData(this.bodyData);
     this.gridView.currentPage = 1;
  }
  async getGLxmlData(params: any) {
    const response: any = await this.api.post('report/getAgencyGLxmlData',params).toPromise();
    this.dataSource = response.Data;
    this.itemsCount = response.RecordsCount;
  }
  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getGLxmlData(this.bodyData);
  }
  actionClick(event: any) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
        case 'Filter_Click':
          let filter: any = {};
          filter = {
            GridConditions: [],
            DataField: event.colData.objectKey === 'DocumentNumber'?'gl.DocumentNumber':event.colData.objectKey,
            LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
            FilterType: 'Column_Filter'
          };
          if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
            if (event.colData.dataType === 'Date') {
              const d = event.filterData.filterValue1.split('/');
              const finaldate = d[1]+'-'+d[0]+'-'+d[2];
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt1.Value,
                ConditionValue: this.transformDate(finaldate)
              });
            } else {
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt1.Value,
                ConditionValue: event.filterData.filterValue1
              });
            }
          }
          if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
            if (event.colData.dataType === 'Date') {
              const d = event.filterData.filterValue1.split('/');
              const finaldate = d[1]+'-'+d[0]+'-'+d[2];
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt2.Value,
                ConditionValue: this.transformDate(finaldate)
              });
            } else {
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt2.Value,
                ConditionValue: event.filterData.filterValue2
              });
            }
          }
          if (filter && Object.keys(filter).length !== 0) {
            this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
          }
          this.generateFilter();
          event.ColumnFilterDropdown.close();
          break;
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        this.getGLxmlData(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        this.getGLxmlData(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.getGLxmlData(this.bodyData);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
        case 'SpecialCharClick':
          const filename = 'glxml_'+ this.dataSource[event.rowIndex].DocumentNumber + '.xml';
          this.downloadFile(this.dataSource[event.rowIndex].XML, false,filename);
          break;
        case 'Link':
          this.downloadFile(this.dataSource[event.rowIndex].XML, true);
          break;
    }
  }
  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
    } else {
      this.headerMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }
  downloadFile(data: any,isView: boolean,fileName?: string) {
    const blob = new Blob([data], { type: 'xml' });
    if(isView){
      const url= window.URL.createObjectURL(blob);
      window.open(url);
    } else {
      saveAs(blob, fileName);
    }
  }
  onFilterClear(columnName, filterType) {
    if (filterType === 'Global_Search') {
      this.globalSearchValue = '';
    } else if (filterType === 'Column_Filter') {
      const form = this.gridView.elRef.nativeElement.querySelector('#frm_' + columnName);
      if (form.logicalOpt.type === 'hidden') {
          const allInput = form.getElementsByTagName('input');
          for (let i = 0; i < allInput.length; i++) {
              if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                  allInput[i].checked = false;
              }
          }
      } else {
          form.logicalOpt.value = 'Select...';
          form.filterValue1.value = '';
          form.filterValue2.value = '';
          form.ConditionOpt1.value = 'Select...';
          form.ConditionOpt2.value = 'Select...';
      }
    }
    delete this.filters[filterType + '~$~' + columnName];
    this.generateFilter();
  }
  onAdvancedFilterClear(filterKey:any) {    
    delete this.filters[filterKey];
    this.searchForm.get(filterKey.split('Advnaced_Filter~$~')[1]).patchValue(null);
    this.generateFilter();
  }
  
  transformDate(date) {
    return formatDate(date, 'MM/dd/yyyy', this.locale);
  }

  formatDate(date: NgbDateStruct) {
    if (date) {
      return `${date.month}/${date.day}/${date.year}`;
    } else {
      return '';
    }
  }
  
  clear_all() {
    this.filters = {};
    //this.searchForm.reset();
    this.globalSearchValue = '';
    for (const column of this.headerMap.config.header.columns) {
      const form = this.gridView.elRef.nativeElement.querySelector('#frm_' + column.objectKey);
      if (form.logicalOpt.type === 'hidden') {
          const allInput = form.getElementsByTagName('input');
          for (let i = 0; i < allInput.length; i++) {
              if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                  allInput[i].checked = false;
              }
          }
      } else {
          form.logicalOpt.value = 'Select...';
          form.filterValue1.value = '';
          form.filterValue2.value = '';
          form.ConditionOpt1.value = 'Select...';
          form.ConditionOpt2.value = 'Select...';
      }
    }
    this.generateFilter();
  }
}
