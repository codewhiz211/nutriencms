import { Injectable } from '@angular/core';
import { ListviewService } from '@app/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ApiLmkService } from '@app/core/services/api-lmk.service';

@Injectable({
  providedIn: 'root'
})
export class AdjustmentService {

  agencySapNo = '';
  ActivityType = '';
  companyCode = '';
  queryBody = {
    PageSize: 20,
    PageNumber: 0,
    SortColumn: '',
    SortOrder: 'Asc',
    ProcessName: '',
    TimeZone: 0,
    ColumnList: '',
    ViewName: 'View 1',
    GridFilters: [
      {
        GridConditions: [
          {
            Condition: 'CONTAINS',
            ConditionValue: ''
          }
        ],
        DataField: '',
        LogicalOperator: 'Or',
        FilterType: 'Column_Filter'
      }
    ]
  };
  constructor(private listviewService: ListviewService,
    private lmkservice: ApiLmkService) { }
  // --------------------------------Auto complete-----------------------------------------//
  saleIdSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' || term.length > 2
          ? this.getSaleIds(term).pipe(
            map((res: any) => res.Data
            ))
          : []
      )
    );
  }

  agencySearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' || term.length > 2
          ? this.getAgency(term).pipe(
            map((res: any) => res.Data
            ))
          : []
      )
    );
  }
  agentSearch = (text$: Observable<any>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term !== '' && term.length > 2) {
          return this.GetAgentAgencyList(term);
        } else {
          return [];
        }
      }
      )
    );
  }
  branchSearch = (text$: Observable<any>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' || term.length > 2
          ? this.getbranch(term).pipe(
            map((res: any) => res.Data
            ))
          : []
      )
    );
  }
  CustomerSearchById = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' || term.length > 2
          ? this.getCustomer(term,'Id').pipe(
            map((res: any) => res.Data
            ))
          : []
      )
    );
  }
  CustomerSearchByName = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' || term.length > 2
          ? this.getCustomer(term,'Name').pipe(
            map((res: any) => res.Data
            ))
          : []
      )
    );
  }
  getSaleIds(term: any) {
    const saleBodyQuery = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: '',
      SortOrder: 'Asc',
      ProcessName: '',
      TimeZone: 0,
      ColumnList: '',
      ViewName: 'View 1',
      RefererProcessName:'LMKCRMCommissionAdjustment',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: ''
            }
          ],
          DataField: '',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        }
      ]
    };
    saleBodyQuery.SortColumn = 'dmocrmheaderinfsaleid';
    saleBodyQuery.ProcessName = 'LMKLivestockSales';
    saleBodyQuery.ColumnList = 'dmocrmheaderinfsaleid,dmocrmheaderinfsaledate';
    saleBodyQuery.GridFilters[0].DataField = 'dmocrmheaderinfsaleid';
    saleBodyQuery.GridFilters[0].GridConditions[0].ConditionValue = term;
    if(this.companyCode && this.companyCode != '' && this.companyCode["ddOptionKey"]) {
      saleBodyQuery.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "CONTAINS",
            ConditionValue: this.companyCode["ddOptionKey"]
          }
        ],
        DataField: "dmocrmheaderinfocmpcode",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    saleBodyQuery.GridFilters.push({
      GridConditions: [
        {
          Condition: "EQUAL",
          ConditionValue: "Finalised",
          
          
        }
      ],
      DataField: "WFODISPNAME",
      LogicalOperator: "OR",
      FilterType: "Column_Filter"
    })
    return this.listviewService.GridDataSaleProcess(saleBodyQuery);
  }
  getAgency(term: any) {
    const queryBodyAgency = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: '',
      SortOrder: 'Asc',
      ProcessName: '',
      TimeZone: 0,
      ColumnList: '',
      ViewName: 'View 1',
      RefererProcessName:'LMKCRMCommissionAdjustment',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: ''
            }
          ],
          DataField: '',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        }
      ]
    };
    queryBodyAgency.SortColumn = 'dmoagencyagncsapno';
    queryBodyAgency.ProcessName = 'LMKMSTRAgency';
    queryBodyAgency.ColumnList = 'dmoagencyagncsapno,dmoagencyagncname1,dmoagencyagncactlivestok,dmoagencyagncactwool,dmoagencyagncactinsur';
    queryBodyAgency.GridFilters[0].DataField = 'dmoagencyagncsapno';
    queryBodyAgency.GridFilters[0].GridConditions[0].ConditionValue = term;
    if(this.ActivityType == 'Livestock') {
      queryBodyAgency.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: "YES"
          }
        ],
        DataField: "dmoagencyagncactlivestok",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    else if(this.ActivityType == 'Wool') {
      queryBodyAgency.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: "YES"
          }
        ],
        DataField: "dmoagencyagncactwool",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    else if(this.ActivityType == 'Insurance') {
      queryBodyAgency.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: "YES"
          }
        ],
        DataField: "dmoagencyagncactinsur",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    if(this.companyCode && this.companyCode != '' && this.companyCode["ddOptionKey"]) {
      queryBodyAgency.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: this.companyCode["ddOptionKey"]
          }
        ],
        DataField: "dmoagencycompcode",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    queryBodyAgency.GridFilters.push(
      {
        GridConditions: [
          { Condition: "CONTAINS", ConditionValue: "Active" }
        ],
        DataField: "Active",
        LogicalOperator: "Or",
        FilterType: "State_Filter"
      })
    
    return this.listviewService.GridData(queryBodyAgency,false);
  }
  getbranch(term: any) {
    const query = {
      ColumnList: "dmobranchbrcode,dmobranchbrname",
      PageNumber: 0,
      PageSize: 100,
      SortColumn: "dmobranchbrname",
      SortOrder: "asc",
      TimeZone: -330,
      ProcessName: "LMKMSTRBranch",
      SeparatorCondition: "or",
      IsColumnListOnly: true,
      IsDistinct: false,
      RefererProcessName: "LMKCRMCommissionAdjustment",
      GridFilters: [
        {
          "GridConditions": [
            {
              "Condition": "CONTAINS",
              "ConditionValue": term
            }
          ],
          "DataField": "dmobranchbrcode-dmobranchbrname",
          "LogicalOperator": "Or",
          "FilterType": "Column_Filter"
        }
      ]
    }
    if(this.companyCode && this.companyCode != '' && this.companyCode["ddOptionKey"]) {
      query.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: this.companyCode["ddOptionKey"]
          }
        ],
        DataField: "dmobranchcompcode",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    // query['SeparatorCondition'] = 'or';
    // query.GridFilters.push({
    //   GridConditions: [
    //     {
    //       Condition: 'CONTAINS',
    //       ConditionValue: term
    //     }
    //   ],
    //   DataField: 'dmobranchbrname',
    //   LogicalOperator: 'Or',
    //   FilterType: 'Column_Filter'
    // });
    return this.listviewService.GridData(query, false);
  }
  GetAgentAgencyList(term: any) {
    const Type = 'Agent';
    const sap = this.agencySapNo && this.agencySapNo != '' ? this.agencySapNo : null;
    const actiType = this.ActivityType && this.ActivityType != '' ? this.ActivityType : null;
    const cmpCode = this.companyCode != '' && this.companyCode["ddOptionKey"] ? this.companyCode["ddOptionKey"] : null;
    return this.lmkservice.get(`crmlot/GetAgentAgencyList/${Type}/${term}/${sap}/${actiType}?companyCode=${cmpCode}`, null);
  }
  getGLAccount() {
    const query = Object.assign({}, this.queryBody);
    query.SortColumn = 'dmoglcodegldscr';
    query.ProcessName = 'LMKMSTRGLCode';
    query.ColumnList = 'dmoglcodeglcode,dmoglcodegldscr';
    query.GridFilters = [];
    return this.listviewService.GridData(query,false);
  }
  getCustomer(term: string, controlName: string) {
    //return this.lmkservice.get(`crmlot/getCustomerBasedOnAgent?Agentcode=${agentCode}&AgencySapNo=${agencySap}`, null);
    const queryCustomerBody = {
      PageSize: 20,
      PageNumber: 0,
      isColumnListOnly: false,
      SortColumn: 'dmocustmstrsapno',
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRCustomer',
      TimeZone: 0,
      ColumnList: 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstracttype',
      ViewName: 'View 1',
      RefererProcessName:'LMKCRMCommissionAdjustment',
      GridFilters: [
        // {
        //   GridConditions: [
        //     {
        //       Condition: 'CONTAINS',
        //       ConditionValue: 'Buyer'
        //     }
        //   ],
        //   DataField: 'dmocustmstrcusttype',
        //   LogicalOperator: 'Or',
        //   FilterType: 'Column_Filter'
        // }, 
        {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: term
            }
          ],
          DataField: controlName == "Id" ? 'dmocustmstrsapno' : 'dmocustmstrcustname1-dmocustmstrcustname2',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },
        {
          GridConditions: [
            { Condition: "CONTAINS", ConditionValue: "Active" }
          ],
          DataField: "Active",
          LogicalOperator: "Or",
          FilterType: "State_Filter"
        }
      ]
    };
    if(this.ActivityType == 'Livestock' || this.ActivityType == 'Wool' || this.ActivityType == 'Insurance') {
      queryCustomerBody.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "CONTAINS",
            ConditionValue: this.ActivityType
          }
        ],
        DataField: "dmocustmstracttype",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    if(this.companyCode && this.companyCode != '' && this.companyCode["ddOptionKey"]) {
      queryCustomerBody.GridFilters.push(    {
        GridConditions: [
          {
            Condition: "EQUAL",
            ConditionValue: this.companyCode["ddOptionKey"]
          }
        ],
        DataField: "dmocustmstrcompcode",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    
    return this.listviewService.GridDataSaleProcess(queryCustomerBody);
  }
  insertCommissionAdjustment(data){
return this.lmkservice.post('crmsales/InsertCommissionAdjustment',data);
  }
  getCompany(term: any) {
    const companyBodyQuery = {
      "ColumnList": "dmocmcompcode,dmocmcompname",
      "PageNumber": 0,
      "PageSize": -1,
      "SortColumn": "dmocmcompcode",
      "SortOrder": "asc",
      "TimeZone": -330,
      "ProcessName": "NutriCompanyMSTR",
      "SeparatorCondition": "or",
      "IsColumnListOnly": true,
      "IsDistinct": false,
      "RefererProcessName": "LMKCRMCommissionAdjustment",
      "GridFilters": [
        {
          "GridConditions": [
            {
              "Condition": "CONTAINS",
              "ConditionValue": term
            }
          ],
          "DataField": "dmocmcompcode-dmocmcompname",
          "LogicalOperator": "Or",
          "FilterType": "Column_Filter"
        },
        {
          "GridConditions": [
            {
              "Condition": "CONTAINS",
              "ConditionValue": "Active"
            }
          ],
          "DataField": "Active",
          "LogicalOperator": "Or",
          "FilterType": "State_Filter",
          "Filter_Name": "ActiveRecords"
        }
      ]
    };
    return this.listviewService.GridDataSaleProcess(companyBodyQuery);
  }
}
