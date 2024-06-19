import { Component, OnInit, Inject, LOCALE_ID, ViewChild, Output, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import { saveAs } from 'file-saver';

import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';
import { WoolSearchService } from '../../wool-search.service';

import { CustomizedGridComponent } from '@app/shared';

@Component({
  selector: 'app-unsold-wool',
  templateUrl: './unsold-wool.component.html',
  styleUrls: ['./unsold-wool.component.scss']
})
export class UnsoldWoolComponent implements OnInit {

  @ViewChild(CustomizedGridComponent)
  private gridView: CustomizedGridComponent;

  @Output() openBaleDetailModal = new EventEmitter<any>();

  dataSource: any = [];
  itemsCount: number;
  pageIndex:number=1;
  bodyData = {
    PageSize: 20,
    PageNumber: 1,
    SortColumn: 'Id',
    SortOrder: 'desc',
    GridFilters: []
  };
  filters: any = {};

  headerMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'LMK_TradingName',
            displayName: 'Customer Name1',
            width: '120px'
          },
          {
            objectKey: 'LMK_TradingName2',
            displayName: 'Customer Name2',
            width: '120px'
          },
          {
            objectKey: 'CL_AccNo',
            displayName: 'Client Account',
            width: '120px'
          },
          {
            objectKey: 'CL_WoolNumber',
            displayName: 'Wool Number',
            width: '100px'
          },
          {
            objectKey: 'EN_SD_Season',
            displayName: 'Sale Season',
            width: '100px'
          },
          {
            objectKey: 'EN_SD_SellingCentre',
            displayName: 'Sale Nbr Selling Cntr',
            width: '140px'
          },
          {
            objectKey: 'EN_SD_Number',
            displayName: 'Sale Number Id',
            width: '120px'
          },
          {
            objectKey: 'EN_SD_StorageCentre',
            displayName: 'Sale Nbr Storage Cntr',
            width: '150px'
          },
          {
            objectKey: 'EN_LotNumber',
            displayName: 'Lot Number',
            width: '100px'
          },
          {
            objectKey: 'CL_ClipBrand',
            displayName: 'Brand',
            width: '100px'
          },
          {
            objectKey: 'SR_BaleDescription',
            displayName: 'Standard Bale Desc',
            width: '140px'
          },
          {
            objectKey: 'SR_Folio_Bales',
            displayName: 'Folio Bales',
            dataType: 'Link',
            width: '100px'
          },
          {
            objectKey: 'SR_Folio_GrossWeight',
            displayName: 'Folio Gross Weight',
            width: '140px'
          },
          {
            objectKey: 'SR_Folio_TareWeight',
            displayName: 'Folio Tare Weight',
            width: '140px'
          },
          {
            objectKey: 'Rehandlecount',
            displayName: 'Rehandle Bales',
            dataType: 'Link',
            width: '120px'
          },
          {
            objectKey: 'LMK_Region',
            displayName: 'Region',
            width: '100px'
          },
          {
            objectKey: 'LMK_Division',
            displayName: 'Division',
            width: '100px'
          },
          {
            objectKey: 'LMK_BranchName',
            displayName: 'Branch',
            width: '100px'
          },
          {
            objectKey: 'LMK_WAM',
            displayName: 'WAM',
            width: '80px'
          },
          {
            objectKey: 'LMK_Agent',
            displayName: 'Agent',
            width: '80px'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };

  constructor(
    private columnFilter: ColumnFilterService,
    private woolSearchService: WoolSearchService,
    private apiESaleyardService: ApiESaleyardService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit() {
  }

  transformDate(date) {
    try{
      const dates = date.split('/');
      const newDate = dates[2]+'-'+dates[1]+'-'+dates[0];
      return formatDate(newDate, 'yyyy-MM-dd', this.locale);
      }
      catch(error){
        return  formatDate(date, 'yyyy-MM-dd', this.locale);
      }
  }

  async generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    await this.getDataSource(this.bodyData);
    this.gridView.currentPage = 1;
  }

  async getDataSource(params: any) {
    const response: any = await this.woolSearchService.getUnSoldLottedWoolData(params).toPromise();
    this.dataSource = response.Data;
    this.itemsCount = response.RecordsCount;
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getDataSource(this.bodyData);
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


  actionClick(event: any) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        this.bodyData.PageNumber = 1;
        let filter: any = {};
        filter = {
          GridConditions: [],
          DataField: event.colData.objectKey,
          LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
          FilterType: 'Column_Filter'
        };
        if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
          if (event.colData.dataType === 'Date') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: this.transformDate(event.filterData.filterValue1)
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: event.filterData.filterValue1
            });
            //Entities related Code Start-Nidhi
            if(event.filterData.filterValue1 === 'NULL'){
              filter.GridConditions.push({
                  Condition: 'EMPTY',
                  ConditionValue: 'EMPTY'                 
              });
          }
          if(event.filterData.filterValue1 === 'NOT_NULL'){
              filter.GridConditions.push({
                  Condition: 'NOT_EMPTY',
                  ConditionValue: 'NOT_EMPTY'
              });
          }
          //Entities related Code End-Nidhi
        }
        }
        if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
          if (event.colData.dataType === 'Date') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: this.transformDate(event.filterData.filterValue2)
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
        this.getDataSource(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        this.getDataSource(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.getDataSource(this.bodyData);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'Link':
        if (event.objectKey === 'SR_Folio_Bales') {
          this.openBaleDetailModal.emit({
            baleId: this.dataSource[event.rowIndex].SD_FolioUniqueId,
            isUnsoldBale: true
          });
        } else if (event.objectKey === 'Rehandlecount') {
          this.openBaleDetailModal.emit({
            ClientAccountNumber: this.dataSource[event.rowIndex].CL_AccNo,
            SaleSeason: this.dataSource[event.rowIndex].EN_SD_Season,
            SaleNbrSellingCntr: this.dataSource[event.rowIndex].EN_SD_SellingCentre,
            SaleNumberId: this.dataSource[event.rowIndex].EN_SD_Number,
            SaleNbrStorageCntr: this.dataSource[event.rowIndex].EN_SD_StorageCentre
          });
        }
        break;
    }
  }

  saveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    fileName = sessionStorage.AppName
        + '_' + 'UnsoldWool'
        + '_' + (curDate.getMonth() + 1).toString()
        + '_' + curDate.getDate()
        + '_' + curDate.getFullYear()
        + '_' + curDate.getHours()
        + '_' + curDate.getMinutes()
        + '_' + curDate.getSeconds()
        + '.xlsx';
    saveAs(FileData, fileName);
  }

  getExcelData() {
    const bodyData = {
      PageSize: -1,
      PageNumber: -1,
      SortColumn: 'Id',
      SortOrder: 'desc',
      GridFilters: []
    };
    Object.keys(this.filters).forEach(key => {
      bodyData.GridFilters.push(this.filters[key]);
    });
    this.apiESaleyardService.postGetFile('awhwool/ExportToExcelUnSoldWool', bodyData, 'blob')
      .subscribe(
        (resultBlob: Blob) => {
          this.saveExportFile(resultBlob);
        }
      );
  }

}
