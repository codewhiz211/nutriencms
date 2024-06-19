import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ListviewService, ApiESaleyardService } from '@app/core';

@Injectable({
  providedIn: 'root'
})
export class WoolSearchService {

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

  getStorageCenter(): Observable<any> {
    this.queryBody.SortColumn = 'dmowoolstrwoolstrcode';
    this.queryBody.ProcessName = 'LMKMSTRAWHWoolStore';
    this.queryBody.ColumnList = 'dmowoolstrwoolstrcode,dmowoolstrwoolstrdscr';


    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getRegion(): Observable<any> {
    this.queryBody.SortColumn = 'dmoregionregioncode';
    this.queryBody.ProcessName = 'LMKMSTRRegion';
    this.queryBody.ColumnList = 'dmoregionregioncode,dmoregionregiondscr';


    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getDivision(): Observable<any> {
    this.queryBody.SortColumn = 'dmodivisondivisoncode';
    this.queryBody.ProcessName = 'LMKMSTRDivision';
    this.queryBody.ColumnList = 'dmodivisondivisoncode,dmodivisondivisondscr';


    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getLandmarkBranchName(): Observable<any> {
    this.queryBody.SortColumn = 'dmobranchbrname';
    this.queryBody.ProcessName = 'LMKMSTRBranch';
    this.queryBody.ColumnList = 'dmobranchbrcode,dmobranchbrname';

    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getWAM(): Observable<any> {
    this.queryBody.SortColumn = 'dmowamwamcode';
    this.queryBody.ProcessName = 'LMKMSTRWoolAreaManager';
    this.queryBody.ColumnList = 'dmowamwamcode,dmowamwamfname,dmowamwamlname';


    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getAgent(): Observable<any> {
    this.queryBody.SortColumn = 'dmoagentagntname';
    this.queryBody.ProcessName = 'LMKMSTRAgent';
    this.queryBody.ColumnList = 'dmoagentagntid,dmoagentagntname';


    return this.listviewService.GridData(this.queryBody,false)
      .pipe(
        map(res => res.Data)
      );
  }

  getReceivalData(params: any) {
    return this.apiESaleyardService.post('awhwool/receivalProcessData', params);
  }

  getUnSoldLottedWoolData(params: any) {
    return this.apiESaleyardService.post('awhwool/unSoldLottedlProcessData', params);
  }

  getAppraisalData(params: any) {
    return this.apiESaleyardService.post('awhwool/appraisalProcessData', params);
  }

  getTestResultsData(params: any) {
    return this.apiESaleyardService.post('awhwool/testResultProcessData', params);
  }

  getInterimPrice(params: any) {
    return this.apiESaleyardService.post('awhwool/interimPriceProcessData', params);
  }

  getSoldWoolProcessData(params: any) {
    return this.apiESaleyardService.post('awhwool/soldWoolProcessData', params);
  }

  getSaleSummaryProcessData(params: any) {
    return this.apiESaleyardService.post('awhwool/saleSummaryProcessData', params);
  }

  getSoldRehandleProcessData(params: any) {
    return this.apiESaleyardService.post('awhwool/soldRehandleProcessData', params);
  }
  getSoldAppraisalData(params: any) {
    return this.apiESaleyardService.post('awhwool/soldAppraisalProcessData', params);
  }
  getSoldTestResultsData(params: any) {
    return this.apiESaleyardService.post('awhwool/SoldTestResultProcessData', params);
  }
  checkAppRole(processName:string){
    return this.apiESaleyardService.post('user/CheckAppRole?processName='+processName);
  }
}
