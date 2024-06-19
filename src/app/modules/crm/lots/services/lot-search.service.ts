import { Injectable } from '@angular/core';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap, take } from 'rxjs/operators';

import { ListviewService, ApiESaleyardService } from '@app/core';
import { FormGroup } from '@angular/forms';
import { analyzeAndValidateNgModules } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class LotSearchService {
  public currentLotId: any;
  public isNavigateNew=false;
  public vendorData = [];
  public vendorPICData = [];
  public buyerPICData = [];
  public BranchData = [];
  public Product:any;
  vendorCompany = '';
  buyerCompany = '';
  queryVendorBody: any;
  queryCustomerBody = {
    PageSize: 20,
    PageNumber: 0,
    SortColumn: 'dmocustmstrsapno',
    SortOrder: 'Asc',
    ProcessName: 'LMKMSTRCustomer',
    RefererProcessName: 'LMKLivestockLots',
    TimeZone: 0,
    SeparatorCondition: 'and',
    ColumnList: 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrblockflg',
    ViewName: 'View 1',
    GridFilters: [{
      DataField: 'dmocustmstrcustname1',
      FilterType: 'Column_Filter',
      LogicalOperator: 'Or',
      GridConditions: [{ Condition: 'CONTAINS', ConditionValue: '***input***' }]
    }]
  };

  queryBreadBody: any = {
    PageSize: 20,
    PageNumber: 0,
    SortColumn: 'dmoprodbrdprodbrdcode',
    SortOrder: 'Asc',
    ProcessName: 'LMKMSTRProductBreed',
    RefererProcessName: 'LMKLivestockLots',
    TimeZone: 0,
    SeparatorCondition: 'or',
    ColumnList: 'dmoprodbrdprodbrdcode,dmoprodbrdprodbrddscr',
    ViewName: 'View 1',
    GridFilters: [{
      GridConditions: [
        { Condition: "CONTAINS", ConditionValue: "Active" }
      ],
      DataField: "Active",
      LogicalOperator: "Or",
      FilterType: "State_Filter"
    }]
  };
  queryProductBody: any = {
    PageSize: 20,
    PageNumber: 0,
    SortColumn: 'dmoproductprodcode',
    SortOrder: 'Asc',
    ProcessName: 'LMKMSTRProduct',
    RefererProcessName: 'LMKLivestockLots',
    TimeZone: 0,
    SeparatorCondition: 'or',
    ColumnList: 'dmoproductprodcode,dmoproductproddscr',
    ViewName: 'View 1',
    GridFilters: [{
      GridConditions: [
        { Condition: "CONTAINS", ConditionValue: "Active" }
      ],
      DataField: "Active",
      LogicalOperator: "Or",
      FilterType: "State_Filter"
    }]
  };
  public customerData = [];
  public breadData = [];
  public ProductData = [];
  public buyerData = [];
  public productData = [];
  public conjuctionalAgentData = [];
  public conjuctionalAgent = new Subject<string>();
  sapNo: string;
  name: string;
  type: string;
  getVendorData(term: any, controlName: any) {
    let cmpCode = '';
    if(controlName == 'VendorId' && term.indexOf('-') > 0){
      const ar = term.split('-');
      cmpCode = ar[0];
      term = ar[1];
    }
    this.queryVendorBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmocustmstrsapno',
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRCustomer',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      IsColumnListOnly: true,
      ColumnList: 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrlstkbranch,dmocustmstrgstflg,dmocustmstracttype,dmocustmstrcustdombranch,dmocustmstrhobbyfarmer,dmocustmstrgstflg,dmocustmstrcustabn,dmocustmstrcompcode,dmocustmstrblockflg',
      ViewName: 'View 1',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: 'Vendor'
            }
          ],
          DataField: 'dmocustmstrcusttype',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },   {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: 'Livestock'
            }
          ],
          DataField: 'dmocustmstracttype',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },{
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: term
            }
          ],
          DataField: controlName == "VendorId" ? 'dmocustmstrsapno' : 'dmocustmstrcustname1-dmocustmstrcustname2',
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
    if(cmpCode && cmpCode != ''){
      this.queryVendorBody.GridFilters.push({
        GridConditions: [
          {
            Condition: 'CONTAINS',
            ConditionValue: cmpCode
          }
        ],
        DataField: 'dmocustmstrcompcode',
        LogicalOperator: 'Or',
        FilterType: 'Column_Filter'
      });
    }
    return this.listviewService.GridDatalmk(this.queryVendorBody);
  }
  getVendorPicData(term: any) {
    const queryVendorPiCBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmocuspiccustpic',
      SortOrder: 'Asc',
      ProcessName: 'LMKConfigCustomerPIC',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: '',
      ViewName: 'View 1',
      GridFilters: [
       {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: term
            }
          ],
          DataField: 'dmocuspiccustpic',
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
    return this.listviewService.GridData(queryVendorPiCBody,true);
  }
  getBranchData(term: any,dataField: string = 'dmobranchbrname-dmobranchbrcode',condition: string = 'CONTAINS') {
    const queryBranchBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmobranchbrname',
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRBranch',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmobranchbrcode,dmobranchbrname,dmobranchcompcode',
      ViewName: 'View 1',
      GridFilters: [
       {
          GridConditions: [
            {
              Condition: condition,
              ConditionValue: term
            }
          ],
          DataField: dataField,
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
    if(this.buyerCompany && this.buyerCompany != ''){
      queryBranchBody.GridFilters.push({
        GridConditions: [
          { Condition: "EQUAL", ConditionValue: this.buyerCompany }
        ],
        DataField: "dmobranchcompcode",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    return this.listviewService.GridData(queryBranchBody,false);
  }
  getVendorBranchData(term: any,dataField: string = 'dmobranchbrname-dmobranchbrcode',condition: string = 'CONTAINS') {
    const queryBranchBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmobranchbrname',
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRBranch',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmobranchbrcode,dmobranchbrname,dmobranchcompcode',
      ViewName: 'View 1',
      GridFilters: [
       {
          GridConditions: [
            {
              Condition: condition,
              ConditionValue: term
            }
          ],
          DataField: dataField,
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
    if(this.vendorCompany && this.vendorCompany != ''){
      queryBranchBody.GridFilters.push({
        GridConditions: [
          { Condition: "EQUAL", ConditionValue: this.vendorCompany }
        ],
        DataField: "dmobranchcompcode",
        LogicalOperator: "Or",
        FilterType: "Column_Filter"
      })
    }
    return this.listviewService.GridData(queryBranchBody,false);
  }
  getBuyerPicData(term: any) {
    const queryVendorPiCBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmocuspiccustpic',
      SortOrder: 'Asc',
      ProcessName: 'LMKConfigCustomerPIC',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmocuspiccustpic',
      ViewName: 'View 1',
      GridFilters: [
       {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: term
            }
          ],
          DataField: 'dmocuspiccpicsapno',
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
    return this.listviewService.GridData(queryVendorPiCBody,true);
  }

  getBuyerData(term: any, controlName: any) {
    let cmpCode = '';
    if(controlName == 'BuyerId' && term.indexOf('-') > 0){
      const ar = term.split('-');
      cmpCode = ar[0];
      term = ar[1];
    }
    this.queryVendorBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmocustmstrsapno',
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRCustomer',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrlstkbranch,dmocustmstrgstflg,dmocustmstracttype,dmocustmstrcustdombranch,dmocustmstrcompcode,dmocustmstrblockflg',
      ViewName: 'View 1',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: 'Buyer'
            }
          ],
          DataField: 'dmocustmstrcusttype',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },   {
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: 'Livestock'
            }
          ],
          DataField: 'dmocustmstracttype',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },{
          GridConditions: [
            {
              Condition: 'CONTAINS',
              ConditionValue: term
            }
          ],
          DataField: controlName == "BuyerId" ? 'dmocustmstrsapno' : 'dmocustmstrcustname1-dmocustmstrcustname2',
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
    if(cmpCode && cmpCode != ''){
      this.queryVendorBody.GridFilters.push({
        GridConditions: [
          {
            Condition: 'CONTAINS',
            ConditionValue: cmpCode
          }
        ],
        DataField: 'dmocustmstrcompcode',
        LogicalOperator: 'Or',
        FilterType: 'Column_Filter'
      });
    }
    return this.listviewService.GridDatalmk(this.queryVendorBody);
  }
  private getCongunctionBody(term: any) {
    this.queryCustomerBody = {
      PageSize: 20,
      PageNumber: 0,
      SortColumn: 'dmocustmstrsapno',
      SortOrder: 'Asc',
      ProcessName: 'LMKMSTRCustomer',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      SeparatorCondition: 'and',
      ColumnList: 'dmocustmstrsapno,dmocustmstrcustname1,dmocustmstrblockflg',
      ViewName: 'View 1',
      GridFilters: [{
        DataField: 'dmocustmstrcustname1-dmocustmstrsapno',
        FilterType: 'Column_Filter',
        LogicalOperator: 'Or',
        GridConditions: [{ Condition: 'CONTAINS', ConditionValue: term }]
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
    return this.listviewService.GridDatalmk(this.queryCustomerBody);
  }



  customerSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '' || term.length <= 2) {
          return [];
        } else {
          this.queryCustomerBody.GridFilters = [];
          this.queryCustomerBody.GridFilters = [{
            DataField: 'dmocustmstrsapno-dmocustmstrcustname1',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{ Condition: 'CONTAINS', ConditionValue: term }]
          },
          {
            GridConditions: [
              { Condition: "CONTAINS", ConditionValue: "Active" }
            ],
            DataField: "Active",
            LogicalOperator: "Or",
            FilterType: "State_Filter"
          },
          {
            GridConditions: [
              {
                Condition: 'CONTAINS',
                ConditionValue: 'Livestock'
              }
            ],
            DataField: 'dmocustmstracttype',
            LogicalOperator: 'Or',
            FilterType: 'Column_Filter'
          }
        ];
          return this.listviewService.GridDatalmk(this.queryCustomerBody)
            .pipe(
              tap(res => this.customerData = res.Data),
              map((res: any) => res.Data
                // .filter(v => v.dmocustmstrcustname1.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.dmocustmstrcustname1)
              ));
        }
      }
      )
    );
  }

  breadSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '' || term.length <= 1) {
          return [];
        } else {
          this.queryBreadBody.GridFilters = [];
          this.queryBreadBody.GridFilters = [{
            DataField: 'dmoprodbrdprodbrdcode-dmoprodbrdprodbrddscr',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{ Condition: 'CONTAINS', ConditionValue: term }]
          },
          {
            GridConditions: [
              { Condition: "CONTAINS", ConditionValue: "Active" }
            ],
            DataField: "Active",
            LogicalOperator: "Or",
            FilterType: "State_Filter"
          }
        ];
          return this.listviewService.GridData(this.queryBreadBody,false)
            .pipe(
              tap(res => this.breadData = res.Data),
              map((res: any) => res.Data
                // .filter(v => v.dmoprodbrdprodbrddscr.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.dmoprodbrdprodbrddscr)
              ));
        }
      }
      )
    );
  }

  ProductSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '' || term.length <= 1) {
          return [];
        } else {
          this.queryProductBody.GridFilters = [];
          this.queryProductBody.GridFilters = [{
            DataField: 'dmoproductproddscr-dmoproductprodcode',
            FilterType: 'Column_Filter',
            LogicalOperator: 'Or',
            GridConditions: [{ Condition: 'CONTAINS', ConditionValue: term }]
          },
          {
            GridConditions: [
              { Condition: "CONTAINS", ConditionValue: "Active" }
            ],
            DataField: "Active",
            LogicalOperator: "Or",
            FilterType: "State_Filter"
          }
        ];
          return this.listviewService.GridData(this.queryProductBody,false)
            .pipe(
              tap(res => this.ProductData = res.Data),
              map((res: any) => res.Data
                // .filter(v => v.dmoproductproddscr.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.dmoproductproddscr)
              ));
        }
      }
      )
    );
  }

  branchSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '' || term.length <= 2) {
          return [];
        } else {
          return this.getBranchData(term)
            .pipe(
              tap(res => this.BranchData = res.Data),
              map((res: any) => res.Data
              ));
        }
      }
      )
    );
  }
  vendorBranchSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term === '' || term.length <= 2) {
          return [];
        } else {
          return this.getVendorBranchData(term)
            .pipe(
              tap(res => this.BranchData = res.Data),
              map((res: any) => res.Data
              ));
        }
      }
      )
    );
  }

  constructor(
    private listviewService: ListviewService,
    private apiESaleyardService: ApiESaleyardService
  ) { }

  vendorIdSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term != '' || term.length > 2
          ? this.getVendorData(term, "VendorId")
            .pipe(
              tap(res => this.vendorData = res.Data),
              map((res: any) => res.Data
                .map(item =>item.dmocustmstrcompcode_KEY + '-' + item.dmocustmstrsapno)
              ))
          : []
      )
    );
  }

  vendorNameSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term === '' || term.length<=2
          ? []
          : this.getVendorData(term,"VendorName")
            .pipe(
              tap(res => this.vendorData = res.Data),
              map((res: any) => res.Data
               // .filter(v => v.dmocustmstrcustname1.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.dmocustmstrcustname1)
              ))
      )
    );
  }


  buyerIdSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term === '' || term.length<=2
          ? []
          : this.getBuyerData(term,"BuyerId")
            .pipe(
              tap(res => this.buyerData = res.Data),
              map((res: any) => res.Data
               // .filter(v => v.dmocustmstrsapno.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.dmocustmstrcompcode_KEY + '-' + item.dmocustmstrsapno)
              ))
      )
    );
  }

  buyerNameSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term === '' || term.length<=2
          ? []
          : this.getBuyerData(term,"BuyerName")
            .pipe(
              tap(res => this.buyerData = res.Data),
              map((res: any) => res.Data
                //.filter(v => v.dmocustmstrcustname1.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.dmocustmstrcustname1)
              ))
      )
    );
  }

  productSearch = (text$: Observable<string>, transactionId: string) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term === '' || term.length<=0
          ? []
          : this.apiESaleyardService.post(`crmlot/lotProduct/${encodeURIComponent(transactionId)}/${null}`)
            .pipe(
              tap(res => this.productData = res.ProductMasterData),
              map((res: any) => res.ProductMasterData
                .filter(v => v.PMProductCode.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.PMProductCode)
              ))
      )
    );
  }

  breedSearch = (text$: Observable<string>, transactionId: string) => {        
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term === '' || term.length<=0
          ? []
          : this.apiESaleyardService.post(`crmlot/lotProduct/${encodeURIComponent(transactionId)}/${this.Product}`)
            .pipe(
              map((res: any) => res.productBreedData
                .filter(v => v.PBProductBreedCode.toLowerCase().indexOf(term.toLowerCase()) > -1)
                .map(item => item.PBProductBreedCode)
              ))
      )
    );
  }
  vendorPicSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term != '' || term.length > 2
          ? this.getVendorPicData(term)
            .pipe(
              tap(res => this.vendorPICData = res.Data),
              map((res: any) => res.Data
                .map(item => item.dmocuspiccustpic)
              ))
          : []
      )
    );
  }
  buyerPicSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term != '' || term.length > 2
          ? this.getBuyerPicData(term)
            .pipe(
              tap(res => this.buyerPICData = res.Data),
              map((res: any) => res.Data
                .map(item => item.dmocuspiccustpic)
              ))
          : []
      )
    );
  }

  getVendorPIC(vendorId: string): Observable<any> {
    const queryBody = {
      PageSize: -1,
      PageNumber: -1,
      SortColumn: 'dmocuspiccustpic',
      SortOrder: 'Asc',
      ProcessName: 'LMKConfigCustomerPIC',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmocuspiccustpic',
      ViewName: 'View 1',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: vendorId
            }
          ],
          DataField: 'dmocuspiccpicsapno',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },{
          GridConditions: [{
            Condition: 'EQUAL',
            ConditionValue: 'Active'
          }],
          DataField: 'WFOSDISPNAME',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter',          
        }
      ]
    };

    return this.listviewService.GridData(queryBody, false)
      .pipe(
        map(res => res.Data)
      );
  }

  getBuyerPIC(buyerId: string): Observable<any> {
    const queryBody = {
      PageSize: -1,
      PageNumber: -1,
      SortColumn: 'dmocuspiccustpic',
      SortOrder: 'Asc',
      ProcessName: 'LMKConfigCustomerPIC',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmocuspiccustpic',
      ViewName: 'View 1',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: buyerId
            }
          ],
          DataField: 'dmocuspiccpicsapno',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        }
      ]
    };

    return this.listviewService.GridData(queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getFeesCharges() {
    return this.apiESaleyardService.post(`crmlot/getFeesCharges`);
  }

  getLotProduct(transactionId: string) {
    return this.apiESaleyardService.post(`crmlot/lotProduct/${encodeURIComponent(transactionId)}/${null}`);
  }
  lotNavigation(parentTransctionId: any, navigationNo: any) {
    return this.apiESaleyardService.post(`crmlot/lotNavigation/${parentTransctionId}/${navigationNo}`, null);
  }
  getsaleStageData(parentTransctionId: any) {
    return this.apiESaleyardService.get(`crmsales/GetLotStatusUsingParentTrnsctnID/${encodeURIComponent(parentTransctionId)}`);
  }
  conjuctionalAgentSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term =>
        term !='' || term.length>2          
          ? this.getCongunctionBody(term)
            .pipe(
              tap(res => this.vendorData = res.Data),
              map((res: any) => res.Data
                .map(item => item.dmocustmstrcustname1)
              ))
              : []
      )
    );
  }

  createNewAlias(alias:any,SAPNo:any,Saleyard:any){
    return this.apiESaleyardService.get(`crmlot/createNewAlias/${alias}/${SAPNo}/${Saleyard}`, null);
  }

  getSalyardCodeByName(SaleYardName:any){
    return this.apiESaleyardService.get(`crmlot/GetSaleYardCodeByName/${encodeURIComponent(SaleYardName)}`, null);
  }

  ValidateAlias(aliasType:any,SAPNo:any,alias:any,saleYardCode:any){
    return this.apiESaleyardService.get(`crmlot/ValidateAlias/${aliasType}/${SAPNo}/${alias}/${saleYardCode}`, null);
  }
  validateLotSummaryRecord(data) {
    return this.apiESaleyardService.post('crmlot/ValidateLotSummaryRecord', data);
  }

  getMaxLotIDBasedOnPrntTrnsctionId(parentTransctionId: any) {
    return this.apiESaleyardService.get(`crmlot/getMaxLotIDBasedOnPrntTrnsctionId/${encodeURIComponent(parentTransctionId)}`);
  }

 BulkUpdateVenderInformation(data) {    
    return this.apiESaleyardService.post('CRMLot/BulkUpdateVendorInformation', data);
  }

  BulkUpdateBuyerInformation(data) {    
    return this.apiESaleyardService.post('CRMLot/BulkUpdateBuyerInformation', data);
  }
  
  agencySearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' && term.length > 2
          ? this.GetAgentAgencyList('Agency', term.toString(), this.sapNo)
          : []
      )
    );
  }

  agentSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term =>
        term !== '' && term.length > 2
          ? this.GetAgentAgencyList('Agent', term.toString(), this.sapNo)
          : []
      )
    );
  }
