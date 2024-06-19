import { Component, OnInit, Inject, LOCALE_ID, ViewChild, Output, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import { saveAs } from 'file-saver';

import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';
import { WoolSearchService } from '../../wool-search.service';
import { environment } from '@env/environment';
import { CustomizedGridComponent } from '@app/shared';
import { UserDetail } from '@app/core/models/user-detail';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sold-rehandle-wool',
  templateUrl: './sold-rehandle-wool.component.html',
  styleUrls: ['./sold-rehandle-wool.component.scss']
})
export class SoldRehandleWoolComponent implements OnInit {

  @ViewChild(CustomizedGridComponent)
  private gridView: CustomizedGridComponent;



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
            objectKey: 'EN_BSC_Broker',
            displayName: 'Receival Broker Id',
            width: '90px'
          },
          {
            objectKey: 'EN_BSC_State',
            displayName: 'Receival State Code',
            width: '90px'
          },
          {
            objectKey: 'EN_BSC_Centre',
            displayName: 'Receival Centre Code',
            width: '110px'
          },
          {
            objectKey: 'EN_Broker',
            displayName: 'Broker Id',
            width: '70px'
          },
          {
            objectKey: 'CL_AccNo',
            displayName: 'Client Account',
            width: '90px'
          },
          {
            objectKey: 'CL_WoolNo',
            displayName: 'Wool Number',
            width: '90px'
          },
          {
            objectKey: 'CL_ClipCode',
            displayName: 'Clip Code',
            width: '60px'
          },
          {
            objectKey: 'CL_WoolNoType',
            displayName: 'Wool Number Type',
            width: '100px'
          },
          {
            objectKey: 'SR_SD_CompId',
            displayName: 'Sale Company Id',
            width: '100px'
          },
          {
            objectKey: 'SR_SD_SeasonCentury',
            displayName: 'Sale Season Century',
            width: '110px'
          },
          {
            objectKey: 'SR_SD_Season',
            displayName: 'Sale Season',
            width: '75px'
          },
          {
            objectKey: 'SR_SD_SellingCentre',
            displayName: 'Sale Nbr Selling Cntr',
            width: '100px'
          },
          {
            objectKey: 'SR_SD_Number',
            displayName: 'Sale Number Id',
            width: '90px'
          },
          {
            objectKey: 'SR_SD_StorageCentre',
            displayName: 'Sale Nbr Storage Cntr',
            width: '100px'
          },
          {
            objectKey: 'SR_BulkClsRef',
            displayName: 'Bulk Class Reference',
            width: '110px'
          },
          {
            objectKey: 'SR_B_Number',
            displayName: 'Bale Number',
            width: '100px'
          },
          {
            objectKey: 'SR_B_Type',
            displayName: 'Bale Type',
            width: '90px'
          },
          {
            objectKey: 'SR_SellingMethod',
            displayName: 'Selling Method',
            width: '80px'
          },
          {
            objectKey: 'SR_B_Description',
            displayName: 'Standard Bale Desc',
            width: '110px'
          },
          {
            objectKey: 'SR_B_GrossWeight',
            displayName: 'Gross Bale Weight',
            width: '100px'
          },
          {
            objectKey: 'SR_B_Tare',
            displayName: 'Bale Tare',
            width: '90px'
          },
          {
            objectKey: 'NetWeight',
            displayName: 'Net Weight',
            width: '110px'
          },
          {
            objectKey: 'SR_AMBSC_Broker',
            displayName: 'Alt Marketing Broker',
            width: '100px'
          },
          {
            objectKey: 'SR_AMBSC_State',
            displayName: 'Alt Marketing State',
            width: '100px'
          },
          {
            objectKey: 'SR_AMBSC_Centre',
            displayName: 'Alt Marketing Centre',
            width: '120px'
          },
          {
            objectKey: 'SR_DateReceived',
            displayName: 'Date Received',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '120px'
          },
          {
            objectKey: 'SR_DateLotted',
            displayName: 'Date Lotted',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '100px'
          },
          {
            objectKey: 'SR_DateBinSplit',
            displayName: 'Date Bin Split',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '100px'
          },
          {
            objectKey: 'SR_B_RehandleChargeCode',
            displayName: 'Rehandle Charge Code',
            width: '100px'
          },
          {
            objectKey: 'SR_SaleDate',
            displayName: 'Sale Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '100px'
          },
          {
            objectKey: 'PriceCKG',
            displayName: 'Price (c/kg)',
            width: '100px'
          },
          {
            objectKey: 'SR_B_FirstCost',
            displayName: 'Bale First Cost',
            width: '100px'
          },
          {
            objectKey: 'SR_B_RehandleCharge',
            displayName: 'Bale Rehandle Charge',
            width: '110px'
          },
          {
            objectKey: 'CL_ClipBrand',
            displayName: 'Clip Brand',
            width: '100px'
          },
          {
            objectKey: 'SR_B_Value',
            displayName: 'Bale Value',
            width: '100px'
          },
          {
           objectKey: 'Acc_Sale_Document_Number',
           displayName: 'Account Sale',
           dataType: 'Link',
           width: '80px'
         },
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
    private toastr: ToastrService,
    private userDetail: UserDetail,
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
    const response: any = await this.woolSearchService.getSoldRehandleProcessData(params).toPromise();
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
          this.downloadFile(this.dataSource[event.rowIndex].SR_SD_Season,this.dataSource[event.rowIndex].SR_SD_SellingCentre,
            this.dataSource[event.rowIndex].SR_SD_Number,this.dataSource[event.rowIndex].CL_AccNo)
          break;
    }
  }

  saveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    fileName = sessionStorage.AppName
        + '_' + 'SoldRehandleWool'
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
    this.apiESaleyardService.postGetFile('awhwool/ExportToExcelSoldRehandle', bodyData, 'blob')
      .subscribe(
        (resultBlob: Blob) => {
          this.saveExportFile(resultBlob);
        }
      );
  }
  downloadFile(Season, SaleCentre, SaleNumber, CustomerNumber) {
    this.apiESaleyardService.postGetFile(`report/downloadAWHAccountSaleReport?Season=${Season}&SaleCentre=${SaleCentre}&SaleNumber=${SaleNumber}&CustomerNumber=${CustomerNumber}`, null, 'blob')
    .subscribe(
      (res: Blob) => {
        if (res.type === 'application/pdf') {
          const fileURL = URL.createObjectURL(res);
          window.open(fileURL, '_blank');
        } else {
         this.toastr.warning('There is no data for this report.');
        }
      }, err => {
        console.log(err);
      }
    );
    
  }

}
