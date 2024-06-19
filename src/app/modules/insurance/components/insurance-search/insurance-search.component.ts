import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';


import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';
import { InsuranceSearchService } from '../../services/insurance-search.service';

import { CustomizedGridComponent } from '@app/shared';
import { environment } from '@env/environment';
import { UserDetail } from '@app/core/models/user-detail';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insurance-search',
  templateUrl: './insurance-search.component.html',
  styleUrls: ['./insurance-search.component.scss']
})
export class InsuranceSearchComponent implements OnInit {

  @ViewChild(CustomizedGridComponent)
  private gridView: CustomizedGridComponent;

  searchForm: FormGroup;
  submitted = false;
  showSearchForm = false;
  isSearched = false;
  globalSearchValue = '';
  pageIndex:number=1;
  formatter = (x: any) => x.dmocustmstrcustname2 === '' ? x.dmocustmstrcustname1  + ' (' + x.dmocustmstrsapno + ')' : x.dmocustmstrcustname1 +' (' + x.dmocustmstrcustname2 + ')' + ' (' + x.dmocustmstrsapno + ')';
  
  headerMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'RuralRecordType',
            displayName: 'Rural Record Type',
            width: '130px'
          },
          {
            objectKey: 'RuralBatchNumb',
            displayName: 'WFI Batch Number',
            width: '130px'
          },
          {
            objectKey: 'WDLClientNumb',
            displayName: 'PRMS Number',
            width: '110px'
          },
          {
            objectKey: 'LMK_SAPNo',
            displayName: 'SAP Number',
            width: '110px'
          },
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
            objectKey: 'RuralDocumentNumber',
            displayName: 'WFI Invoice Number',
            width: '150px'
          },
          {
            objectKey: 'RuralEffectiveDate',
            displayName: 'Effective Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '110px'
          },
          {
            objectKey: 'RuralDocumentAmount',
            displayName: 'Rural Document Amount',
            width: '160px'
          },
          {
            objectKey: 'RuralPremiumGSTAmt',
            displayName: 'Rural Premium GST Amount',
            width: '180px'
          },
          {
            objectKey: 'RuralNetBasePremium',
            displayName: 'Rural Net/Base Premium',
            width: '170px'
          },
          {
            objectKey: 'AgentNumber',
            displayName: 'Agent Number',
            width: '110px'
          },
          {
            objectKey: 'LMK_State',
            displayName: 'State',
            width: '110px'
          },
          {
            objectKey: 'LMK_BranchCode',
            displayName: 'Branch Code',
            width: '110px'
          },
          {
            objectKey: 'LMK_WFIBranch',
            displayName: 'Branch Name',
            width: '110px'
          },
          {
            objectKey: 'LMK_Region_Desc',
            displayName: 'Region',
            width: '110px'
          },
          {
            objectKey: 'LMK_Division_Desc',
            displayName: 'Division',
            width: '110px'
          },
          {
            objectKey: 'RuralCommissionAmount',
            displayName: 'Rural Commission Amount',
            width: '170px'
          },
          {
            objectKey: 'RuralCommissionGSTAmt',
            displayName: 'Rural Commission GST Amount',
            width: '200px'
          },
          {
            objectKey: 'RuralAgentCommission',
            displayName: 'Rural Agent Commission',
            width: '170px'
          },
          {
            objectKey: 'PolicyProductType',
            displayName: 'Policy Type',
            dataType: 'DropDown',
            dropdownOptions: [],
            width: '110px'
          },
          {
            objectKey: 'PolicyNumber',
            displayName: 'POLICY#',
            width: '110px'
          },
          {
            objectKey: 'BatchType',
            displayName: 'Business Type',
            width: '110px'
          },
          {
            objectKey: 'RuralCropIdentifier',
            displayName: 'Crop?',
            width: '110px'
          },
          {
            objectKey: 'WFIClientName',
            displayName: 'WFI Client Name',
            width: '120px'
          },
          {
            objectKey: 'RuralFactoredDebt',
            displayName: 'Factored',
            width: '110px'
          },
          {
            objectKey: 'CLTMASFileKey',
            displayName: 'WFI Client Number',
            width: '130px'
          },
          {
            objectKey: 'RuralEFTRunDate',
            displayName: 'WFI Run Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '110px'
          }
          //Not Required for Insurance -#725
          // ,
          // {
          //   objectKey: 'LandmarkAgent',
          //   displayName: 'Landmark Agent',
          //   width: '120px'
          // }
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

  regionOptions = [];
  divisionOptions = [];
  branchNameOptions = [];
  policyTypeOptions = [];
  appRoleCheck = 0;

  constructor(
    private fb: FormBuilder,
    private insuranceSearchService: InsuranceSearchService,
    private columnFilter: ColumnFilterService,
    private apiESaleyardService: ApiESaleyardService,
    private userDetail: UserDetail,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      LMK_TradingName: [null],
     // LMK_SAPNo: [''],
      RuralEFTRunFromDate: [null],
      RuralEFTRunToDate: [null],
      RuralFactoredDebt: [null],
      PolicyNumber: [''],
      PolicyProductType: [null],
      LMK_WFIBranch: [null],
      LMK_Region: [null],
      LMK_Division: [null],
      RuralDocumentNumber: [''],
      WFIClientName: [''],
      CLTMASFileKey: [''],
      AgentNumber: ['']
    });
    const url = (this.router.url).split('/');
    if (url[1] === 'insurance' && url[2] === 'search') {
      this.insuranceSearchService.checkAppRole('LMKInsuranceSales').subscribe(data =>{
        this.appRoleCheck = data;
        if(this.appRoleCheck > 0){
          this.bindDDLOptions();
          this.onChanges();
        }
      });
    } 
  }

  bindDDLOptions() {
    this.insuranceSearchService.getRegion()
      .subscribe(
        data => {
          this.regionOptions = data;
        }
      );

    this.insuranceSearchService.getDivision()
      .subscribe(
        data => {
          this.divisionOptions = data;
        }
      );

    this.insuranceSearchService.getLandmarkBranchName()
      .subscribe(
        data => {
          this.branchNameOptions = data;
        }
      );

    this.insuranceSearchService.getPolicyTypes()
      .subscribe(
        data => {
          this.policyTypeOptions = data;
          for (const column of this.headerMap.config.header.columns) {
            if (column.objectKey === 'PolicyProductType') {
              column.dropdownOptions = [];
              this.policyTypeOptions.map(option => {
                column.dropdownOptions.push({
                  key: option.dmowfiptwfiptcode,
                  value: option.dmowfiptwfiptdscr + ' (' + option.dmowfiptwfiptcode + ')'
                });
              });
              return;
            }
          }
        }
      );
  }

  onChanges() {
    this.searchForm.get('RuralEFTRunFromDate').valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(val => {
        if (val) {
          this.searchForm.get('RuralEFTRunToDate').setValidators([Validators.required]);
          this.searchForm.get('RuralEFTRunToDate').updateValueAndValidity();
        } else {
          this.searchForm.get('RuralEFTRunToDate').clearValidators();
          this.searchForm.get('RuralEFTRunToDate').updateValueAndValidity();
        }
      });

    this.searchForm.get('RuralEFTRunToDate').valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(val => {
        if (val) {
          this.searchForm.get('RuralEFTRunFromDate').setValidators([Validators.required]);
          this.searchForm.get('RuralEFTRunFromDate').updateValueAndValidity();
        } else {
          this.searchForm.get('RuralEFTRunFromDate').clearValidators();
          this.searchForm.get('RuralEFTRunFromDate').updateValueAndValidity();
        }
      });
  }

  toggle_search_form_show() {
    this.showSearchForm = !this.showSearchForm;
  }

  clear_all() {
    this.filters = {};
    this.searchForm.reset();
    // reset Division Get Call
    this.insuranceSearchService.getDivision()
        .subscribe(
          data => {
            this.divisionOptions = data;
          }
        );
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

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length > 0 ? false : true;
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
   // return formatDate(date, 'yyyy-MM-dd', this.locale);
  }

  formatDate(date: NgbDateStruct) {
    if (date) {
      return `${date.year}-${date.month}-${date.day}`;
    } else {
      return '';
    }
  }
