import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { ApiLmkService } from '@app/core/services/api-lmk.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, Subject } from 'rxjs';
import { environment } from '@env/environment';
import { formatDate } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, map, tap } from 'rxjs/operators';

import { ListviewService } from '@app/core';
import { EmailService } from '@app/core/services/email.service';
import { UserDetail } from '@app/core/models/user-detail';


@Directive()
@Injectable({
  providedIn: 'root'
})
export class SalesService {

  endpoint = environment.Setting.BaseAPIUrlLmk;
  currentSaleYardName = '';
  currentSaleYardValue = '';
  submitDataForCreateSale: any;
  SaleDate: string;
  @Output() vendor: EventEmitter<string> = new EventEmitter();
  LotGuids: any[];
  isBuyerBranchRebateUpdatedOnSaleHeader = false;
  currentSaleTransactionType$ = new Subject<string>();
  SaleLink: any;
  saleCompanyCode = [];
  IsAllowInvoiceFinalize = false;
  IsConductingBranchSaleProcessor = false;
  constructor(
    private http: HttpClient,
    private lmkservice: ApiLmkService,
    private listViewService: ListviewService,
    private userDetail: UserDetail) {
    this.LotGuids = [
      'dmolotvinfovendorpic',
      'dmolotbinfobuyerid',
      'dmolotbinfobuyername',
      'dmolotbinfobuyerpic',
      'dmolotbinfoinvoiceref',
      'dmolotlotinfosalenum',
      'dmolotlotinfoqnty',
      'dmolotlotinfoprod',
      'dmolotlotinfodesc',
      'dmolotlotinfopricephd',
      'dmolotlotinfopricecpkg',
      'dmolotlotinfowtkg',
      'dmolotlotinfopdct',
      'dmolotlotinfoproddesc'
    ];
  }

  setSaleTransactionType(transtype: string) {
    this.currentSaleTransactionType$.next(transtype);
  }

