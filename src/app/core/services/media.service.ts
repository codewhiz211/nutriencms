import { Injectable, AbstractType } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(private api: ApiService) { }
  uploadFile(formData: FormData) {
    return this.api.UploadFile('media/addMediaDMOGFile', formData);
  }

  getList(bodyData) {
    return this.api.get('media/getMediaDMOGList', bodyData);
  }
  getSingle(transactionID, MediaID) {
    return this.api.get('media/getMediaDMOG?mediaID=' + MediaID + '&transactionID=' + transactionID);
  }
  setFeatured(transactionID, MediaID) {
    return this.api.post('media/setfeatured?mediaID=' + MediaID + '&transactionID=' + transactionID, null);
  }

  setStatus(transactionID, MediaID, status) {
    return this.api.post('media/setactivestatus?mediaID=' + MediaID + '&transactionID=' + transactionID + '&status=' + status, null);
  }

  Delete(transactionID, MediaID) {
    return this.api.deleteGrid('media/deleteMediaDMOG?mediaID=' + MediaID + '&transactionID=' + transactionID);
  }

  getFile(mediaID) {
    return this.api.postGetFile('media/downloadMediaDMOGFile?mediaID=' + mediaID, null, 'blob');
  }

  // Create chunk array here.
  getChunk(file, type, maxFileSizeKB: number = 100): any[] {
    const fileChunks = [];
    try {
      const filetype = type.split('/')[0];
      if (filetype === 'image') {
        maxFileSizeKB = file.size;
      }
    } catch {

    }
    const bufferChunkSizeInBytes = maxFileSizeKB * (1024);

    let currentStreamPosition = 0;
    let endPosition = bufferChunkSizeInBytes;
    const size = file.size;

    while (currentStreamPosition < size) {
      fileChunks.push(file.slice(currentStreamPosition, endPosition));
      currentStreamPosition = endPosition;
      endPosition = currentStreamPosition + bufferChunkSizeInBytes;
    }
    return fileChunks;
    // this.uploadFileChunk(fileChunks, file.name, 0, fileChunks.length - 1);
  }
// convert blob file to image
  createImageFromBlob(image: Blob): any {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      return reader.result;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
