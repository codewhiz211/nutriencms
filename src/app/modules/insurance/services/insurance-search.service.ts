import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ListviewService, ApiESaleyardService } from '@app/core';

@Injectable({
  providedIn: 'root'
})
export class InsuranceSearchService {

  queryBody: any = {
    PageSize: -1,
    PageNumber: -1,
    SortColumn: '',
    SortOrder: 'Asc',
    ProcessName: '',
    TimeZone: 0,
    ColumnList: '',
    ViewName: 'View 1',
    GridFilters: []
  };


  constructor(
    private listviewService: ListviewService,
    private apiESaleyardService: ApiESaleyardService
  ) { }

  // sapNoSearch = (text$: Observable<string>) => {
  //   const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

  //   return debouncedText$.pipe(
  //     switchMap(term => {
  //       if (term === '') {
  //         return [];
  //       } else {
  //         this.queryBody.PageNumber = 0;
  //         this.queryBody.PageSize = 99;
  //         this.queryBody.SortColumn = 'dmocustmstrsapno';
  //         this.queryBody.ProcessName = 'LMKMSTRCustomer';
  //         this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1';
  //         this.queryBody.GridFilters = [{
  //           DataField: 'dmocustmstrsapno',
  //           FilterType: 'Column_Filter',
  //           LogicalOperator: 'Or',
  //           GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
  //         }];
  //         return this.listviewService.GridData(this.queryBody)
  //           .pipe(
  //             map((res: any) => res.Data.map(item => item.dmocustmstrsapno))
  //           );
  //       }
  //     })
  //   );
  // }


  tradingNameSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return [];
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 99;
          this.queryBody.SortColumn = 'dmocustmstrcustname1';
          this.queryBody.ProcessName = 'LMKMSTRCustomer';
          this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrcustname2';
          this.queryBody.GridFilters = [
            {
              DataField: 'dmocustmstrcustname1',
              FilterType: 'Custom_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term.split(' (')[0]}]
            },
            {
              DataField: 'dmocustmstrcustname2',
              FilterType: 'Custom_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term.split(' (')[0]}]
            },
            {
              DataField: 'dmocustmstrsapno',
              FilterType: 'Custom_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term.split(' (')[0]}]
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
        ];
          return this.listviewService.GridData(this.queryBody,false)
          .pipe(
            map((res: any) => res.Data)
          );
        }
      })
    );
  }

  getRegion(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmoregionregioncode';
    this.queryBody.ProcessName = 'LMKMSTRRegion';
    this.queryBody.ColumnList = 'dmoregionregioncode,dmoregionregiondscr';
    this.queryBody.GridFilters = [
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
    ];


    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

    getDivision(event: any = null): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmodivisondivisondscr';
    this.queryBody.ProcessName = 'LMKMSTRDivision';
    this.queryBody.ColumnList = 'dmodivisondivisoncode,dmodivisondivisondscr';
    if(event !== null){
      this.queryBody.GridFilters = [
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
        },
        {
          "DataField": "dmodivisonregion-dmodivisonregion",
          "DataType": "KeyValueSearchBox",
          "FilterType": "Column_Filter",
          "LogicalOperator": 'Or',
          GridConditions: [{Condition: 'CONTAINS', ConditionValue: event.dmoregionregioncode}]
        }
      ];
    }
    else{
      this.queryBody.GridFilters = [
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
      ];
    }

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getLandmarkBranchName(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmobranchbrname';
    this.queryBody.ProcessName = 'LMKMSTRBranch';
    this.queryBody.ColumnList = 'dmobranchbrcode,dmobranchbrname';
    this.queryBody.GridFilters = [
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
    ];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getPolicyTypes(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmoprodcategprodcatcode';
    this.queryBody.ProcessName = 'LMKMSTRProdCategory';
    this.queryBody.ColumnList = 'dmoprodcategprodcatcode,dmoprodcategprodcatdscr';
    this.queryBody.GridFilters = [
      {
        "GridConditions": [
          {
            "Condition": "CONTAINS",
            "ConditionValue": "insurance"
          }
        ],
        "DataField": "dmoprodcategactivity-dmoprodcategactivity",
        "LogicalOperator": "OR",
        "FilterType": "Column_Filter",
        "DataType": "KeyValueSearchBox"
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
    ];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  insuranceSearch(params: any) {
    return this.apiESaleyardService.post(`lmkinsurance/getInsuranceData`, params);
  }
  checkAppRole(processName:string){
    return this.apiESaleyardService.post('user/CheckAppRole?processName='+processName);
  }
}
