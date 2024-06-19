import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { ApiService, IHeaderMap, ColumnFilterService, ApiESaleyardService, ListviewService } from '@app/core';
import { GenericGridComponent } from '@app/shared/components/generic-grid/generic-grid.component';
import { trim } from 'lodash';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from '@app/core';
import { Router } from '@angular/router';
import { UserManagementService } from '@app/core/services/user-management.service';
import { UserDetail } from '@app/core/models/user-detail';
import { environment } from '@env/environment';


@Component({
  selector: 'app-agency-statement',
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}],
  templateUrl: './agency-statement.component.html',
  styleUrls: ['./agency-statement.component.scss']
})
export class AgencyStatementComponent implements OnInit {

  @ViewChild(GenericGridComponent) gridView: GenericGridComponent;

  searchForm: FormGroup;
  isSearched = false;
  pageNum = -1;
  ddlData = {
    Agencies: [],
    Activity: [
      { TextField: 'All', ValueField: 'All~~~All' },
      { TextField: 'Livestock', ValueField: 'L~~~Livestock' },
      { TextField: 'Wool', ValueField: 'W~~~Wool' },
      { TextField: 'Insurance', ValueField: 'I~~~Insurance' }
    ],
    TransType: [],
    SaleType: []
  };
  query = {
    ProcessName: '',
    PageSize: -1,
    PageNumber: 0,
    SortColumn: '',
    SortOrder: 'asc',
    TimeZone: '-330',
    ColumnList: '',
    RefererProcessName:'',
    GridFilters: []
  }

  filters: any = {};
  bodyData: any = {
    PageSize: 10,
    PageNumber: 0,
    SortColumn: '-1',
    SortOrder: 'Asc',
    TimeZone: this.userdetail.TimeZone,
    GridFilters: []
  };