  ImportFileData(processName: string, userId: string, saleyardName: string, formData: FormData): Observable<any> {
    let url = 'crmlot/importlotfiles';
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accessToken, processName: processName, userId: userId, saleyardCode: saleyardName });
    return this.http.post<any>(`${this.endpoint}/${url}`, formData, { headers: headers });
  }

  GetImportLotData(userName: string, isOnValidate: string, isErrorRecords: string, modelData: any) {

    let url = 'crmlot/getimportlotdata';
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accessToken, userName: userName, isOnValidate: isOnValidate, isErrorRecords: isErrorRecords });
    return this.http.post<any>(`${this.endpoint}/${url}`, modelData, { headers });
  }

  ValidateImportLotData(userName: string): Observable<any> {

    let url = 'crmlot/validatelottableData';
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accessToken, userName: userName });
    return this.http.get(`${this.endpoint}/${url}`, { headers });
  }

  SaveImportLotData(userName: string, data: any): Observable<any> {
    let url = 'crmlot/updatelottabledata';
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accessToken, userName: userName });
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers });
  }

  CreateSalesLotTableData(userName: string, processName: string, parentTrnsctnId: string, UpdatePic: boolean) {
    let url = 'crmlot/createsaleslottabledata/' + UpdatePic;
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accessToken, userName: userName, processName: processName, parentTrnsctnId: parentTrnsctnId });
    return this.http.get(`${this.endpoint}/${url}`, { headers });
  }

  getAlias(body) {
    return this.lmkservice.post('crmlot/getalias', body);
  }
  DeleteLotimport(username: string, saleyardname: string) {
    const url = 'crmlot/deleteimportlotdata';
    const accesstoken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accesstoken, userName: username, saleyardName: saleyardname });
    return this.http.post<any>(`${this.endpoint}/${url}`, null, { headers });
  }
  DownloadTemplateFile() {
    let url = 'crmsales/downloadtemplatefile';
    let resultType: any = 'Blob';
    const accessToken = localStorage.getItem('AccessToken');
    const Headers = new HttpHeaders({ accessToken: accessToken });
    return this.http.post<any>(`${this.endpoint}/${url}`, null, { headers: Headers, responseType: resultType });
  }
  SaveCopyLotData(parentTrnFrom: string, parentTrnTo: string): Observable<any> {
    const url = 'crmsales/copyLots?transactionIdFrom=' + parentTrnFrom + '&transactionIdTo=' + parentTrnTo + '';
    const accesstoken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ accessToken: accesstoken });
    return this.http.post<any>(`${this.endpoint}/${url}`, null, { headers });
  }
  GridVendorTermsData(bodydata: any) {
    return this.lmkservice.post('crmsales/vendorTermsData', bodydata);
  }
  AddVendorTermsData(bodyData: any) {
    const vendorterm = this.lmkservice.post('crmsales/saveVendorTerms', bodyData);
    const buyerterm = this.lmkservice.post('crmsales/saveBuyerTerms', bodyData);
    return forkJoin([vendorterm, buyerterm]);
  }
  bindvendor(id: string) {
    this.vendor.emit(id);
  }
  UpdateVendorTerms(bodyData: any) {
    return this.lmkservice.post('crmsales/updateVendorTerms', bodyData);
  }
  ResetLot(bodyData) {
    return this.lmkservice.post('crmlot/resetLotBuyerRebate', bodyData);
  }
  saveConjunctionalAgent(bodyData: any) {
    return this.lmkservice.post('crmsales/saveConjunctionalAgent', bodyData);
  }
  getConjunctionalAgent(transactionID: string) {
    return this.lmkservice.get('crmsales/getConjunctionalAgents?transactionID=' + transactionID);
  }
  deleteConjunctionalAgent(id: string) {
    return this.lmkservice.post('crmsales/deleteConjunctionalAgent?Id=' + id + '', null);
  }
  createDuplicateSale(body: any) {
    return this.lmkservice.post('crmsales/duplicateSale', body);
  }
  copyLots(transactionIdFrom: string, transactionIdTo: string, lotsTranId: string) {
    return this.lmkservice.post(`crmsales/copyLots?transactionIdFrom=${transactionIdFrom}&transactionIdTo=${transactionIdTo}&lotsTranId=${lotsTranId}`, null);
  }
  confirmReversal(transactionID: string) {
    return this.lmkservice.post(`crmsales/confirmReversal?transactionID=${transactionID}`);
  }
  isFutureDate(SaleDate: any, DueDate: any): boolean {
    SaleDate = new Date(SaleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    SaleDate.setHours(0, 0, 0, 0);
    const dData = new Date(DueDate);
    return dData > SaleDate && dData > today;
  }

  invoiceReport(id: string) {
    return this.lmkservice.post(`report/invoiceReport?SaleTransactionID=${id}`);
  }

  finalizeReport(id: string) {
    return this.lmkservice.post(`report/finalizeReport?SaleTransactionID=${id}`);
  }
  completeReversal(id: string) {
    return this.lmkservice.post(`report/reverseReport?SaleTransactionID=${id}`);
  }
  isChangesOnLot(data: any[]) {
    return this.LotGuids.includes(data);
  }
  getCurrentDateTime(zone, value?, format = 'MM/dd/yyyy hh:mm:ss') {
    try {
      let d: any;
      if (value) {
        d = new Date(value); // val is in UTC
      } else {
        d = new Date(); // val is in UTC
      }
      const localOffset = zone * 60000;
      const localTime = d.getTime() - localOffset;
      d.setTime(localTime);
      return formatDate(d, format, 'en-US');
    } catch (error) {

      return '';
    }
  }

  saleIdSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(1000), distinctUntilChanged());

    return debouncedText$.pipe(
      switchMap(term => {
        this.SaleLink = term;
        if (term === '') {
          return of([]);
        } else {
          const queryBody: any = {
            PageSize: 100,
            PageNumber: 0,
            SortColumn: 'dmocrmheaderinfsaleid',
            SortOrder: 'asc',
            ProcessName: 'LMKLivestockSales',
            TimeZone: 0,
            ColumnList: 'dmocrmheaderinfsaleid',
            ViewName: 'View 1',
            IsColumnListOnly: true,
            GridFilters: [
              {
                DataField: 'dmocrmheaderinfsaleid',
                FilterType: 'Custom_Filter',
                LogicalOperator: 'Or',
                GridConditions: [{ Condition: 'CONTAINS', ConditionValue: term }]
              }
            ]
          };
          return this.listViewService.GridData(queryBody, false)
            .pipe(
              // tap(res => this.SaleLink = res.Data),
              map((res: any) => res.Data.map(item => item.dmocrmheaderinfsaleid))
            );
        }
      })
    )
  };
  updateSaleTrack(id: string) {
    return this.lmkservice.post(`crmsales/updateEcontractTrackSale/${id}`);
  }
  DwonloadXML(url: any, bodyxml: any = null) {
    let resultType: any = 'Blob';
    const accessToken = localStorage.getItem('AccessToken');
    const Headers = new HttpHeaders({ accessToken: accessToken });
    if (bodyxml == null) {
      return this.http.post<any>(`${this.endpoint}/${url}`, null, { headers: Headers, responseType: resultType });
    }
    else {
      return this.http.post<any>(`${this.endpoint}/${url}`, bodyxml, { headers: Headers, responseType: resultType });
    }
  }
  getSaleTrnsctnid(id: string) {
    return this.lmkservice.get(`crmsales/getSaleTrnsctnid/${id}`)
  }
  public saveThirdPartyTerms(body: any) {
    return this.lmkservice.post('crmsales/saveThirdPartyTerms', body, null);
  }
  calcLotFeesChargesById(body: any){
    return this.lmkservice.post('crmlot/calcLotFeesChargesById',body, null);
  }
  public saveConjAgentTerms(body: any) {
    return this.lmkservice.post('crmsales/saveConjunctionalAgentTerms', body, null);
  }
  saveAutoLotAgentAgencyForSale(body: any){
    return this.lmkservice.post('crmlot/saveAutoLotAgentAgencyForSale',body, null);
  }
  PostGLXmlForSale(body:any){
    return this.lmkservice.post('gl/LS_FT_ProcessGlXMLs',body,null)
  }
  PostGLXmlForReversalSale(body: any){
    return this.lmkservice.post('gl/LS_FT_RVSL_ProcessGlXMLs',body, null);
  }
  finalizeProcess(body: any) {
    return this.lmkservice.post(`report/finalizeProcess`, body,null);
  }
  UpdateSaleCompanyCode(body: any) {
    return this.lmkservice.post('crmsales/updateSaleCompanyCode', body, null);
  }
  ProcessLot(body: any) {
    return this.lmkservice.post('crmsales/ProcessLot', body, null);
  }
    calculateSale(body: any){
    return this.lmkservice.post('crmsales/calculateSale',body, null);
  }
  IsAllowForCondutingBranch(CompCode: string,conductingBranchCompCode: string ): boolean{
    this.IsConductingBranchSaleProcessor = false;
    if (!!CompCode && !!conductingBranchCompCode && CompCode.indexOf(',') > -1) {
      const distinctCompCode = CompCode.split(',').reduce((acc, value) => {
        return !acc.includes(value) ? acc.concat(value) : acc
      }, []).join(',');

      if (distinctCompCode == conductingBranchCompCode) {
        this.IsConductingBranchSaleProcessor = true;
        return true;
      } else if (distinctCompCode.split(',').indexOf(conductingBranchCompCode) > -1) {
        this.userDetail.ListRole.forEach(role => {
          if (role == 'lmklivestockconductingbranchsales') {
            this.IsConductingBranchSaleProcessor = true;
          return true;
          }
        });
      }
    } else if (CompCode == conductingBranchCompCode) {
      this.IsConductingBranchSaleProcessor = true;
      return true;
    }
    if (this.IsConductingBranchSaleProcessor == false) {
      return false;
    } else {
      return true;
    }
  }
  updateAliasCreatedDate(data: any) {
    return this.lmkservice.post(`crmsales/UpdateAliasCreatedDate`,data);
  }
}
