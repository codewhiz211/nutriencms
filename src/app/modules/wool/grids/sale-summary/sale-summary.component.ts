import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { saveAs } from 'file-saver';

import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';
import { WoolSearchService } from '../../wool-search.service';

import { CustomizedGridComponent } from '@app/shared';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@env/environment';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-sale-summary',
  templateUrl: './sale-summary.component.html',
  styleUrls: ['./sale-summary.component.scss']
})
export class SaleSummaryComponent implements OnInit {

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
            objectKey: 'CL_AccNumber',
            displayName: 'Client Account',
            width: '120px'
          },
          {
            objectKey: 'CL_WoolNo',
            displayName: 'Wool Number',
            width: '100px'
          },
          {
            objectKey: 'EN_SD_Season',
            displayName: 'Sale Season',
            width: '100px'
          },
          {
            objectKey: 'EN_SD_SaleCentre',
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
             // Open PDF View for new Tab - #719
            objectKey: 'Acc_Sale_Document_Number',
            displayName: 'Account Sale',
            dataType: 'Link',
            width: '120px'
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
            objectKey: 'SR_F_Bales',
            displayName: 'Folio Bales',
            width: '140px'
          },
          {
            objectKey: 'SR_F_GrossWeight',
            displayName: 'Folio Gross Weight',
            width: '140px'
          },
          {
            objectKey: 'SR_F_TareWeight',
            displayName: 'Folio Tare Weight',
            width: '140px'
          },
          {
            objectKey: 'NetWeight',
            displayName: 'Net Weight',
            width: '80px'
          },
          {
            objectKey: 'CleanWeight',
            displayName: 'CleanWeight',
            width: '100px'
          },
          // {
          //   objectKey: 'Micron',
          //   displayName: 'Micron',
          //   width: '100px'
          // },
          {
            objectKey: 'TR_FD_Mean',
            displayName: 'FD - Mean',
            width: '120px'
          },
          {
            objectKey: 'TR_FD_CoEfficientVariation',
            displayName: 'FD - Co-efficient',
            width: '150px'
          },
          {
            objectKey: 'TR_FD_ComfortFactor',
            displayName: 'FD - Comfort',
            width: '120px'
          },
          {
            objectKey: 'TR_Curvature',
            displayName: 'Curvature',
            width: '100px'
          },
          {
            objectKey: 'TR_VM_Base',
            displayName: 'VMB',
            width: '100px'
          },
          {
            objectKey: 'TR_Yield1',
            displayName: 'Yield 1',
            width: '100px'
          },
          {
            objectKey: 'TR_StapleLength',
            displayName: 'Staple Length',
            width: '120px'
          },
          {
            objectKey: 'TR_StapleLengthCV',
            displayName: 'Staple Length CV',
            width: '150px'
          },
          {
            objectKey: 'TR_StapleStrength',
            displayName: 'Staple Strength',
            width: '120px'
          },
          {
            objectKey: 'SD_StapleStrength25',
            displayName: 'Staple Strength � Lowest 25%',
            width: '160px'
          },
          {
            objectKey: 'TR_TheoreticalHauteur',
            displayName: 'Theoretical Hauteur',
            width: '160px'
          },
          {
            objectKey: 'TR_TheoreticalHauteurCVPerc',
            displayName: 'Theoretical Hauteur CV',
            width: '160px'
          },
          {
            objectKey: 'TR_PofB_Tip',
            displayName: 'Position of Break- Tip',
            width: '160px'
          },
          {
            objectKey: 'TR_PofB_Middle',
            displayName: 'Position of Break- Middle',
            width: '160px'
          },
          {
            objectKey: 'TR_PofB_Base',
            displayName: 'Position of Break- Base',
            width: '160px'
          },
          {
            objectKey: 'SD_SaleOutcome',
            displayName: 'Sale Outcome',
            width: '160px'
          },
          {
            objectKey: 'SD_SalePrice',
            displayName: 'Sale Price',
            width: '160px'
          },
          {
            objectKey: 'CleanPrice',
            displayName: 'Clean Price',
            width: '160px'
          },
          {
            objectKey: 'SD_SaleDate',
            displayName: 'Sale Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '110px'
          },
          {
            objectKey: 'SD_BuyerCode',
            displayName: 'Buyer Code',
            width: '160px'
          },
          {
            objectKey: 'SD_BuyerCentre',
            displayName: 'Buyer Centre',
            width: '160px'
          },
          {
            objectKey: 'SD_FolioProceeds',
            displayName: 'Folio Proceeds',
            width: '160px'
          },
          {
            objectKey: 'SD_PromptDate',
            displayName: 'Prompt Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '110px'
          },
          {
            objectKey: 'LMK_Region',
            displayName: 'Region',
            width: '100px'
          },
          {
            objectKey: 'LMK_Division',
            displayName: 'Division',
            width: '120px'
          },
          {
            objectKey: 'LMK_BranchName',
            displayName: 'Branch',
            width: '120px'
          },
          {
            objectKey: 'LMK_WAM',
            displayName: 'WAM',
            width: '80px'
          },
          {
            objectKey: 'LMK_Agent',
            displayName: 'Agent',
            width: '120px'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };
 // Open PDF View for new Tab - #719
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
    const response = await this.woolSearchService.getSaleSummaryProcessData(params).toPromise();
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

 // Open PDF View for new Tab - #719
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
        this.downloadFile(this.dataSource[event.rowIndex].EN_SD_Season,this.dataSource[event.rowIndex].EN_SD_SaleCentre,
          this.dataSource[event.rowIndex].EN_SD_Number,this.dataSource[event.rowIndex].CL_AccNumber)
        break;
    }
  }

  saveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    fileName = sessionStorage.AppName
        + '_' + 'SaleSummary'
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
    this.apiESaleyardService.postGetFile('awhwool/ExportToExcelSaleSummary', bodyData, 'blob')
      .subscribe(
        (resultBlob: Blob) => {
          this.saveExportFile(resultBlob);
        }
      );
  }
  // Open PDF View for new Tab - #719
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