  // ordering the columns
  documentHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'Activity',
            displayName: 'Activity',
            width: '5%'
          },
          {
            objectKey: 'AgencyName',
            displayName: 'Agency Name',
            width: '9%'
          },
          {
            objectKey: 'AgencyNumber',
            displayName: 'Agency SAP ID',
            width: '7%'
          },
          {
            objectKey: 'CustomerName',
            displayName: 'Customer Name',
            width: '11%'
          },
          {
            objectKey: 'CustomerNumber',
            displayName: 'Customer ID',
           width: '6%'
          },
          {
            objectKey: 'SaleNumber',
            displayName: 'Sale #',
            width: '5%'
          },
          {
            objectKey: 'FinalizeDate',
            displayName: 'Finalisation date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userdetail.TimeZone,
            width: '6%',
            DmoType: 'StaticDateBox'
          },
          {
            objectKey: 'LotNumber',
            displayName: 'Lot No.',
            width: '4%'
          },
          {
            objectKey: 'Quantity',
            displayName: 'Quantity',
            width: '5%'
          },
          {
            objectKey: 'SaleDate',
            displayName: 'Sale Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userdetail.TimeZone,
            width: '6%',
            DmoType: 'StaticDateBox'
          },
          {
            objectKey: 'Turnover',
            displayName: 'Turnover',
            width: '5%'
          },
          {
            objectKey: 'VendorCommission',
            displayName: 'Vendor Commission',
            width: '8%'
          },
          {
            objectKey: 'Branch',
            displayName: 'Branch',
            width: '7%'
          },
          {
            objectKey: 'AgentName',
            displayName: 'Agent Name',
             width: '8%'
          },
          // {
          //   objectKey: 'AgentID',
          //   displayName: 'Agent ID'
          // },
          {
            objectKey: 'AgentCommission',
            displayName: 'Agent Commission',
            width: '8%'
          },
          {
            objectKey: 'DocumentNumber',
            displayName: 'Document No.',
            dataType: 'Link',
            width: '7%'
          }
        ],
        action: {
          Checkbox: false
        },
        columnFilter: []
      },
      paging: true
    }
  };
  documentsData: any = [];
  documentsCount = 0;

  formFields = ['AgencyName', 'AgencyNumber', 'Activity', 'TransactionTypeCode', 'SaleTypeCode', 'FromDate', 'ToDate'];
  appRoleCheck = 0;

  constructor(
    private apiESaleyardService: ApiESaleyardService,
    private toastr: ToastrService,
    private columnFilter: ColumnFilterService,
    private fb: FormBuilder,
    private api: ApiService,
    private datePipe: DatePipe,
    private router: Router,
    private userMgtServ: UserManagementService,
    private userdetail: UserDetail,
    private ls: ListviewService) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      AgencyName: [null],
      AgencyNumber: [null],
      Activity: [null],
      TransactionTypeCode: [null],
      SaleTypeCode: [null],
      FromDate: [null],
      ToDate: [null]
    });

    const url = (this.router.url).split('/');
    if (url[1] === 'crm' && url[2] === 'agency-comm-statement') {
      this.userMgtServ.checkBuyerRole('lmkagencycommstatement').subscribe(data => {
        this.appRoleCheck = data;
        if (this.appRoleCheck > 0) {

          this.searchForm.controls.Activity.valueChanges.subscribe(val => {
            this.searchForm.controls.TransactionTypeCode.reset();
            this.getTransactionType(val);
          });

          this.searchForm.controls.TransactionTypeCode.valueChanges.subscribe(val => {
            this.searchForm.controls.SaleTypeCode.reset();
            this.getSale(val);
          });

          // Get Agency name and Agency sap
          this.query.ProcessName = 'LMKMSTRAgency';
          this.query.SortColumn = 'dmoagencyagncname1';
          this.query.ColumnList = 'dmoagencyagncsapno,dmoagencyagncname1';
          this.query.RefererProcessName = 'LMKAgencyCommStatement';
          this.ls.GridDatalmk(this.query).subscribe(result => {
            this.ddlData.Agencies = result.Data.map(x => ({
              dmoagencyagncsapno: x.dmoagencyagncsapno.lastIndexOf('(') > -1 ? x.dmoagencyagncsapno.substr(x.dmoagencyagncsapno.lastIndexOf('(') + 1).replace(')', '') : x.dmoagencyagncsapno,
              dmoagencyagncname1: x.dmoagencyagncsapno.lastIndexOf('(') > -1 ? trim(x.dmoagencyagncsapno.substring(0, x.dmoagencyagncsapno.indexOf('('))) : x.dmoagencyagncsapno
            }));
          });
        }
      });
    }

  }
  // Get Transaction type
  getTransactionType(event) {
    if (!!event) {
      const val = event.split('~~~')[0];

      this.query.ProcessName = 'LMKMSTRTransactionType';
      this.query.SortColumn = 'dmotrnstyptranstypedscr';
      this.query.ColumnList = 'dmotrnstyptranstypecode,dmotrnstyptranstypedscr';
      if(val=='All'){
        this.query.GridFilters = []
      }else{
      this.query.GridFilters = [
        {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: val,
              dataType: 'KeyValueDropdownList',
              RowValue: val
            }
          ],
          DataField: 'dmotrnstyptranstypeact',
          LogicalOperator: 'OR',
          FilterType: 'Column_Filter'
        }
      ];
    }
      this.api.postForLMK('listview/getprocessdata', this.query).subscribe(result => {
        this.ddlData.TransType = result.Data.map(x => ({
          dmotrnstyptranstypecode: x.dmotrnstyptranstypecode + '~~~' + x.dmotrnstyptranstypedscr,
          dmotrnstyptranstypedscr: x.dmotrnstyptranstypedscr
        }));
      });
    } else {
      this.ddlData.TransType = []
    }
  }
  // Get Sale type
  getSale(event) {
    if (!!event) {
      const val = event.split('~~~')[0];
      this.api.postForLMK(`crmsales/getSaleType/${val}`, null).subscribe(result => {
        if (result === false) {
          this.ddlData.SaleType = [];
        } else {
          this.ddlData.SaleType = result.Data.map(x => ({
            SALECODE: x.SALECODE + '~~~' + x.SALETYPENAME,
            SALETYPENAME: x.SALETYPENAME
          }));
        }
      });
    } else {
      this.ddlData.SaleType = [];
    }
  }
  onAgencyNameChange(event) {
    if (event) {
      this.searchForm.controls.AgencyNumber.patchValue(event.dmoagencyagncsapno);
    }
  }
  onAgencySapChange(event) {
    if (event) {
      this.searchForm.controls.AgencyName.patchValue(event.dmoagencyagncname1);
    }
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length > 0 ? false : true;
  }

  get isEmptyFilter() {
    return this.isEmptyObject(this.filters) && this.formFields.reduce((prev, item) => prev && !!this.bodyData[item] === false, true);
  }

  FilterList(item): string {
    return item.map(e => e.ConditionValue).join(',');
  }

  onFilterClear(columnName, filterType) {
    const form = this.gridView.elRef.nativeElement.querySelector('#frm_' + columnName);

    if (form.filterValue2.hasAttribute('ngbdatepicker')) {
      form.logicalOpt.value = 'OR';
      form.filterValue1.value = '';
      form.filterValue2.value = '';
      form.ConditionOpt1.value = 'GREATER_THAN';
      form.ConditionOpt2.value = 'GREATER_THAN';
    } else {
      form.logicalOpt.value = 'OR';
      form.filterValue1.value = '';
      form.filterValue2.value = '';
      form.ConditionOpt1.value = 'CONTAINS';
      form.ConditionOpt2.value = 'CONTAINS';
    }
    delete this.filters[filterType + '~$~' + columnName];
    this.generateFilter();
  }

  onFormFilterClear(fieldName: string) {
    this.bodyData[fieldName] = null;
    this.searchForm.controls[fieldName].patchValue(null);
    if(fieldName=='Activity'){
      this.ddlData.TransType=[];
    }
    this.bindData(this.bodyData);
  }

  search() {
    const filter = { ...this.searchForm.value };
    this.isSearched = true;
    Object.keys(filter).forEach(element => {
      if (!!filter[element] && typeof filter[element] === 'string' && filter[element].indexOf('~~~') > -1) {
        const spliter = filter[element].split('~~~');
        filter[element] = spliter[0];
        filter[element + '_val'] = spliter[1];
      }
    });

    // For handle key value search
    if (filter.AgencyNumber && filter.AgencyNumber.indexOf('(') > 0) {
      filter.AgencyNumber = filter.AgencyNumber.substr(filter.AgencyNumber.indexOf('(') + 1).replace(')', '')
    }

    // convert from date to mm/dd/yyyy
    if (
      !!filter.FromDate &&
      filter.FromDate.hasOwnProperty('year') &&
      filter.FromDate.hasOwnProperty('month') &&
      filter.FromDate.hasOwnProperty('day')) {
      filter.FromDate = ''.concat(filter.FromDate.year, '-', filter.FromDate.month, '-', filter.FromDate.day);
      const datePipe = new DatePipe('en-US');
      filter.FromDate = datePipe.transform(filter.FromDate, 'MM/dd/yyyy');
      filter.FromDate_val = datePipe.transform(filter.FromDate, 'dd/MM/yyyy');
    }
    // convert to date to mm/dd/yyyy
    if (
      !!filter.ToDate &&
      filter.ToDate.hasOwnProperty('year') &&
      filter.ToDate.hasOwnProperty('month') &&
      filter.ToDate.hasOwnProperty('day')) {
      filter.ToDate = ''.concat(filter.ToDate.year, '-', filter.ToDate.month, '-', filter.ToDate.day);
      const datePipe = new DatePipe('en-US');
      filter.ToDate = datePipe.transform(filter.ToDate, 'MM/dd/yyyy');
      filter.ToDate_val = datePipe.transform(filter.ToDate, 'dd/MM/yyyy');

    }

    this.bodyData = { ...this.bodyData, ...filter };
    this.bindData(this.bodyData);
  }

  //////////////////////////////////////////////////

  bindData(bodyData: any) {
    const payload = JSON.parse(JSON.stringify(bodyData));
    Object.keys(payload).forEach(key => {
      if (key.includes('_val')) {
        delete payload[key];
      }
    });
    this.api.postForLMK('report/getAgentCommissionStatementDocuments', payload).subscribe(res => {
      if (res === false) {
        this.documentsData = [];
        this.documentsCount = 0;
      } else {
        this.documentsData = res.Data;
        this.documentsCount = res.RecordsCount;
      }
    });
  }

  pageChange(event) {    
    this.bodyData.PageNumber = event.currentPage - 1;
    this.bodyData.PageSize = event.pageSize;
    this.bindData(this.bodyData);
  }

  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
    } else {
      this.documentHeaderMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }

  validate(event): boolean {
    if (event.filterData.ConditionOpt1 && (event.filterData.ConditionOpt1.Value === '' || event.filterData.ConditionOpt1.Value === 'Select...')) {
      return false;
    } else if (event.filterData.filterValue1 == null || event.filterData.filterValue1 === '') {
      return false;
    } else {
      return true;
    }
  }

  ChangeFilterDateFormat(dateValue) {
    const d = new Date(dateValue);
    const localOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - localOffset);
  }

  private generateFilter() {    
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 0;
    this.bodyData.PageSize = 10;
    this.bodyData.SortOrder = 'Asc';
    this.bodyData.SortColumn = '-1';
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    this.bindData(this.bodyData);
  }

  actionClick(event) {    
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        if (!this.validate(event)) {
          break;
        } else {
          const filter: any = {
            GridConditions: [],
            DataField: event.colData.objectKey,
            LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
            FilterType: 'Column_Filter'
          };

          if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
            if (event.colData.dataType === 'Date') {
              const modifiedDateValue1 = this.ChangeFilterDateFormat(event.filterData.filterValue1);
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt1.Value,
                ConditionValue: this.datePipe.transform(modifiedDateValue1, 'yyyy-MM-dd'),
                dataType: 'Date'
              });
            } else {
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt1.Value,
                ConditionValue: event.filterData.filterValue1,
              });
            }
          }

          if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
            if (event.colData.dataType === 'Date') {
              const modifiedDateValue2 = this.ChangeFilterDateFormat(event.filterData.filterValue2);
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt2.Value,
                ConditionValue: this.datePipe.transform(modifiedDateValue2, 'yyyy-MM-dd'),
                dataType: 'Date'
              });
            } else {
              filter.GridConditions.push({
                Condition: event.filterData.ConditionOpt2.Value,
                ConditionValue: event.filterData.filterValue2
              });
            }
          }
          this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
          this.bodyData.GridFilters = [];
          Object.keys(this.filters).forEach(key => {
            this.bodyData.GridFilters.push(this.filters[key]);
          });
          this.bindData(this.bodyData);
          event.ColumnFilterDropdown.close();
          break;
        }
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        this.bindData(this.bodyData);
        if(event.ColumnFilterDropdown)
         event.ColumnFilterDropdown.close();
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        this.bindData(this.bodyData);
        if(event.ColumnFilterDropdown)
        event.ColumnFilterDropdown.close();
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
      case 'Link':
        this.apiESaleyardService.postGetFile(`report/downloadAgencyDocument?documentNumber=${this.documentsData[event.rowIndex].DocumentNumber}`, null, 'Blob')
          .subscribe((res: Blob) => {
            if (res.type === 'application/pdf') {
              const fileURL = URL.createObjectURL(res);
              window.open(fileURL, '_blank');
            } else {
              this.toastr.warning('There is no data for this report.');
            }
          }, err => {
            console.log(err);
          });
        break;
    }
  }

  removeFilter() {    
    this.gridView.OnRemoveFilterClick();
    this.searchForm.reset();
    const filter = this.searchForm.value;
    this.bodyData = { ...this.bodyData, ...filter };
    this.filters = [];
    this.pageNum = 1; //For reset Page after remove filter
    this.generateFilter();
  }

}
