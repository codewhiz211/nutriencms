import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ListviewService, ApiESaleyardService } from '@app/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class LivestockService {
  saleProcessorRole =  environment.Setting.saleProcessorRole;//DropDown Bind User By Role Ticket - #966 - Biresh
  queryBody: any = {
    PageSize: -1,
    PageNumber: -1,
    SortColumn: '',
    SortOrder: 'Asc',
    ProcessName: '',
    TimeZone: 0,
    ColumnList: '',
    ViewName: 'View 1',
    IsColumnListOnly:true,
    IsDistinct:true,
    GridFilters: []
  };
   //DropDown Filter Ticket - #893 - Biresh
  userQueryBody: any = {
    PageSize: 0,
    PageNumber: 0,
    SortColumn: '',
    SortOrder: 'Desc',
    TimeZone: 0,
    Roles: '',
    GroupId: ''
  }
 // Add new Form Livestock Documents Ticket - #1002
  documentQueryBody: any = {
    PageSize: 0,
    PageNumber: 0,
    SortColumn: '',
    SortOrder: 'Desc',    
    GridFilters: []
  }

  stateSelected : string = '';
  postCodeSelected: string = '';

  constructor(
    private listviewService: ListviewService,
    private apiESaleyardService: ApiESaleyardService
  ) { }

  getAgent(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmoagentagntname';
    this.queryBody.ProcessName = 'LMKMSTRAgent';
    this.queryBody.ColumnList = 'dmoagentagntid,dmoagentagntname';
    this.queryBody.GridFilters = [];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getAgency(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmoagencyagncname1';
    this.queryBody.ProcessName = 'LMKMSTRAgency';
    this.queryBody.ColumnList = 'dmoagencyagncsapno,dmoagencyagncname1';
    this.queryBody.GridFilters = [];


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
    this.queryBody.GridFilters = [{
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

  getLandmarkStatehName(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.IsColumnListOnly = true,
    this.queryBody.IsDistinct = true,
    this.queryBody.SortColumn = 'dmolcnlcnstate';
    this.queryBody.SortOrder = 'ASC';
    this.queryBody.ProcessName = 'LMKMSTRLocation';
    this.queryBody.ColumnList = 'dmolcnlcnstate';
    this.queryBody.GridFilters = [];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }
  
  getLandmarkPostCode(): Observable<any> {
    this.queryBody.PageNumber = 1;
    this.queryBody.PageSize = 100;
    this.queryBody.IsColumnListOnly = true,
    this.queryBody.IsDistinct = true,
    this.queryBody.SortColumn = 'dmolcnlcnpcode';
    this.queryBody.SortOrder = 'ASC';
    this.queryBody.ProcessName = 'LMKMSTRLocation';
    this.queryBody.ColumnList = 'dmolcnlcnpcode';
    this.queryBody.GridFilters = [];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }
  
  getLandmarkSuburb(): Observable<any> {
    this.queryBody.PageNumber = 1;
    this.queryBody.PageSize = 100;
    this.queryBody.IsColumnListOnly = true,
    this.queryBody.IsDistinct = true,
    this.queryBody.SortColumn = 'dmolcnlcncity';
    this.queryBody.SortOrder = 'ASC';
    this.queryBody.ProcessName = 'LMKMSTRLocation';
    this.queryBody.ColumnList = 'dmolcnlcncity';
    this.queryBody.GridFilters = [];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getTransactionTypes(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmotrnstyptranstypedscr';
    this.queryBody.ProcessName = 'LMKMSTRTransactionType';
    this.queryBody.ColumnList = 'dmotrnstyptranstypecode,dmotrnstyptranstypedscr';
    this.queryBody.GridFilters = [{
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
      "GridConditions": [
        {
          "Condition": "EQUAL",
          "ConditionValue": "L"
        }
      ],
      "DataField": "dmotrnstyptranstypeact",
      "LogicalOperator": "Or",
      "FilterType": "Column_Filter"
    }
];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getSaleTypes(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmosaletypesaletypedscr';
    this.queryBody.ProcessName = 'LMKMSTRSaleType';
    this.queryBody.ColumnList = 'dmosaletypesaletypecode,dmosaletypesaletypedscr';
    this.queryBody.GridFilters = [];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

   //DropDown Filter Ticket - #966 - Biresh
  getUserByRole(): Observable<any> {
    this.userQueryBody.PageSize = 500;
    this.userQueryBody.PageNumber = 0;
    this.userQueryBody.SortColumn = '';
    this.userQueryBody.SortOrder = 'Desc';
    this.userQueryBody.TimeZone = 0;
    this.userQueryBody.Roles = this.saleProcessorRole;
    this.userQueryBody.GroupId = "1145";

    return this.apiESaleyardService.postC2MGetUser('user/icewebapi',this.userQueryBody)
      .pipe(
        map(res => res.data.response.UserInfo)
      );
  }

  getSaleyard(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmosaleyardsyname';
    this.queryBody.ProcessName = 'LMKMSTRSaleyard';
    this.queryBody.ColumnList = 'dmosaleyardsycode,dmosaleyardsyname';
    this.queryBody.GridFilters = [];

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }
// Commentd due to change Control - #819
  // getVendorTradingNames(): Observable<any> {
  //   this.queryBody.PageNumber = 0;
  //   this.queryBody.PageSize = 99;
  //   this.queryBody.SortColumn = 'dmocustmstrcustname1';
  //   this.queryBody.ProcessName = 'LMKMSTRCustomer';
  //   this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1';
  //   this.queryBody.GridFilters = [{
  //     DataField: 'dmocustmstrcusttype',
  //     FilterType: 'Alph_Filter',
  //     LogicalOperator: 'Or',
  //     GridConditions: [{Condition: 'CONTAINS', ConditionValue: 'Vendor'}]
  //   }];
  //   return this.listviewService.GridData(this.queryBody)
  //     .pipe(
  //       map(res => res.Data)
  //     );
  // }
  // end - #819
  // Vendor & Buyer Trading Name Serarch Control Fix - #819
  vendortrdnameSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return of([]);
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 50;
          this.queryBody.SortColumn = 'dmocustmstrcustname1';
          this.queryBody.ProcessName = 'LMKMSTRCustomer';
          this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrcustname2';
          this.queryBody.GridFilters = [
            {
              DataField: 'dmocustmstrcusttype',
              FilterType: 'Alph_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: 'Vendor'}]
            },
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

  buyertrdnameSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return of([]);
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 50;
          this.queryBody.SortColumn = 'dmocustmstrcustname1';
          this.queryBody.ProcessName = 'LMKMSTRCustomer';
          this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrcustname2';
          this.queryBody.GridFilters = [
            {
              DataField: 'dmocustmstrcusttype',
              FilterType: 'Alph_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: 'Buyer'}]
            },
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
// end - #819
// Commentd due to change Control - #819
  // getBuyerTradingNames(): Observable<any> {
  //   this.queryBody.PageNumber = 0;
  //   this.queryBody.PageSize = 99;
  //   this.queryBody.SortColumn = 'dmocustmstrcustname1';
  //   this.queryBody.ProcessName = 'LMKMSTRCustomer';
  //   this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1';
  //   this.queryBody.GridFilters = [{
  //     DataField: 'dmocustmstrcusttype',
  //     FilterType: 'Alph_Filter',
  //     LogicalOperator: 'Or',
  //     GridConditions: [{Condition: 'CONTAINS', ConditionValue: 'Buyer'}]
  //   }];
  //   return this.listviewService.GridData(this.queryBody)
  //     .pipe(
  //       map(res => res.Data)
  //     );
  // }
// end - 819
  getThirdParty(): Observable<any> {
    this.queryBody.PageNumber = -1;
    this.queryBody.PageSize = -1;
    this.queryBody.SortColumn = 'dmocustmstrcustname1';
    this.queryBody.ProcessName = 'LMKMSTRCustomer';
    this.queryBody.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1';
    this.queryBody.GridFilters = [{
      DataField: 'dmocustmstrcusttype',
      FilterType: 'Alph_Filter',
      LogicalOperator: 'Or',
      GridConditions: [{Condition: 'CONTAINS', ConditionValue: '3rd Party'}]
    }];
    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }
  prmsSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return of([]);
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 50;
          this.queryBody.IsColumnListOnly = true,
          this.queryBody.SortColumn = 'dmocustmstrprmsref';
          this.queryBody.SortOrder = 'ASC';
          this.queryBody.ProcessName = 'LMKMSTRCustomer';
          this.queryBody.ColumnList = 'dmocustmstrprmsref';
          this.queryBody.GridFilters = [{
            DataField: 'dmocustmstrprmsref',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
          }];
          return this.listviewService.GridData(this.queryBody,false)
            .pipe(
              map((res: any) => res.Data.map(item => item.dmocustmstrprmsref))
            );
        }
      })
    );
  }

  abnSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return of([]);
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 50;
          this.queryBody.IsColumnListOnly = true,
          this.queryBody.SortColumn = 'dmocustmstrcustabn';
          this.queryBody.SortOrder = 'ASC';
          this.queryBody.ProcessName = 'LMKMSTRCustomer';
          this.queryBody.ColumnList = 'dmocustmstrcustabn';
          this.queryBody.GridFilters = [{
            DataField: 'dmocustmstrcustabn',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
          }];
          return this.listviewService.GridData(this.queryBody,false)
            .pipe(
              map((res: any) => res.Data.map(item => item.dmocustmstrcustabn))
            );
        }
      })
    );
  }

  suburbSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return of([]);
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 99;
          this.queryBody.SortColumn = 'dmolcnlcncity';
          this.queryBody.ProcessName = 'LMKMSTRLocation';
          this.queryBody.ColumnList = 'dmolcnlcncity';
          this.queryBody.GridFilters = [{
            DataField: 'dmolcnlcncity',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
          }];
          if(this.stateSelected !== '' && this.postCodeSelected !== '' &&  this.postCodeSelected !== null){
            this.queryBody.GridFilters = [{
              DataField: 'dmolcnlcncity',
              FilterType: 'Column_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
            },{
              DataField: 'dmolcnlcnstate',
              FilterType: 'Alph_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: this.stateSelected}]
            },{
              DataField: 'dmolcnlcnpcode',
              FilterType: 'Alph_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: this.postCodeSelected}]
            }
          ];
          }else if(this.stateSelected !== ''){
            this.queryBody.GridFilters = [{
              DataField: 'dmolcnlcncity',
              FilterType: 'Column_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
            },{
              DataField: 'dmolcnlcnstate',
              FilterType: 'Alph_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: this.stateSelected}]
            }
          ];
          }else if(this.postCodeSelected !== ''){
            this.queryBody.GridFilters = [{
              DataField: 'dmolcnlcncity',
              FilterType: 'Column_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
            },{
              DataField: 'dmolcnlcnpcode',
              FilterType: 'Alph_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: this.postCodeSelected}]
            }
          ];
          }else{
            this.queryBody.GridFilters = [{
              DataField: 'dmolcnlcncity',
              FilterType: 'Column_Filter',
              LogicalOperator: 'Or',
              GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
            }
          ];
          }
          console.log(this.queryBody)
          return this.listviewService.GridData(this.queryBody,false)
            .pipe(
              map((res: any) => res.Data.map(item => item.dmolcnlcncity))
            );
        }
      })
    );
  }

  postCodeSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '') {
          return of([]);
        } else {
          this.queryBody.PageNumber = 0;
          this.queryBody.PageSize = 99;
          this.queryBody.SortColumn = 'dmolcnlcnpcode';
          this.queryBody.ProcessName = 'LMKMSTRLocation';
          this.queryBody.ColumnList = 'dmolcnlcnpcode';
        if(this.stateSelected !== '' || this.stateSelected !== undefined){
          this.queryBody.GridFilters = [{
            DataField: 'dmolcnlcnpcode',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
          },{
            DataField: 'dmolcnlcnstate',
            FilterType: 'Alph_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{Condition: 'CONTAINS', ConditionValue: this.stateSelected}]
          }
        ];
        }else{
          this.queryBody.GridFilters = [{
            DataField: 'dmolcnlcnpcode',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
          }
        ];
        }
          return this.listviewService.GridData(this.queryBody,false)
            .pipe(
              map((res: any) => res.Data.map(item => item.dmolcnlcnpcode))
            );
        }
      })
    );
  }


  // sapNoSearch = (text$: Observable<string>) => {
  //   const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

  //   return debouncedText$.pipe(
  //     switchMap(term => {
  //       if (term === '') {
  //         return of([]);
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
          return of([]);
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

  agentSearch(params: any) {
    return this.apiESaleyardService.post('livestocksearch/getAgentProcessData', params);
  }

  accountSearch(params: any) {
    return this.apiESaleyardService.post('livestocksearch/getAccountProcessData', params);
  }

  livestockSaleSearch(params: any) {
    return this.apiESaleyardService.post('livestocksearch/getLiveStockSaleProcessData', params);
  }
   // Add new Form Livestock Documents Ticket - #1002
  livestockDocumentSearch(params: any) {
    return this.apiESaleyardService.post('livestocksearch/getLiveStockDcument/Grid', params);
  }
