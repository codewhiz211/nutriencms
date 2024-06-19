import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ListviewService } from './list-view.service';

import { GridConfiguration, Condition, GridCondition, FilterType, GridFilter } from '..';
import { environment } from '@env/environment';

@Injectable({providedIn: 'root'})
export class SearchService {

  private _timezone = new Date().getTimezoneOffset();

  private _PICList = new BehaviorSubject<string[]>([]);

  private _categories = new BehaviorSubject<Array<CustomDropdown>>([]);
  private _products = new BehaviorSubject<Array<CustomDropdown>>([]);
  private _breeds = new BehaviorSubject<Array<CustomDropdown>>([]);

  get PICList() { return this._PICList.asObservable() }

  get productCategories(): Observable<Array<CustomDropdown>> { return this._categories.asObservable() }
  get products(): Observable<Array<CustomDropdown>> { return this._products.asObservable() }
  get productBreeds(): Observable<Array<CustomDropdown>> { return this._breeds.asObservable() }

  constructor(
    private listView: ListviewService, 
    private http: HttpClient,
    ) {}

  public getLocationInfo(input: string): Observable<CustomDropdown[]> {
    const config = this._generateGridConfig({
      ProcessName: 'LMKMSTRLocation',
      ColumnList: 'dmolcnlcnpcode,dmolcnlcncity,dmolcnlcnstate',
    });
    config.GridFilters.push(this._generateGridFilter('Global_Search', 'dmoName', 'CONTAINS', input));
   
    return this.listView.GridData(config, false);
  }

  public getListingBidHistory(config: GridConfiguration): Observable<SearchResponse> {
    const accessToken = localStorage.getItem('AccessToken');
    const url = `${environment.Setting.BaseAPIUrlLmk}/bidding/getItemBidHistory`;
    return this.http.post<SearchResponse>(url, config, {headers: {accessToken}})
  }

  public getVendorInfo(input: string) {
    const config = this._generateGridConfig({
      ProcessName: 'LMKMSTRCustomer',
      ColumnList: 'dmocustmstrcustname1,dmocustmstrcustname2,dmocustmstrsapno,dmocustmstrcustdombranch,dmocustmstrhouseno,dmocustmstraddrln1,dmocustmstraddrcity,dmocustmstraddrzip', 
      SortColumn: 'dmocustmstrcustname1',
      SortOrder: 'asc',
    });
    config.GridFilters.push(this._generateGridFilter('Custom_Filter', 'dmocustmstrcustname1', 'CONTAINS', input));
    config.GridFilters.push(this._generateGridFilter('Custom_Filter', 'dmocustmstrcustname2', 'CONTAINS', input));
    config.GridFilters.push( {
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
    } ,
    {
      GridConditions: [
        {
          Condition: 'EQUAL',
          ConditionValue: 'No'
        }
      ],
      DataField: 'dmocustmstrblockflg',
      LogicalOperator: 'Or',
      FilterType: 'Column_Filter'
    },{
      GridConditions: [
        { Condition: "EQUAL", ConditionValue: "Active" }
      ],
      DataField: "Active",
      LogicalOperator: "Or",
      FilterType: "State_Filter"
    });
    return this.listView.GridData(config, false);
  }

