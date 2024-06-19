import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { ApiService } from './api.service';
import { map, filter, tap, catchError, switchMap, finalize, retry, mapTo } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { of, forkJoin, NEVER, EMPTY, Subject, BehaviorSubject, from } from 'rxjs';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';

@Directive()
@Injectable({
  providedIn: 'root'
})
export class DocumentViewService {
  public isAttachmentGridView:boolean=false;
  private _attachments: any;
  private _filesUploadedSubject = new Subject<boolean>();
  private _formDataList: Array<FormData> = [];
  private _fileListStore = new BehaviorSubject<{url: string | ArrayBuffer; title: string}[]>([]);

  get onFilesUploaded() {
    return this._filesUploadedSubject.asObservable();
  }

  get pendingFileLinks() {
    return this._fileListStore.asObservable();
  }

  get pendingFilesLength() {
    return this._formDataList.length;
  }

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private msg: MessageService,
  ) { }

  @Output() callData: EventEmitter<number> = new EventEmitter();

  getTreeData(){
    this.callData.emit();
  }

  public async pushToPendingFileList(formData: FormData, file: File) {
    await this._addToFileList(file);
    this._addToFormDataList(formData)
  }

  public removeFromPendingFieleList(index: number) {
    this._formDataList = this._formDataList.filter((_, i) => i !== index);

    let state = this._fileListStore.getValue();
    state = state.filter((_, i) => i !== index);
    this._fileListStore.next(state);
  }

  private async _addToFileList(file: File) {
    let url = await this._convertFileToBase64(file);
    if ((url as string).startsWith('data:image')) {}
    else if ((url as string).startsWith('data:video')) 
      url = 'assets/styles/images/video-thumb-square-no-radius.jpg';
    else 
      url = 'assets/styles/images/FileIcon.png';
    const state = this._fileListStore.getValue();
    this._fileListStore.next([...state, {url, title: file.name}]);
  }

  private _addToFormDataList(formData: FormData) {
    this._formDataList.push(formData);
    const files = this._formDataList.length > 1 ? 'files' : 'file';
    this.msg.showMessage('Warning', {
      header: 'File Upload',
      body: `Please save your changes to complete the file upload and make the ${files} visible.`
    });
  }

  public clearPendingFileList() {
    this._formDataList = [];
    this._fileListStore.next([]);
  }

  public uploadFiles() {
    let counter = 0;
    if (this._formDataList.length === 0)
      return EMPTY;
    return forkJoin(this._formDataList.map(formData => 
      this._uploadFile(formData).pipe(
        retry(1),
        catchError(_ => {
          counter++;
          return NEVER;
        }),
      ))
    ).pipe(
      finalize(() => {
        if (counter > 0) {
          const message = `${counter} file${counter > 1 ? 's' : ''} were not uploaded successfully.`
          this.msg.showMessage('Warning', {body: message});
        } else {
          this.msg.showMessage('Success', {body: 'All files were uploaded successfully!'});
        }
        this.clearPendingFileList();
        this._filesUploadedSubject.next();
      })
    );
  }

  private _uploadFile(formData: FormData) {
    const path = `documentView/uploadFile`;
    return this.api.UploadFile(path, formData);
  }

  /** @param transactionID is required when used outside DocumentViewComponent */
  public async hasActiveAndFeaturedImage(transactionID?: string) {
    var files = [];
    if (this._attachments) {
      return this._identifyAttachmentsStatus(await this.getAttachedFiles());
    }
    const payload = {
      DocumentID: "0",
      ProcessName: this.route.snapshot.params.process != undefined ? this.route.snapshot.params.process : sessionStorage.getItem('AppName'),
      TransactionID: transactionID,
      TimeZone: new Date().getTimezoneOffset(),
      // IsActive: "1",
    };
    return this.FolderTree(payload).pipe(
      map(data => {
        delete data[0];
        Object.values(data).some((item: any) => {
          if (item.filter(row => row.IsFeatured === 1 && row.Type !== 0).length > 0) {
            return files = item.filter(r => r.IsFeatured === 1 && r.Type !== 0);
          }
        }
        )

        return this._identifyAttachmentsStatus(files);
      }),
    ).toPromise();
  }

  private _identifyAttachmentsStatus(files: any[]) {
    if (files.length > 0) {
      const featured = files.find(item => item.IsFeatured === 1);
      const active = files.find(item => item.IsActive === 1);
      if (featured)
        return { featured: !!featured.IsFeatured, active: !!featured.IsActive };
      else if (!featured && active)
        return { featured: false, active: true };
      else
        return { featured: false, active: false };
    } else
      return { featured: false, active: false };
  }

  /** @param transactionID is required when used outside DocumentViewComponent */
  public async getAttachedFiles(transactionID?: string) {
    if (this._attachments) {
      const data = {...this._attachments};
      delete data[0]; /* Delete root folder information */
      return Object
        .values(data) /* Turn object to array to manipulate it further */
        .flat() /* Flatten nested files and folders */
        .filter((item: any) => item.Type !== '0'); /* Remove all 'folder' items and keep files */ 
    }
    return await this.FolderTree({TransactionID: transactionID})
      .pipe(mapTo(await this.getAttachedFiles()))
      .toPromise();
  }

  public getFileLinks(transactionID: string) {
    return from(this.getAttachedFiles(transactionID)).pipe(
      tap(console.log),
      filter(files => !!files && !!files.length), /* Filter out the cases when there is no value to avoid errors */
      switchMap(files => forkJoin(files.map(file => this._getLotMediaFileLink(transactionID, file.ID)))),
      map(links => {
        const fileLinks = {};
        links.forEach(obj => {
          Object.entries(obj).forEach(entry => {
            fileLinks[entry[0]] = entry[1];
          })
        });
        return fileLinks;
      }),
    )
  }

  private _getLotMediaFileLink(transactionID: string, docID: string = null) {
    const url = `${environment.Setting.BaseAPIUrlLmk}/documentView/filelink`;
    return this.http
      .post(url, null, {params: this.api.setParams({transactionID, docID}), headers: this.api.setHeaders()})
      .pipe(
        map((data: any) => data.filelink ? `${environment.Setting.mediaUrl}/${data.filelink}`.toLowerCase() : 'assets/styles/images/no-thumb.svg'),
        map(link => {
          const item = {};
          item[docID] = link;
          return item;
        }),
        catchError(_ => {
          const item = {};
          item[docID] = 'assets/styles/images/no-thumb.svg';
          return of(item);
        }),
      );
  }

  private _convertFileToBase64(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  FolderTree(objFolderData, isSale = false) {
    objFolderData = {
      DocumentID: objFolderData.DocumentID || '',
      ProcessName: objFolderData.ProcessName || sessionStorage.getItem('AppName'),
      TransactionID: objFolderData.TransactionID,
      TimeZone: objFolderData.TimeZone || new Date().getTimezoneOffset(),
      IsActive: objFolderData.IsActive || '',
      IsFeatured: objFolderData.IsFeatured || '',
    };
    if (isSale) {
      return this.api.postForLMK(`crmsales/getSaleTree`, objFolderData);
    }
    else {
      return this.api.post(`documentView/getTree`, objFolderData).pipe(
        tap(data => this._attachments = data),
      );
    }
  }

  UpdateDocuments(updateDocument: any) {
    return this.api.post('documentView/updateDocument', updateDocument);
  }

  CreateFolder(createFolder) {
    return this.api.post('documentView/createFolder', createFolder);
  }

  CreateDocumentTree(createDocument: any) {
    return this.api.post(`documentView/documentList`, createDocument);
  }
  UploadFile(url: string, formData: FormData) {
    return this.api.UploadFile(url, formData);
  }
  DeleteFile(url: string, formData: FormData) {
    return this.api.DeleteFile(url, formData);
  }
  downloadfile(url: string, formData: FormData) {
    return this.api.postGetFile(url, formData, 'blob');
  }
  downloadfileforSignature(url: string, formData: FormData) {
    return this.api.postGetFileforSignature(url, formData, 'blob');
  }
  setActive(transactionID, DocID, status) {
    return this.api.post('documentView/SetActiveDocument?documentID=' + DocID + '&transactionID=' + transactionID + '&status=' + status, null);
  }
  setFeatured(transactionID, DocID) {
    return this.api.post('documentView/SetFeaturedDocuments?documentID=' + DocID + '&transactionID=' + transactionID, null);
  }
}
