import { Component, OnInit } from '@angular/core';
import { IHeaderMap } from '@app/core/models';
import { ApplicationService } from '@app/core';
import { Route, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
@Component({
  selector: 'app-bulk-log',
  templateUrl: './bulk-log.component.html',
  styleUrls: ['./bulk-log.component.scss']
})
export class BulkLogComponent implements OnInit {
  itemsCount: number;
  FileExtension = '.xlsx';
  filters: any = {};
  processName: any;
  dataSource: any;
  ProcessDispName: any;
  bodyData = {
    ProcessName: '',
    PageSize: 10,
    PageNumber: 1,
    SortColumn: 'CrtdOn',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };

  constructor(private appServie: ApplicationService, private route: ActivatedRoute, private columnFilter: ColumnFilterService, ) {
    this.route.paramMap.subscribe(params => {
      this.processName = params.get('process_name');
      this.bodyData.ProcessName = this.processName;
    })
  }
  
  ngOnInit() {
    let appDispName: any;
    appDispName = localStorage.getItem(this.processName + '~~~DownloadBulkTemp')
    if(appDispName === undefined || appDispName === null){
      appDispName = sessionStorage.getItem('DisplayName')
    }
    // if (sessionStorage.getItem('DisplayName')) {
    //   this.ProcessDispName = sessionStorage.getItem('DisplayName');
    // }
    this.ProcessDispName = appDispName;
    this.getBulkLogData(this.bodyData);
  }
  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'FileName',
            displayName: 'File Name',
            width: '25%'
          }, {
            objectKey: 'TotalCount',
            displayName: 'Total Data Count',
            width: '10%'
          }, {
            objectKey: 'SuccessRowsCount',
            displayName: 'Pass Count',
            width: '10%'
          }, {
            objectKey: 'ErrorRowsCount',
            displayName: 'Error Data Count',
            dataType: 'Link',
            width: '15%'
          }, {
            objectKey: 'CreatedBy',
            displayName: 'Uploaded By',
            width: '20%'
          }, {
            objectKey: 'CrtdOn',
            displayName: 'Uploaded On',
            width: '20%'
          }
        ],
        action: {
          Edit: false,
          Delete: false,
          Checkbox: false
        },
        columnFilter: []
      },
      paging: true
    }
  };

  getBulkLogData(bodyData) {
    this.bodyData.ProcessName = this.processName;
    this.appServie.getBulkLogData(bodyData).subscribe(data => {
      this.dataSource = data.Data;
      this.itemsCount = data.TotalCount;
      console.table(this.dataSource);
    })
  }
  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getBulkLogData(this.bodyData);
  }

  SaveUploadLog(FileData: any, FileName: any) {
    saveAs(FileData, FileName);
  }
  actionClick(event) {
    switch (event.action) {
      case 'Link':
        var FileName = this.dataSource[event.rowIndex].LogFileName;
        if (FileName != null && FileName != undefined && event.rowIndex>0)
          this.appServie.DownloadBulkUploadErrorLog(FileName).subscribe(result => {
            this.SaveUploadLog(result, FileName);
          })
        break;
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        if (!this.validate(event)) {
          break;
        } else {
          let filter: any = {};
          filter = {
            GridConditions: [
            ],
            DataField: event.colData.objectKey,
            LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
            FilterType: 'Column_Filter'
          };
          if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: event.filterData.filterValue1
            });
          }
          if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: event.filterData.filterValue2
            });
          }
          if (filter && Object.keys(filter).length !== 0) {
            this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
          }
          this.bodyData.GridFilters = [];
          Object.keys(this.filters).forEach(key => {
            this.bodyData.GridFilters.push(this.filters[key]);
          });

          this.getBulkLogData(this.bodyData);
          event.ColumnFilterDropdown.close();
          break;
        }
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        this.getBulkLogData(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        console.log(this.bodyData);
        this.getBulkLogData(this.bodyData);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
    }
  }
  private generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    this.getBulkLogData(this.bodyData);
  }
  validate(event): boolean {

    if (event.filterData.ConditionOpt1 && (event.filterData.ConditionOpt1.Value === '' ||
      event.filterData.ConditionOpt1.Value === 'Select...')) {
      return false;
    } else if (event.filterData.filterValue1 && event.filterData.filterValue1.Value === '') {
      return false;
    } else {
      return true;
    }
  }
  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
      // if (!this.ColumnData[item.datafield]) {
      //   this.showItemLoading = false;
      //   this.listviewService.DMOData(this.ProcessName, item.datafield).subscribe(
      //     data => {
      //       this.ColumnData[item.datafield] = data;
      //       this.showItemLoading = true;
      //     });
      // }
    } else {
      const key = Object.keys(item.colData)[0];
      this.HeaderMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }

}

