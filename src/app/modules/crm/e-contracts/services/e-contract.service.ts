import { Injectable } from '@angular/core';
import { ApiLmkService } from '@app/core/services/api-lmk.service';

@Injectable({
  providedIn: 'root'
})
export class EContractService {

  constructor(private api: ApiLmkService) { }

  getDMOList(processName, configFor) {
    return this.api.get(`crmlot/getDmo/` + processName + '/' + configFor + '?isSortByDMO=true');
  }
  GridData(userData: any) {
    return this.api.post('crmsales/salesProcessData', userData);
  }
  SalesProcessDataCount(userData: any) {    
    return this.api.post('crmsales/salesProcessDataCount', userData);    
}

  getTranscationId(SaleID, processName, guid) {
    return this.api.get(`crmsales/getTransctionIdBasedOnPlasmaId/` + processName + '/' + guid + '/' + SaleID);
  }
  GridConfig(objGridData) {
    const { ProcessName, GridGuid, ViewName } = objGridData;
    return this.api.get(`listview/gridConfig?processName=${ProcessName}&gridGuid=${GridGuid}&viewName=${ViewName}`);
  }
  getEndPoint(ExportType: string): string {
    if (ExportType.toLowerCase() === 'excel') {
      return this.api.endpoint + '/listview/EcontractExportToExcel';
    } else {
      return this.api.endpoint + '/listview/EcontractExportToPDF';
    }
  }
  saveSaleContract(body) {
    return this.api.postGetFile('crmsales/saveSaleContract', body, 'text');
  }
  saveSaleLot(body) {
    return this.api.post('crmlot/AddSaleLot', body);
  }

  closeContract(TrnsctnId:any){
    return this.api.post(`crmsales/CloseContract/${encodeURIComponent(TrnsctnId)}`);
  }
  sendNoteMessage(Notes: any){    
    console.log('check contract');
    return this.api.postOnWf(`application/postcomment`, Notes);
  }
}