//Chanegs for lot agent agency associations
  GetAgentAgencyList(Type: any, term: any, AgentAgencySap: any,transactionId:string = null) {
    if (AgentAgencySap === undefined) {
      AgentAgencySap = '';
    }
    return this.apiESaleyardService.get(`crmlot/GetAgentAgencyList/${Type}/${term}/${AgentAgencySap}/null/${transactionId}`, null);
  }

  getBuyerRebateAgencyList(LotTransactionID: string) {
    const bodyData: any = {
      LotTransactionID
    };
    return this.apiESaleyardService.post('crmlot/getBuyerRebateAgencyList', bodyData);
  }

  getBuyerRebateAgentList(LotTransactionID: string, AgencySapNo: string = '') {
    const bodyData: any = {
      LotTransactionID,
      AgencySapNo
    };
    return this.apiESaleyardService.post('crmlot/getBuyerRebateAgentList', bodyData);
  }

  createDuplicateLot(TransctionId: any) {
    return this.apiESaleyardService.post(`crmlot/createDuplicateLot/${encodeURIComponent(TransctionId)}`);
  }
  getGstApplicable(ProductCode: string) {
    const queryBody = {
      PageSize: -1,
      PageNumber: -1,
      SortColumn: 'dmoproductgst',
      SortOrder: 'desc',
      ProcessName: 'LMKMSTRProduct',
      RefererProcessName: 'LMKLivestockLots',
      TimeZone: 0,
      ColumnList: 'dmoproductgst',
      isColumnListOnly: true,
      isDistinct: true,
      ViewName: 'View 1',
      GridFilters: [
        {
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: ProductCode
            }
          ],
          DataField: 'dmoproductprodcode',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        },{
          GridConditions: [{
            Condition: 'EQUAL',
            ConditionValue: 'Active'
          }],
          DataField: 'WFOSDISPNAME',
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter',          
        }
      ]
    };

    return this.listviewService.GridData(queryBody)
      .pipe(
        map(res => res.Data)
      );
  }
}
