import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { ApiESaleyardService } from './api-e-saleyard.service';
import { SanitizerService } from './sanitizer.service';

@Injectable({
  providedIn: 'root'
})
export class ContentManagerService {

  constructor(private api: ApiESaleyardService, private sanitizer: SanitizerService) { }

  get hasBuyerFullAccess(){
    return this.api.checkBuyerRolesAccess();
  }

  getContentManagerList(bodyData) {
    return this.api.post('ContentManager/getContentManager', bodyData).pipe(
      // map(response => {
      //   const data = response.ContentManager as any[] || [];
      //   return {
      //     ...response,
      //     ContentManager: data.map(item => this.sanitizer.sanitize(item))
      //   }
      // }),
    );
  }

  AddOrUpdate(data) {
    return this.api.post(`ContentManager/addEditContentManager`, data);
  }
  getAsset() {
    return this.api.get(`ContentManager/getAsset`);
  }

  deleteData(id: string) {
    return this.api.delete('contentmanager/deleteContentManager?dataID=' + id, null);
  }
  UploadFile(formData: FormData) {
    return this.api.UploadFile('contentmanager/uploadDocumentContentManager', formData);
  }
  ChangeUserStatus(userId) {
    return this.api.post(`contentmanager/changeStatus?dataID=` + userId, null);
  }
  uploadFile(url: string, formData: FormData) {
    return this.api.post(url, formData);
  }
  getContentManagerByid(bodyData) {
    return this.api.post('ContentManager/getContentManagerByID', bodyData);
  }

  getFile(fileData) {
    fileData.controlName = fileData.controlName === undefined ? '' : fileData.controlName;
    return this.api.postGetFile('contentmanager/downloadDocumentContentManager?dataID=' + fileData.dataID +
    '&fileID=' + fileData.fileID + '&controlName=' + fileData.controlName, null, 'blob');
  }

  ChangeFilterDateFormat(dateValue){    
    let dateArray =  dateValue.split("/");
    let modifiedDateValue = dateArray[1].toString() + '/'+ dateArray[0].toString() +'/'+ dateArray[2].toString();
    var d = new Date(modifiedDateValue);
    var localOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() + localOffset);
  }
}