// For Based On Agency Agent
getAgentBasedOnAgency(AgencySapNo): Observable<any> {
  this.queryBody.PageNumber = -1;
  this.queryBody.PageSize = -1;
  this.queryBody.SortColumn = 'dmoagentagntname';
  this.queryBody.ProcessName = 'LMKMSTRAgent';
  this.queryBody.ColumnList = 'dmoagentagntid,dmoagentagntname';
  this.queryBody.GridFilters = [{
    DataField: 'dmoagentagencsapno',
    FilterType: 'Alph_Filter',
    LogicalOperator: 'Or',
    GridConditions: [{Condition: 'CONTAINS', ConditionValue: AgencySapNo}]
  }];

  return this.listviewService.GridData(this.queryBody,false)
    .pipe(
      map(res => res.Data)
    );
}

// For Based On State PostCode
// getPostCodeBasedOnState(state): Observable<any> {
//   this.queryBody.PageNumber = -1;
//   this.queryBody.PageSize = -1;
//   this.queryBody.IsColumnListOnly = true,
//   this.queryBody.IsDistinct = true,
//   this.queryBody.SortColumn = 'dmolcnlcnpcode';
//   this.queryBody.SortOrder = 'ASC';
//   this.queryBody.ProcessName = 'LMKMSTRLocation';
//   this.queryBody.ColumnList = 'dmolcnlcnpcode';
//   this.queryBody.GridFilters = [{
//     DataField: 'dmolcnlcnstate',
//     FilterType: 'Alph_Filter',
//     LogicalOperator: 'Or',
//     GridConditions: [{Condition: 'CONTAINS', ConditionValue: state}]
//   }];