// Change Advanced Search Control Condition -EQUAL - #725
  search() {
    this.submitted = true;
    if (!this.searchForm.valid) {
      return;
    }
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

    for (let i in this.searchForm.value) {
      let advanced_filter = null;
      if (this.searchForm.value[i] != null && this.searchForm.value[i] !== '') {
        if (i === 'RuralEFTRunFromDate') {
          advanced_filter = {
            GridConditions: [
              {
                Condition: 'GREATER_THAN_OR_EQUAL',
                ConditionValue: this.formatDate(this.searchForm.value['RuralEFTRunFromDate'])
              }
            ],
            DataField: 'RuralEFTRunDate',
            LogicalOperator: 'OR',
            FilterType: 'Column_Filter'
          };
        } else if (i === 'RuralEFTRunToDate') {
          advanced_filter = {
            GridConditions: [
              {
                Condition: 'LESS_THAN_OR_EQUAL',
                ConditionValue: this.formatDate(this.searchForm.value['RuralEFTRunToDate'])
              }
            ],
            DataField: 'RuralEFTRunDate',
            LogicalOperator: 'OR',
            FilterType: 'Column_Filter'
          };
        } else if (i === 'LMK_TradingName') {
          advanced_filter = {
            GridConditions: [
              {
                Condition: 'EQUAL',
                ConditionValue: this.searchForm.value[i].dmocustmstrsapno
              }
            ],
            DataField: 'LMK_SAPNo',
            LogicalOperator: 'OR',
            FilterType: 'Column_Filter'
          };
        } else {
          advanced_filter = {
            GridConditions: [
              {
                Condition: 'EQUAL',
                ConditionValue: this.searchForm.value[i]
              }
            ],
            DataField: i,
            LogicalOperator: 'OR',
            FilterType: 'Column_Filter'
          };
        }

        this.filters['Advnaced_Filter~$~' + i] = advanced_filter;
      } else {
        delete this.filters['Advnaced_Filter~$~' + i];
      }
    }

    this.generateFilter();
  }

  async getInsuranceData(params: any) {
    const response: any = await this.insuranceSearchService.insuranceSearch(params).toPromise();
    this.dataSource = response.Data;
    this.itemsCount = response.RecordsCount;
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getInsuranceData(this.bodyData);
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

  FilterList(item): string {
    return item.map(e => e.ConditionValue).join(',');
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
    // if(dataField === 'LMK_SAPNo')
    // dataField = 'LMK_TradingName';
    // delete this.filters['Advnaced_Filter~$~' + dataField];
    //   this.searchForm.get(dataField).patchValue(null); 
    this.generateFilter();
  }


  private async generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    await this.getInsuranceData(this.bodyData);
    this.gridView.currentPage = 1;
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
        this.getInsuranceData(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        this.getInsuranceData(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.getInsuranceData(this.bodyData);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
    }
  }

  public onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }

  // sapNoSearch = (text$: Observable<string>) => {
  //   return this.insuranceSearchService.sapNoSearch(text$);
  // }

  tradingNameSearch = (text$: Observable<string>) => {
    return this.insuranceSearchService.tradingNameSearch(text$);
  }

  policyTypeSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmoprodcategprodcatdscr.toLocaleLowerCase().indexOf(term) > -1 || item.dmoprodcategprodcatcode.toLocaleLowerCase().indexOf(term) > -1;
  }

  branchNameSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmobranchbrname.toLocaleLowerCase().indexOf(term) > -1 || item.dmobranchbrcode.toLocaleLowerCase().indexOf(term) > -1;
  }

  SaveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    fileName = sessionStorage.AppName +
        '_' + (curDate.getMonth() + 1).toString()
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
      SortColumn: 'ID',
      SortOrder: 'desc',
      GridFilters: []
    };
    Object.keys(this.filters).forEach(key => {
      bodyData.GridFilters.push(this.filters[key]);
    });
    this.apiESaleyardService.postGetFile(`lmkinsurance/ExportToExcel`, bodyData, 'blob')
      .subscribe(
        (resultBlob: Blob) => {
          this.SaveExportFile(resultBlob);
        }
      );
  }

  dateMasks(event: any) {
    var v = event.target.value;
    if (v.match(/^\d{2}$/) !== null) {
      event.target.value = v + '/';
    } else if (v.match(/^\d{2}\/\d{2}$/) !== null) {
      event.target.value = v + '/';
    } else if(v > 7){
      var newDate = v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      event.target.value = newDate;
    }
  }	
 // Get Division
 getDivision(event: any){
  this.searchForm.controls.LMK_Division.setValue(null);
  this.insuranceSearchService.getDivision(event)
      .subscribe(
        data => {
          this.divisionOptions = data;
        }
      );
 }

}
