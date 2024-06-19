import { Component, OnInit } from '@angular/core';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContentManagerService } from '@app/core/services/content-manager.service';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { Title } from '@angular/platform-browser';
import { MessageService } from '@app/core';
import { ImageCompressorService } from '@app/core/services/image-compressor.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  textAreaRegex = /[^A-Za-z&\"?!,.*\s]/g;
  addEditData = {
    DataID: '',
    TempDataID: 0,
    Name: '',
    Status: 'Active',
    Description: '',
    Document: '',
    Category: '',
    AssetType: 'ESaleyardContent',
    file: []
  };
  bodyData = {
    AssetType: 'ESaleyardContent',
    PageSize: 1,
    PageNumber: 1,
    SortColumn: '-1',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };
  file: File = null;
  errorMsg: string[5];
  fileName = {
    ClassifiedTile: '',
    BidAndOfferType: '',
    PastSalesTile: '',
    LoginToBid: '',
    FindAndAgent: '',
    LiveStock: ''
  };
  fileId = {
    ClassifiedTile: '',
    BidAndOfferType: '',
    PastSalesTile: '',
    LoginToBid: '',
    FindAndAgent: '',
    LiveStock: ''
  };
  processName: string;
  formVal = true;
  assetList: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  index: number;
  ControlName: any;
  files = [];
  width: number;
  height: number;
  transform: ImageTransform = {scale: 1};
  Croppedwidth: number;
  Croppedheight: number;
  isBuyerAccess: boolean = false;
  constructor(
    private compressor: ImageCompressorService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private contentManager: ContentManagerService,
    private titleService: Title,
    private msg: MessageService,
    ) { }

              ngOnInit() {
                this.isBuyerAccess = this.contentManager.hasBuyerFullAccess;
                 this.setDocTitle('Content');
                 this.LoadData(this.bodyData);
              }
              LoadData(bodyData) {
                console.log(bodyData);
                this.contentManager.getContentManagerList(bodyData).subscribe(x => {
                  console.log(x.ContentManager);
                  if (x.ContentManager !== null && x.ContentManager.length > 0) {
                  this.addEditData.DataID = x.ContentManager[0].DataID;
                  this.addEditData.Name = x.ContentManager[0].Name;
                  this.addEditData.Description = x.ContentManager[0].Description;
                  this.addEditData.Document = x.ContentManager[0].Document;
                  this.addEditData.Category = x.ContentManager[0].Category;
                  x.ContentManager[0].files.forEach(element => {
                    this.addEditData.file.push(
                      {
                        OriginalFileName: element.OriginalFileName,
                        ModifiedFileName: element.ModifiedFileName,
                        Filesize: element.FileSize,
                        ControlName: element.ControlName,
                        FileID: element.FileID
                      });
                    this.fileName[element.ControlName] = element.FileName;
                    this.fileId[element.ControlName] = element.FileID;
                  });
                }
                },
                  err => {
                    console.log(err);
                  });
              }
  
  // onZoomChange(event: Event) {
  //   const scale = 1 + (event.target['valueAsNumber'] - 50) / 50;
  //   this.transform = {...this.transform, scale};
  // }
  
  onZoomIn() {
    const scale = this.transform.scale + 0.1;
    this.transform = {...this.transform, scale};
  }

  onZoomOut() {
    const scale = this.transform.scale - 0.1;
    this.transform = {...this.transform, scale};
  }

  fileChangeEvent(event: any, id, index, ControlName, width, height): void {    
    this.width = width;
    this.height = height;
    const file = event.target.files.item(0);
    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = file.name.split('.').slice(0, -1).join('.') + '.'+ ext;
    if (ext === 'jpg' || ext === 'png') {
      this.errorMsg = '';
      this.fileName[ControlName] = fileName;
      this.imageChangedEvent = event;
      this.index = index;
      this.ControlName = ControlName;
      this.modalService.open(id, {ariaLabelledBy: 'modal-basic-title'});
    } else {
      this.msg.showMessage('Warning', {body: 'Not a valid file'});
      // this.showErrorMessage('Not a valid file', 'Warning !', 'Ok', null, false);
    }
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event;
      this.Croppedwidth = event.width;
      this.Croppedheight = event.height;
  }
  
  Cropped() {
    if (this.height >= this.Croppedheight && this.width >= this.Croppedwidth) {
      const ind = this.files.findIndex(x => x.index === this.index);
      const ExistInd = this.addEditData.file.findIndex(x => x.ControlName === this.ControlName);
      let Fileid = '';
      if (ind > -1) {
        this.files.splice(ind, 1);
      }
      if (ExistInd > -1) {
        Fileid = this.addEditData.file[ExistInd].FileID;
      }
      this.compressor
        .compress(this.croppedImage, this.imageChangedEvent.target.files.item(0).name)
        .pipe(tap(fileObject => {
          this.files.push({
            file: {...this.croppedImage, file: fileObject}, 
            index: this.index,
            ControlName: this.ControlName, 
            FileID: Fileid, 
            ImgFileName: fileObject.name,
          });
          this.modalService.dismissAll();
        }))
        .toPromise();
    } else
        this.msg.showMessage('Warning', {body: 'Image size is not correct'});
  }
  onSubmit(val, userForm) {
    if (this.addEditData.Name.match(this.textAreaRegex) || this.addEditData.Document.match(this.textAreaRegex)) {
      this.msg.showMessage('Warning', {body: 'Form is invalid'});
      // this.showErrorMessage('Invalid form', 'Warning !', 'Ok', null, false);
      return;
    }
    if (val) {
      if (this.files.length === 0) {
        this.addEditData.file = [];
        this.post();
      } else {
        this.upload();
      }
    }
    this.transform.scale = 1; /* Reset scale  of image cropper*/
  }
  post() {
    console.log('Final Data' );
    console.log(this.addEditData);
    this.contentManager.AddOrUpdate(this.addEditData).subscribe(Result => {
      if (Result.DataID) {
        this.addEditData.DataID = Result.DataID;
        if (this.files.length > 0) {
          this.LoadData(this.bodyData);
        }
        this.toastr.success('Data saved successfully');
        this.files = [];
      }
    },
    err => {
      this.toastr.error(err.error.message);
    });
  }

  upload(): void {
    this.errorMsg = '';
    this.addEditData.file = [];
    const TempDataID = (Math.floor(Math.random() * 95) + 208);
    this.files.forEach((element, index) => {
    console.log(index);
    const ext = element.file.file.name.split('.').pop().toLowerCase();
    const fileName = element.file.file.name.split('.').slice(0, -1).join('.') + '.'+ ext;
    const formData = new FormData();
    formData.append('uploadFile', element.file.file, fileName);
    this.contentManager.uploadFile('contentmanager/uploadDocumentContentManager' + '?dataID=' + this.addEditData.DataID +
      '&tempDataID=' + TempDataID + '&controlName=' + element.ControlName, formData).subscribe(Result => {
      console.log(Result);
      if (Result) {
        this.addEditData.file.push(
          {
            OriginalFileName: Result.OriginalFileName,
            ModifiedFileName: Result.ModifiedFileName,
            Filesize: Result.FileSize,
            ControlName: element.ControlName,
            FileID: element.FileID
          }
        );
        this.addEditData.TempDataID = TempDataID;
        this.file = null;
        console.log('done');
        if (index === this.files.length - 1) {
          this.post();
        }
        return true;
      } else {
        this.toastr.error(Result.Message, 'Error');
        return false;
      }
    }, error => { console.log(error); });
  });
  }

  /*------------------- Show Popup -------------------*/
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsConfirmation: boolean) {
  //   const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
  //   const modalInstance: MessageComponent = modalMsgRef.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.ButtonText = buttonText;
  //   modalInstance.MessageHeader = HeaderMsg;
  //   modalInstance.MessagePopup = modalMsgRef;
  //   modalInstance.IsConfirmation = IsConfirmation;
  //   modalInstance.CallBackMethod = callback;
  //   modalInstance.Caller = this;
  // }
  CheckMaxLength(len) {
    return len > 24;
  }

  /*------------------- Download File -------------------*/
  downloadFile(control) {
    const fileData = {
       dataID: this.addEditData.DataID,
       fileID: this.addEditData.file.filter(x => x.ControlName === control).pop().FileID,
       controlName: control
    };
    this.contentManager.getFile(fileData).subscribe(data => {
      saveAs(data, this.fileName[control]);
    }, err => {
    });
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }
}
