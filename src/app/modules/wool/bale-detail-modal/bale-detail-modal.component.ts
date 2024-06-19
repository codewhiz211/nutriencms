import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';
import { CustomizedGridComponent } from '@app/shared';

@Component({
  selector: 'app-bale-detail-modal',
  templateUrl: './bale-detail-modal.component.html',
  styleUrls: ['./bale-detail-modal.component.scss']
})
export class BaleDetailModalComponent implements OnInit {

  @ViewChild(CustomizedGridComponent)
  private gridView: CustomizedGridComponent;

  data: any;

  dataSource: any = [];
  itemsCount: number;
  pageIndex:number=1;
  bodyData = {
    PageSize: 20,
    PageNumber: 1,
    SortColumn: '',
    SortOrder: 'desc',
    GridFilters: []
  };


  filters: any = {};

  headerMap: IHeaderMap;
  soldBaleHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'Lot',
            displayName: 'Lot #'
          },
          {
            objectKey: 'BaleNumber',
            displayName: 'Bale #'
          },
          {
            objectKey: 'Net',
            displayName: 'Net'
          },
          {
            objectKey: 'GrossBaleWeight',
            displayName: 'Gross'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };
  unSoldBaleHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'LotNumber',
            displayName: 'Lot #'
          },
          {
            objectKey: 'BaleNumber',
            displayName: 'Bale #'
          },
          {
            objectKey: 'Net',
            displayName: 'Net'
          },
          {
            objectKey: 'GrossBaleWeight',
            displayName: 'Gross'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };
  rehandleBaleHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'EN_SR_B_Description',
            displayName: 'Description'
          },
          {
            objectKey: 'BaleNumber',
            displayName: 'Bale'
          },
          {
            objectKey: 'Net',
            displayName: 'Net'
          },
          {
            objectKey: 'GrossBaleWeight',
            displayName: 'Gross'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };

  get isUnsoldBale() {
    return this.data && this.data.baleId && this.data.isUnsoldBale;
  }

  get isSoldBale() {
    return this.data && this.data.baleId && !this.data.isUnsoldBale && !this.data.isSoldRehandle;
  }

  get isRehandleBale() {
    return this.data && !this.data.baleId;
  }

  get isSoldRehandle(){
    return this.data && this.data.baleId && !this.data.isUnsoldBale && !this.data.isSoldBale;
  }

  constructor(
    public activeModal: NgbActiveModal,
    private api: ApiESaleyardService,
    private columnFilter: ColumnFilterService
  ) { }

  ngOnInit() {
    if (this.isUnsoldBale) {
      this.bodyData.SortColumn = 'UnSoldBaleID';
      this.headerMap = this.unSoldBaleHeaderMap;
    } else if (this.isSoldBale) {
      this.bodyData.SortColumn = 'SoldBaleID';
      this.headerMap = this.soldBaleHeaderMap;
    } else if (this.isRehandleBale) {
      this.bodyData.SortColumn = 'UnSoldRehID';
      this.headerMap = this.rehandleBaleHeaderMap;
    }else if (this.isSoldRehandle) {
      this.bodyData.SortColumn = 'SoldRehandleID';
      this.headerMap = this.rehandleBaleHeaderMap;
    }
    this.getDataSource();
  }

  async generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    await this.getDataSource();
    this.gridView.currentPage = 1;
  }

  async getDataSource() {
    let response: any;
    if (this.isUnsoldBale) {
      response = await this.api.post(`awhwool/lnkBalesUnSoldWoolProcessData/${this.data.baleId}`, this.bodyData).toPromise();
    } else if (this.isSoldBale) {
      response = await this.api.post(`awhwool/lnkBalesSoldWoolProcessData/${this.data.baleId}`, this.bodyData).toPromise();
    } else if (this.isRehandleBale) {
      response = await this.api.post(`awhwool/lnkUnSoldRehandleWoolProcessData/${this.data.ClientAccountNumber}/${this.data.SaleSeason}/${this.data.SaleNbrSellingCntr}/${this.data.SaleNumberId}/${this.data.SaleNbrStorageCntr}`, this.bodyData).toPromise();
    }else if (this.isSoldRehandle) {
      response = await this.api.post(`awhwool/lnkSoldRehandleWoolProcessData/${this.data.baleId}`, this.bodyData).toPromise();
    }

    this.dataSource = response.Data;
    this.itemsCount = response.RecordsCount;
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getDataSource();
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
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        this.getDataSource();
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        this.getDataSource();
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.getDataSource();
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
    }
  }

}