//   return this.listviewService.GridData(this.queryBody)
//     .pipe(
//       map(res => res.Data)
//     );
// }

// For Based On State Suburb
// getSuburbBasedOnState(State): Observable<any> {
//   this.queryBody.PageNumber = -1;
//   this.queryBody.PageSize = -1;
//   this.queryBody.IsColumnListOnly = true,
//   this.queryBody.IsDistinct = true,
//   this.queryBody.SortColumn = 'dmolcnlcncity';
//   this.queryBody.SortOrder = 'ASC';
//   this.queryBody.ProcessName = 'LMKMSTRLocation';
//   this.queryBody.ColumnList = 'dmolcnlcncity';
//   this.queryBody.GridFilters = [{
//     DataField: 'dmolcnlcnstate',
//     FilterType: 'Alph_Filter',
//     LogicalOperator: 'Or',
//     GridConditions: [{Condition: 'CONTAINS', ConditionValue: State}]
//   }];

//   return this.listviewService.GridData(this.queryBody)
//     .pipe(
//       map(res => res.Data)
//     );
// }

// For Based On PostCode Suburb
// getSuburbBasedOnPostCode(PostCode): Observable<any> {
//   this.queryBody.PageNumber = -1;
//   this.queryBody.PageSize = -1;
//   this.queryBody.IsColumnListOnly = true,
//   this.queryBody.IsDistinct = true,
//   this.queryBody.SortColumn = 'dmolcnlcncity';
//   this.queryBody.SortOrder = 'ASC';
//   this.queryBody.ProcessName = 'LMKMSTRLocation';
//   this.queryBody.ColumnList = 'dmolcnlcncity';
//   this.queryBody.GridFilters = [{
//     DataField: 'dmolcnlcnpcode',
//     FilterType: 'Alph_Filter',
//     LogicalOperator: 'Or',
//     GridConditions: [{Condition: 'CONTAINS', ConditionValue: PostCode}]
//   }];