  public getSAPInfo(input: string) {
    const config = this._generateGridConfig({
      ProcessName: 'LMKMSTRCustomer',
      ColumnList: 'dmocustmstrcustname1,dmocustmstrcustname2,dmocustmstrsapno,dmocustmstrcustdombranch,dmocustmstrhouseno,dmocustmstraddrln1,dmocustmstraddrcity,dmocustmstraddrzip',
      SortColumn: 'dmocustmstrsapno',
      SortOrder: 'asc',
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', 'dmocustmstrsapno', 'CONTAINS', input));
    config.GridFilters.push( {
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
    } ,
    {
      GridConditions: [
        {
          Condition: 'EQUAL',
          ConditionValue: 'No'
        }
      ],
      DataField: 'dmocustmstrblockflg',
      LogicalOperator: 'Or',
      FilterType: 'Column_Filter'
    },{
      GridConditions: [
        { Condition: "EQUAL", ConditionValue: "Active" }
      ],
      DataField: "Active",
      LogicalOperator: "Or",
      FilterType: "State_Filter"
    });
    return this.listView.GridData(config,false);
  }

  public getVendorPICs(sapNumber: string) {
    const config = this._generateGridConfig({
      ProcessName: 'LMKConfigCustomerPIC',
      ColumnList: 'dmocuspiccustpic',
      SortColumn: 'dmocuspiccustpic',
      PageSize: -1,
      PageNumber: -1,
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', 'dmocuspiccpicsapno', 'EQUAL', sapNumber));
    return this.listView.GridData(config, false).pipe(
      map(data => data.Data.map(item => item.dmocuspiccustpic)),
      tap(pics => this._PICList.next(pics)),
    );
  }

  public getProductCategoriesByListingType(listingType: 'Classified' | 'Bid & Offer') {    
    const dataField = listingType === 'Classified'
      ? 'dmotspcmapclsfdlistng' : 'dmotspcmapbidnofrlstng';
    const config = this._generateGridConfig({
      ProcessName: 'LMKMasterTranSaleProdCat',
      ColumnList: 'dmotspcmaptspcmappc',
      PageNumber: -1,
      PageSize: -1,
      IsDistinct:true,
      IsColumnListOnly: true,
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', dataField, 'EQUAL', 'Yes'));
    config.GridFilters.push(this._generateGridFilter('State_Filter', 'Active', 'CONTAINS', 'Active'));

    return this.listView.GridData(config,false).pipe(
      map(data => {      
        console.log(data)
        return data.Data.map(item => ({
          code: item.dmotspcmaptspcmappc_VAL,
          value: item.dmotspcmaptspcmappc_VAL}))
      }),
      map(data => data.sort(utilSort)),
      tap(data => this._categories.next(data)),
    );
  }

  public getProductCategoryCodeByValue(value: string) { 
    const config = this._generateGridConfig({
      ProcessName: 'LMKMasterTranSaleProdCat',
      ColumnList: 'dmotspcmaptspcmappc',
      PageSize: -1,
      IsDistinct:true,
      IsColumnListOnly: true,
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', 'dmotspcmaptspcmappc', 'EQUAL', value));
    config.GridFilters.push(this._generateGridFilter('State_Filter', 'Active', 'CONTAINS', 'Active'));
    
    return this.listView.GridData(config,false).pipe(
      map(data => data.Data),
      map(list => list.map(item => ({code: item.dmotspcmaptspcmappc_VAL, value: item.dmotspcmaptspcmappc_VAL}))),
      map(list => list[0]),
    )
  }

  public getProductByProdCategoryCode(code: string, listingType: 'Classified' | 'Bid & Offer') {                       
    const dataField = listingType === 'Classified'
      ? 'dmotspcmapclsfdlistng' : 'dmotspcmapbidnofrlstng';
    const config = this._generateGridConfig({
      ProcessName: 'LMKMasterTranSaleProdCat',
      ColumnList: 'dmotspcmaptspcmapp',
      PageNumber: -1,
      PageSize: -1,
      IsDistinct:true,
      IsColumnListOnly: true,
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', dataField, 'EQUAL', 'Yes'));
    config.GridFilters.push(this._generateGridFilter('Column_Filter', 'dmotspcmaptspcmappc', 'EQUAL', code));
    config.GridFilters.push(this._generateGridFilter('State_Filter', 'Active', 'CONTAINS', 'Active'));

    return this.listView.GridData(config,false).pipe(
      map(data => {
        return data.Data.map(item => ({
          code: item.dmotspcmaptspcmapp_VAL,
          value: item.dmotspcmaptspcmapp_VAL}))
      }),
      map(data => data.sort(utilSort)),
      tap(data => this._products.next(data)),
    );
  }

  public getBreedByProdCategoryCode(code: string, listingType: 'Classified' | 'Bid & Offer') {     
    const dataField = listingType === 'Classified'
      ? 'dmoprodbrdclsfdlistng' : 'dmoprodbrdbidnofrlistng';
    const config = this._generateGridConfig({
      ProcessName: 'LMKMSTRProductBreed',
      ColumnList: 'dmoprodbrdprodbrdcode,dmoprodbrdprodbrddscr',
      PageNumber: -1,
      PageSize: -1,
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', dataField, 'EQUAL', 'Direct Listing'));
    config.GridFilters.push(this._generateGridFilter('Column_Filter', 'dmoprodbrdprodcatcode', 'EQUAL', code));
    config.GridFilters.push(this._generateGridFilter('State_Filter', 'Active', 'CONTAINS', 'Active'));

    return this.listView.GridData(config, false).pipe(
      map(data => {
        return data.Data.map(item => ({
          code: item.dmoprodbrdprodbrddscr,
          value: item.dmoprodbrdprodbrddscr}))
      }),
      map(data => data.sort(utilSort)),
      tap(data => this._breeds.next(data)),
    );
  }

  public getProductSexByCategory(category: string) {
    const config = this._generateGridConfig({
      ProcessName: 'LMKMSTRProduct',
      ColumnList: 'dmoproductgender',
      PageNumber: -1,
      PageSize: -1,
    });
    config.GridFilters.push(this._generateGridFilter('Column_Filter', 'dmoproductproddscr', 'EQUAL', category));
    config.GridFilters.push(this._generateGridFilter('State_Filter', 'Active', 'CONTAINS', 'Active'));
    
    return this.listView.GridData(config, false);
  }

  // private applyCurrencyToBid(item: BidHistoryItem) {
  //   if (item.PriceType === '$/head')
  //     item.BidAmount = `${this.currency.transform(item.BidAmount, 'AUD', 'symbol-narrow')}`;
  //   else
  //     item.BidAmount = `${+item.BidAmount}�`;
  //   return item;
  // }

  private _generateGridCondition(condition: Condition, value: string): GridCondition {
    return {Condition: condition, ConditionValue: value}
  };

  private _generateGridFilter(
    filterType: FilterType,
    dataField: string, 
    condition?: Condition, 
    conditionValue?: string,
    operator: 'And' | 'Or' = 'Or'): GridFilter {
    const filter: GridFilter = {
      DataField: dataField,
      LogicalOperator: operator,
      FilterType: filterType,
      GridConditions: []
    };
    if (condition && conditionValue) {
      filter.GridConditions.push(this._generateGridCondition(condition, conditionValue));
    };
    return filter;
  }

  private _generateGridConfig(config: GridConfiguration): GridConfiguration {
    config.PageNumber = config.PageNumber || 0;
    config.PageSize = config.PageSize || 99;
    config.SortColumn = config.SortColumn || '-1';
    config.SortOrder = config.SortOrder || '-1';
    config.TimeZone = config.TimeZone || this._timezone;
    config.ViewName = config.ViewName || 'View 1';
    config.GridFilters = config.GridFilters || [];
    return config;
  }
}

const utilSort = (a: any, b: any) => {
  if (a.code > b.code) return 1;
  if (a.code < b.code) return - 1;
  return 0;
}

interface CustomDropdown {
  code: string;
  value: string;
}

export interface PostalInfo {
  location: string;
  state: string;
  postcode: number;
}

interface BidHistoryItem {
  BuyerName: string;
  TradingName: string;
  AccountNumber: string;
  BidStatus: string;
  State: string;
  PriceType: '$/head' | 'c/kg';
  BidAmount: string;
  BidDate: string;
  // BidTime?: string;
}

interface SearchResponse {
  Data: any[];
  RecordsCount: string;
  Begin: string;
  End: string;
  PageNumber: string;
  PageSize: string;
}