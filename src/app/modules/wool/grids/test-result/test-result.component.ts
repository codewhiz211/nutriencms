import { Component, OnInit, Inject, LOCALE_ID, ViewChild, Output, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import { saveAs } from 'file-saver';

import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';
import { WoolSearchService } from '../../wool-search.service';

import { CustomizedGridComponent } from '@app/shared';
import { environment } from '@env/environment';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss']
})
export class TestResultComponent implements OnInit {

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
            width: '110px'
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
            width: '110px'
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
            objectKey: 'TR_CertificateType',
            displayName: 'Certificate Type',
            width: '120px'
          },
          {
            objectKey: 'TR_Micron',
            displayName: 'Micron',
            width: '100px'
          },
          {
            objectKey: 'TR_Yield1',
            displayName: 'Schlumberger Dry',
            width: '130px'
          },
          {
            objectKey: 'TR_Yield2',
            displayName: 'IWTO Scoured',
            width: '110px'
          },
          {
            objectKey: 'TR_Yield3',
            displayName: 'Japanese Clean',
            width: '120px'
          },
          {
            objectKey: 'TR_Yield4',
            displayName: 'Australian Carbonising',
            width: '160px'
          },
          {
            objectKey: 'TR_VM_HardHeadsBase',
            displayName: 'Hard Heads Base',
            width: '130px'
          },
          {
            objectKey: 'TR_VM_Base',
            displayName: 'VMB',
            width: '100px'
          },
          {
            objectKey: 'TR_VM_Burrs',
            displayName: 'VM1',
            width: '100px'
          },
          {
            objectKey: 'TR_VM_SeedsShive',
            displayName: 'VM2',
            width: '100px'
          },
          {
            objectKey: 'TR_VM_HardHeadsBase',
            displayName: 'VM3',
            width: '100px'
          },
          {
            objectKey: 'TR_WoolBase',
            displayName: 'Wool Base',
            width: '100px'
          },
          {
            objectKey: 'TR_StapleLengthCV',
            displayName: 'Staple Length CV',
            width: '130px'
          },
          {
            objectKey: 'TR_PB_Tip',
            displayName: 'Position of Break - Tip',
            width: '160px'
          },
          {
            objectKey: 'TR_PB_Middle',
            displayName: 'Position of Break - Middle',
            width: '170px'
          },
          {
            objectKey: 'TR_PB_Base',
            displayName: 'Position of Break - Base',
            width: '160px'
          },
          {
            objectKey: 'TR_StapleLength',
            displayName: 'Staple Length',
            width: '110px'
          },
          {
            objectKey: 'TR_StapleStrength',
            displayName: 'Staple Strength',
            width: '120px'
          },
          {
            objectKey: 'TR_TheoreticalHauteur',
            displayName: 'Theoretical Hauteur',
            width: '140px'
          },
          {
            objectKey: 'TR_TheoreticalHauteurCVPerc',
            displayName: 'Theoretical Hauteur CV%',
            width: '170px'
          },
          {
            objectKey: 'TR_TheoreticalRomainePerc',
            displayName: 'Theoretical Romaine %',
            width: '170px'
          },
          {
            objectKey: 'TR_ColourYZ',
            displayName: 'Color Y-Z',
            width: '100px'
          },
          {
            objectKey: 'TR_FD_Mean',
            displayName: 'FD - Mean',
            width: '100px'
          },
          {
            objectKey: 'TR_FD_CoEfficientVariation',
            displayName: 'FD - Co-efficient of Variation',
            width: '180px'
          },
          {
            objectKey: 'TR_FD_ComfortFactor',
            displayName: 'FD - Comfort Factor',
            width: '140px'
          },
          {
            objectKey: 'TR_Curvature',
            displayName: 'Curvature',
            width: '100px'
          },
          {
            objectKey: 'TR_DarkMedFibreRisk',
            displayName: 'DMFR',
            width: '100px'
          },
          {
            objectKey: 'TR_ReplaceUpdate',
            displayName: 'Replace / Update',
            width: '120px'
          },
          {
            objectKey: 'TR_Cost',
            displayName: 'COST - Cents per Kg',
            width: '150px'
          },
          {
            objectKey: 'AID_PT_BreedGroup',
            displayName: 'Actual Prime Breed',
            width: '140px'
          },
          {
            objectKey: 'AID_PT_WoolSubCategory',
            displayName: 'Actual Prime Sub Category',
            width: '180px'
          },
          {
            objectKey: 'AID_PT_WoolCategory',
            displayName: 'Actual Prime Category',
            width: '150px'
          },
          {
            objectKey: 'AID_PT_Style',
            displayName: 'Actual Prime Style',
            width: '130px'
          },
          {
            objectKey: 'AID_PT_VegetableMatter1',
            displayName: 'Actual Prime VM1',
            width: '130px'
          },
          {
            objectKey: 'AID_PT_VegetableMatter2',
            displayName: 'Actual Prime VM2',
            width: '130px'
          },
          {
            objectKey: 'AID_PT_VegetableMatter3',
            displayName: 'Actual Prime VM3',
            width: '130px'
          },
          {
            objectKey: 'AID_QF_Length',
            displayName: 'Actual Qualifier Length',
            width: '160px'
          },
          {
            objectKey: 'AID_QF_Strength',
            displayName: 'Actual Qualifier Strength',
            width: '160px'
          },
          {
            objectKey: 'AID_QF_Colour',
            displayName: 'Actual Qualifier Color',
            width: '160px'
          },
          {
            objectKey: 'AID_QF_Stain',
            displayName: 'Actual Qualifier Stain',
            width: '160px'
          },
          {
            objectKey: 'AID_QF_Cotts',
            displayName: 'Actual Qualifier Cotts',
            width: '150px'
          },
          {
            objectKey: 'AID_QF_Dermatitis',
            displayName: 'Actual Qualifier Dermo',
            width: '150px'
          },
          {
            objectKey: 'AID_QF_Other1',
            displayName: 'Actual Qualifier Other 1',
            width: '160px'
          },
          {
            objectKey: 'AID_QF_Other2',
            displayName: 'Actual Qualifier Other 2',
            width: '160px'
          },
          {
            objectKey: 'SD_TestHouse',
            displayName: 'Test House',
            width: '100px'
          },
          {
            objectKey: 'SD_TC_PMFI_DateReceived',
            displayName: 'Date Certificate Received (PMFI)',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '170px'
          },
          {
            objectKey: 'SD_TC_PMFI_TestCharge',
            displayName: 'Test Charge (PMFI)',
            width: '140px'
          },
          {
            objectKey: 'SD_TC_AM_DateReceived',
            displayName: 'Date Certificate Received (AM)',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '170px'
          },
          {
            objectKey: 'SD_TC_AM_TestCharge',
            displayName: 'Test Charge (AM)',
            width: '140px'
          },
          {
            objectKey: 'SD_TC_Colour_DateReceived',
            displayName: 'Date Certificate Received (Colour)',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '170px'
          },
          {
            objectKey: 'SD_TC_Colour_TestCharge',
            displayName: 'Test Charge (Colour)',
            width: '140px'
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
            objectKey: 'SD_SampleWeight',
            displayName: 'Sample Weight',
            width: '110px'
          },
          {
            objectKey: 'SD_RegrabWeight',
            displayName: 'Re-grab Weight',
            width: '120px'
          },
          {
            objectKey: 'SD_FromFolioNumber',
            displayName: 'From Follo Number',
            width: '140px'
          },
          {
            objectKey: 'SD_SFTestReq',
            displayName: 'Superfine Test Requested',
            width: '170px'
          },
          {
            objectKey: 'SD_AmTestReq',
            displayName: 'AM Test Requested',
            width: '140px'
          },
          {
            objectKey: 'SD_ColourTestReq',
            displayName: 'Color Test Requested',
            width: '150px'
          },
          {
            objectKey: 'SD_OfdaReq',
            displayName: 'OFDA Request',
            width: '120px'
          },
          {
            objectKey: 'SD_TC_PMFI_Identity',
            displayName: 'Test Certificate Identity (PMFI)',
            width: '120px'
          },
          {
            objectKey: 'SD_TC_AM_Identity',
            displayName: 'Test Certificate Identity (AM)',
            width: '120px'
          },
          {
            objectKey: 'SD_TC_Colour_Identity',
            displayName: 'Test Certificate Identity (Colour)',
            width: '120px'
          },
          {
            objectKey: 'SD_Yield5',
            displayName: 'Yield 5',
            width: '80px'
          },
          {
            objectKey: 'SD_StapleStrength25',
            displayName: 'Staple Strength - Lowest',
            width: '160px'
          },
          {
            objectKey: 'SD_MulesingStatus',
            displayName: 'Mulesing Status',
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
            width: '100px'
          },
          {
            objectKey: 'LMK_Agent',
            displayName: 'Agent',
            width: '100px'
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
    const response: any = await this.woolSearchService.getTestResultsData(params).toPromise();
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
        this.openBaleDetailModal.emit({baleId: this.dataSource[event.rowIndex].SD_FolioUniqueId, isUnsoldBale: true});
        break;
    }
  }

  saveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    fileName = sessionStorage.AppName
        + '_' + 'TestResult'
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
    this.apiESaleyardService.postGetFile('awhwool/ExportToExcelTestResults', bodyData, 'blob')
      .subscribe(
        (resultBlob: Blob) => {
          this.saveExportFile(resultBlob);
        }
      );
  }

}
