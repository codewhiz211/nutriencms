import { Injectable, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { ApiService } from './api.service';
import { ApiLmkService } from './api-lmk.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  checkValidation: Subject<boolean> = new Subject();

  constructor(private api: ApiService,
    private lmkapi: ApiLmkService) { }

  checkValidations() {
    this.checkValidation.next(true);
  }

  getProcess() {
    return this.api.get('application/process');
  }

  insertApplication(data) {
    if (sessionStorage.getItem('AppName') &&  (['LMKOpportunities', 'LMKMSTRCustomer'].indexOf(sessionStorage.getItem('AppName')) > -1)) {
      return this.lmkapi.post('opecesapplication/insertapplication', data);
    } else {
      return this.api.post('application/insertapplication', data);
    }
  }

  updateApplication(data) {
    if (sessionStorage.getItem('AppName') &&  (['LMKOpportunities', 'LMKMSTRCustomer'].indexOf(sessionStorage.getItem('AppName')) > -1)) {
      return this.lmkapi.post('opecesapplication/updateapplication', data);
    } else {
      return this.api.post('application/updateapplication', data);
    }

  }

  getApplicationData(identifierName = null, identifierValue = null, view: string, transactionId?: string) {
    return this.api.get('application/applicationdata' + '/' + identifierName + '/' + identifierValue + '/' + view, {transactionId});
  }
  getLogData(identifierName = null, identifierValue = null, transactionId?: string, pageSize = 10, pageNumber = 1) {
    return this.api.get('application/activitylog' + '/' + identifierName + '/' + identifierValue, {transactionId, pageSize, pageNumber});
  }

  getHistoryLogData(identifierName = null, identifierValue = null, transactionId?: string, pageSize = 10, pageNumber = 1) {
    let canvasType = sessionStorage.getItem('AppName') &&  (sessionStorage.getItem('AppName') === 'LMKOpportunities') ? 'View4' : 'AdminView';  
    return this.api.get('application/historylog' + '/' + identifierName + '/' + identifierValue, {transactionId, pageSize, pageNumber,canvasType});
  }

  getNotificationLogData(identifierName = null, identifierValue = null, transactionId?: string, pageSize = 10, pageNumber = 1) {
    return this.api.get('application/emaillog' + '/' + identifierName + '/' + identifierValue, {transactionId, pageSize, pageNumber});
  }

  gettempDate() {
    return this.api.get('application/getAnnouncements?processName=driver&flag=all&pageSize=20&pageFrom=0');
  }

  getTopCornerDetail(identifierName = null, identifierValue = null, canvasType: string, transactionId?: string) {
    return this.api.get('application/gettopcornerdetail' + '/' + identifierName + '/' + identifierValue + '/' + canvasType, {transactionId});
  }

  getBatchUpdateDetails(processName: string) {
    return this.api.get('application/getBatchUpdateDetails', {processName});
  }

  batchUpdate(data, processName: string) {
    return this.api.post('application/batchUpdate', data, {processName});
  }

  checkSubProcessRecordCount(subprocessrecordcount){
    return this.api.post('application/RecordCountByState' , subprocessrecordcount);
  }

  getGridDmogDataMapping(params: any) {
    return this.api.get('application/getGridDmogDataMapping', params);
  }

  getGridDmogData(params: any) {
    return this.api.post('application/getGridDmogData', params);
  }

  insertUpdateGridDmogData(params: any) {
    return this.api.post('application/InsertUpdateGridDmogData', params);
  }

  deleteGridDmogData(ids: any) {
    return this.api.deleteGrid('application/deleteGridDmogData?dataIDs=' + ids.toString());
  }

  getBulkLogData(bodyData: any) {
    return this.api.post('application/getBulkUploadLog',bodyData);
  }

  DownloadBulkLog(processName: any) {
    return this.api.postGetFile('application/getBulkUploadTemplate/'+ processName,null,'Blob');
  }

  DownloadBulkUploadErrorLog(FileName: any) {
    return this.api.postGetFile('application/DownloadBulkUploadErrorLog/'+ FileName,null,'Blob');
  }
  //Change Validate Uniqueness Process Ticket - #1005
  //  ValidateUniqueDmoValue(data) {
  //   return this.api.post('application/validateuniquedmovalue', data);    
  // }
  //Change for customer master sap data sending
  deleteGridData(id: string){
    if (sessionStorage.getItem('AppName') &&  (['LMKMSTRCustomer'].indexOf(sessionStorage.getItem('AppName')) > -1)) {
      return this.lmkapi.deleteGrid('opecesapplication/deleteTransaction?TransactionIDs=' + id);
    } else {
      return this.api.deleteGrid('application/deleteTransaction?TransactionIDs=' + id);
    }
   
  }
  getDisplayNameByProcessName(ProcessName:any){
    return this.api.get(`application/getDisplayNameByProcessName/${ProcessName}`,null);
  }
  getTriggerConfirmMsg(processName, triggerName) {
    return this.lmkapi.get(`watchlist/GetTriggerConfirmMsg/${processName}/${triggerName}`,null);
  }
  UpdateKeyValueDmoReferencedValues(data){
    return this.api.post('formview/UpdateKeyValueDmoReferencedValues', data);
  }

  getEncryptedJSON(data:any) {
    return this.lmkapi.post('user/EncryptJSON',data);
  }

}