//   return this.listviewService.GridData(this.queryBody)
//     .pipe(
//       map(res => res.Data)
//     );
// }
 // Add new Form Livestock Documents Ticket - #1002
saleNoSearch = (text$: Observable<string>) => {
  const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

  return debouncedText$.pipe(
    switchMap(term => {
      if (term === '') {
        return of([]);
      } else {
        this.queryBody.PageNumber = 0;
        this.queryBody.PageSize = 50;
        this.queryBody.IsColumnListOnly = true,
        this.queryBody.SortColumn = 'dmocrmheaderinfsaleid';
        this.queryBody.SortOrder = 'ASC';
        this.queryBody.ProcessName = 'LMKLivestockSales';
        this.queryBody.ColumnList = 'dmocrmheaderinfsaleid';
        this.queryBody.GridFilters = [{
          DataField: 'dmocrmheaderinfsaleid',
          FilterType: 'Column_Filter',
          LogicalOperator: 'Or',
          GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
        }];
        return this.listviewService.GridData(this.queryBody,false)
          .pipe(
            map((res: any) => res.Data.map(item => item.dmocrmheaderinfsaleid))
          );
      }
    })
  );
}
sapNoSearch = (text$: Observable<string>) => {
  const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

  return debouncedText$.pipe(
    switchMap(term => {
      if (term === '') {
        return of([]);
      } else {
        this.queryBody.PageNumber = 0;
        this.queryBody.PageSize = 50;
        this.queryBody.IsColumnListOnly = true,
        this.queryBody.SortColumn = 'dmocustmstrsapno';
        this.queryBody.SortOrder = 'ASC';
        this.queryBody.ProcessName = 'LMKMSTRCustomer';
        this.queryBody.ColumnList = 'dmocustmstrsapno';
        this.queryBody.GridFilters = [{
          DataField: 'dmocustmstrsapno',
          FilterType: 'Column_Filter',
          LogicalOperator: 'Or',
          GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
        }];
        return this.listviewService.GridData(this.queryBody,false)
          .pipe(
            map((res: any) => res.Data.map(item => item.dmocustmstrsapno))
          );
      }
    })
  );
}
docNoSearch = (text$: Observable<string>) => {
  const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

  return debouncedText$.pipe(
    switchMap(term => {
      if (term === '') {
        return of([]);
      } else {
        this.documentQueryBody.PageNumber = 0;
        this.documentQueryBody.PageSize = 50;
        this.documentQueryBody.SortColumn = 'DocumentNumber';
        this.documentQueryBody.SortOrder = 'ASC';
        this.documentQueryBody.GridFilters = [{
          DataField: 'DocumentNumber',
          FilterType: 'Column_Filter',
          LogicalOperator: 'Or',
          GridConditions: [{Condition: 'CONTAINS', ConditionValue: term}]
        }];
        return this.apiESaleyardService.post('livestocksearch/getLiveStockDcument/Filter', this.documentQueryBody)
          .pipe(
            map((res: any) => res.Data.map(item => item.DocumentNumber))
          );
      }
    })
  );
}
getDocType(): Observable<any> {
  this.documentQueryBody.PageNumber = -1;
  this.documentQueryBody.PageSize = -1;
  this.documentQueryBody.SortColumn = 'DocumentType';
  this.documentQueryBody.SortOrder = 'ASC';
  this.queryBody.GridFilters = [];

  return this.apiESaleyardService.post('livestocksearch/getLiveStockDcument/Filter', this.documentQueryBody)
    .pipe(
      map(res => res.Data)
    );
}
checkAppRole(processName:string){
  return this.apiESaleyardService.post('user/CheckAppRole?processName='+processName);
}
}
