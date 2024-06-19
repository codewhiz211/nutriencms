import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '@env/environment';
@Injectable({
  providedIn: 'root'
})
export class DmoImageControlService {

  index = 0;
  ImagesFileList = [];
  ImagesRemoveFileList = [];
  SavedImagesFileList = [];

  constructor(private api: ApiService) { }

  upload(transactionID: string) {     
    if (this.ImagesRemoveFileList.length > 0) {
      this.ImagesRemoveFileList.forEach(element => {        
        const formData = new FormData();
        formData.append('transactionId', transactionID);
        //formData.append('tempTransactionID', this.tempTransactionID);
        formData.append('userName', '0');
        formData.append('dmoGUID', element.Guid);
        formData.append('FileName', element.FileName);
        formData.append('IsPermanentDelete', element.IsPermanentFileDeletion || environment.Setting.IsPermanentFileDeletion.toString());
        this.api.DeleteFile('application/deleteFile', formData).subscribe(event => {

        }, error => { });
      });
      this.ImagesRemoveFileList = [];
    }
    if (this.ImagesFileList.length > 0) {
      this.ImagesFileList.forEach(element => {
        const formData = new FormData();
        if (transactionID !== '') {
          formData.append('transactionId', transactionID);
        }
        //formData.append('tempTransactionID', this.tempTransactionID);
        formData.append('userName', '0');
        formData.append('dmoGUID', element.Guid);
        formData.append('isEncrypted', 'false');
        if (element.ImgFileName) {
          formData.append('uploadFile', element.file.file, element.ImgFileName);
        } else {
          formData.append('uploadFile', element.file.file);
        }

        this.api.UploadFile('application/uploadfile', formData).subscribe(event => {

          // this.transform.scale = 1;
        }, error => { });
      });
      this.ImagesFileList = [];
    }
  }
}
