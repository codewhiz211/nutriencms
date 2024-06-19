import { EventEmitter, Injectable, Output } from '@angular/core';
import { ApiService } from './api.service';
import { ApiLmkService } from './api-lmk.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ListviewService {

  notesShowData = [];
  constructor(
    private api: ApiService,
    private lmkapi: ApiLmkService,private router: Router
  ) { }
  @Output() callData: EventEmitter<any> = new EventEmitter();

  getChildProcessData(ChildProcessName: any){
    this.callData.emit(ChildProcessName);
  }

  GridConfig(objGridData) {
    const { ProcessName, GridGuid, ViewName } = objGridData;
    return this.api.get(`listview/gridConfig?processName=${ProcessName}&gridGuid=${GridGuid}&viewName=${encodeURIComponent(ViewName)}`);
  }

  GridData(userData: any, isWF = true) {
    if (isWF) {
      return this.api.post('listview/getprocessdata', userData);
    } else {
      return this.lmkapi.post('listview/getprocessdata', userData);
    }
  }
  GridDataSaleProcess(userData: any) {
      return this.lmkapi.post('crmsales/salesProcessData', userData);
  }
  GetProcessDataCount(userData: any) {    
      return this.api.post('listview/getProcessDataCount', userData);    
  }
//Changes Based on Parent Transaction ID #1038
  DMOData(ProcessName: string, dmoName: string,ParentTransactionId: string = null) {
    if(ProcessName ==='LMKLivestockSales'){
      return this.lmkapi.get('crmsales/getDmoFilterData/' + ProcessName + '/' + dmoName + '?parentTransactionID=' + ParentTransactionId );
    }else{
    return this.api.get('listview/getDmoFilterData/' + ProcessName + '/' + dmoName + '?parentTransactionID=' + ParentTransactionId );
    }
  }

  sendGridConfig(gridData: any) {
    return this.api.post(`listview/gridConfig`, gridData);
  }

  stateList(processData) {
    return this.api.get('listview/getState/' + processData);
  }

  stageList(processData) {
    return this.api.get('application/applicationwfstages' + "?processName=" + processData + "&timeZone=" + "0");
  }

  dmoList(processData) {
    return this.api.get(`listview/getDmo/` + processData);
  }
  dmoListOrderByDMO(processData,CanvasType?:any) {
    // default set adminview
    if(CanvasType === null || CanvasType === undefined) {
      CanvasType = 'AdminView';
    }
    return this.api.get(`listview/getDmo/` + processData + '?isSortByDMO=true' + '&CanvasType='+CanvasType);
  }
//Change for customer master sap data sending
  deleteGridData(id: string){
     if (sessionStorage.getItem('AppName') &&  (['LMKMSTRCustomer'].indexOf(sessionStorage.getItem('AppName')) > -1)) {
      return this.lmkapi.deleteGrid('opecesapplication/deleteTransaction?TransactionIDs=' + id);
    } else {
      return this.api.deleteGrid('application/deleteTransaction?TransactionIDs=' + id);
    }
    
  }
  ExportToExcel(userData: any) {
     if(userData.ProcessName == 'announcement'){
      return this.api.postGetFile(`listview/ExportToExlAnncmntData`, userData, 'blob');
     } else if(userData.ProcessName == 'LMKLivestockSales' || userData.ProcessName == 'LMKLivestockLots'){
      return this.lmkapi.postGetFile(`crmsales/exportToExcel`, userData, 'blob');
     }
     else{
      return this.api.postGetFile(`listview/exportToExcel`, userData, 'blob');
     }
  }
  ExportToPDF(userData: any) {
    if(userData.ProcessName == 'LMKLivestockSales' || userData.ProcessName == 'LMKLivestockLots'){
      return this.lmkapi.postGetFile(`crmsales/exportToPDF`, userData, 'blob');
     }
     else{
      return this.api.postGetFile(`listview/ExportToPDF`, userData, 'blob');
     }
  }
  ExportFileWithEndPointURL(userData: any, url) {
    return this.api.postGetFileWithEndPoint(url, userData, 'blob');
  }
  deleteGridConfigData(configData){
    return this.api.deleteGrid(`listview/deleteGridConfig` + "?processName=" + configData.ProcessName + "&gridGuid=" + configData.GridGuid + "&viewName=" + configData.ViewName);
  }
  GetDataFromIceAPI(url: string, resultType: any) {
    return this.api.GetDataFromIceAPI(url, resultType);
  }
  userActionPermission(processName?: string) {
    if (processName !== undefined && processName !== null && processName !== '') {
      return this.api.get('listview/GetUserActionPermission', { ProcessName: processName });
    } else {
      return this.api.get('listview/GetUserActionPermission');
    }
  }
  // listview/exportToExcel

  noteMessage(id){
    return this.api.get(`application/comment/` + null + '/' + null + "?transactionId=" + id)
  }
  sendNoteMessage(message){  
    const url = (this.router.url).split('/');      
    let isContract = false;  
    if(!!url[2] && url[2] === 'contract_view'){
      isContract = true;
    }   
    return this.api.postForLMK(`opecesapplication/postcomment?isContract=${isContract}`, message);
  }

  userList(userData){
    return this.api.get(`formview/getUsername` + "?processName=" + userData.processname + "&searchText=" + userData.searchtext);
  }
  UploadFile(formData: FormData) {
    return this.api.UploadFile('application/bulkUploadnew', formData);
  }
   uploadFiles(url: string, formData: FormData) {
    return this.api.post(url , formData);
  }

  downloadFile(downloadRequiredata) {
    return this.api.postGetFile(`application/downloadFileDiscussionBoard?transctionID=` + downloadRequiredata.transactionid + '&fileID='
     + downloadRequiredata.fileid, downloadRequiredata, 'blob');
  }
  UpdateCell(applicationObj){
    return this.api.post(`application/updateapplication`, applicationObj);
  }
  getProcess() {
    return this.api.get('application/processList');
  }

  getAllQuickMind(processname) {
    return this.api.get('quickmind/getallqmind' + '?processName=' + processname);
  }

  deleteQuickmind(processName , id) {
    return this.api.delete('quickmind/deleteqmind', '?processName=' + processName + '&qminds=' + id);
  }
  GridDatalmk(userData: any) {
    return this.lmkapi.post('crmsales/salesProcessData', userData);
  }
  resetGridConfg(model: any) {
    return this.lmkapi.postOnWf(`listview/resetGridConfig`, model);
  }
}
