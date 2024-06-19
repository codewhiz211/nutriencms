import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ContentManagerService } from '@app/core/services/content-manager.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { MessageService } from '@app/core';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { ImageCompressorService } from '@app/core/services/image-compressor.service';
import { tap } from 'rxjs/operators';
import { UserDetail } from '@app/core/models/user-detail';
import { environment } from '@env/environment';
@Component({
  selector: 'app-add-edit-banner',
  templateUrl: './add-edit-banner.component.html',
  styleUrls: ['./add-edit-banner.component.scss']
})
export class AddEditBannerComponent implements OnInit {
  activeItemsCount: number;
  prevItemStatus:any;
  rendomNumber;
  isShowSave:boolean = true;
  bannerStatus = [
    { status: 'Active', value: 1 },
    { status: 'Inactive', value: 0 }
  ];
  addEditData = {
    DataID: '',
    TempDataID: 0,
    Name: '',
    Status: 'Active',
    Description: '',
    Document: '',
    Category: '',
    AssetType: 'Banner',
    file: [{
      OriginalFileName: '',
      ModifiedFileName: '',
      Filesize: '',
      ControlName: ''
    }]
  };

  selectedFile;
  fileType;
  fileSize;
  formVal = true;
  addEditBanner = 'Add';



  file: File = null;
  errorMsg: string;
  fileName: string;
  fileId: string;

  // Banner dimensions in px
  width = 1596;
  height = 300;
  croppedImage: any = '';
  imageChangedEvent: any;

  transform: ImageTransform = {scale: 1};
  isBuyerAccess: boolean=false;

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private contentManager: ContentManagerService,
    private modalService: NgbModal,
    private msg: MessageService,
    private compressor: ImageCompressorService
  ) { }

  ngOnInit() {
    this.isBuyerAccess = this.contentManager.hasBuyerFullAccess;
  }

  onSubmit(val, userForm) {
    if(this.addEditBanner === 'Edit' && this.prevItemStatus === 'Inactive'){
        if(userForm.value.Status === 'Active' && this.activeItemsCount >= 5){
          this.msg.showMessage('Warning', {body: 'You cannot have more than 5 active banners.<br/> Please change the status of this banner to "Inactive" to save.'});
          return;
        }
    }
    else if(this.addEditBanner === 'Add'){
      if (userForm.value.Status === 'Active' && this.activeItemsCount >= 5) {
        this.msg.showMessage('Warning', {body: 'You cannot have more than 5 active banners.<br/> Please change the status of this banner to "Inactive" to save.'});
        return;
      }
    }     
    if (val) {
      this.upload();
    }
  }

  /*------------------- Handle File Uploading  -------------------*/
  handleFileInput(event, id: TemplateRef<any>) {
    let files = event.target.files;
    this.fileType = (files[0].name).substring((files[0].name).lastIndexOf('.') + 1).toLowerCase();
    this.fileSize = (files[0].size / 1024);
    //File Size changed form 200KB to 60 MB
    if ((this.fileType === 'png' || this.fileType === 'jpg') && (this.fileSize <= 61440)) { // Kendall changed size to 100KB to 200KB
      this.file = files.item(0);
      this.errorMsg = '';
      this.fileName = this.file.name;
      this.imageChangedEvent = event;
      this.modalService.open(id, {ariaLabelledBy: 'modal-basic-title'});
    } else {
      this.msg.showMessage('Warning', {body: 'Image must be .jpg or .png and under 60 MB'});
      // this.showErrorMessage('Image must be .jpg or .png and under 200KB.', 'Warning !' , false);
      files = null;
      this.fileName = '';
      this.addEditData.Name = '';
    }
  }

  /*------------------- Submit Add/Edit Data -------------------*/
  post() {
    this.contentManager.AddOrUpdate(this.addEditData).subscribe(Result => {
      if (Result.DataID) {
        this.toastr.success('Data saved successfully');
        this.activeModal.close(Result);
      }
      this.modalService.dismissAll();
    },
      err => {
        if(!!err && !!err.error && !! err.error.message){
          this.toastr.error(err.error.message);
        }  else{
          console.log(err);
          return ;
        }              
        this.activeModal.close(0);
      });
  }

  /*------------------- Upload file -------------------*/
  upload(): boolean {
    if (this.file === null) {
      if (this.addEditData.DataID != null) {
        this.addEditData.file = [];
        this.post();
        return true;
      }
      this.errorMsg = 'Please select file';
      return false;
    }
    this.errorMsg = '';
    this.fileName = '';
    const formData = new FormData();
    const TempDataID = (Math.floor(Math.random() * 10) + 208);
    formData.append('uploadFile', this.file);
    this.contentManager.uploadFile('contentmanager/uploadDocumentContentManager' + '?dataID=' + this.addEditData.DataID +
      '&tempDataID=' + TempDataID, formData).subscribe(Result => {
        if (Result) {
          this.addEditData.file[0].OriginalFileName = Result.OriginalFileName;
          this.addEditData.file[0].ModifiedFileName = Result.ModifiedFileName;
          this.addEditData.file[0].Filesize = Result.FileSize;
          this.addEditData.TempDataID = TempDataID;
          this.file = null;
          this.post();
          return true;
        } else {
          this.toastr.error(Result.Message, 'Error');
          return false;
        }
      }, error => { console.log(error); });

    this.transform.scale = 1; /* Reset scale  of image cropper*/

  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
  }

  async Cropped(modal) {
    this.compressor
      .compress(this.croppedImage, this.imageChangedEvent.target.files.item(0).name)
      .pipe(tap(fileObject => {
        this.file = fileObject;
        modal.dismiss()
      }))
      .toPromise();
    
  }

  onZoomIn() {
    const scale = this.transform.scale + 0.1;
    this.transform = {...this.transform, scale};
  }

  onZoomOut() {
    const scale = this.transform.scale - 0.1;
    this.transform = {...this.transform, scale};
  }

  /*------------------- Download File -------------------*/
  downloadFile() {
    const fileData = {
       dataID: this.addEditData.DataID,
       fileID: this.fileId
    };
    this.contentManager.getFile(fileData).subscribe(data => {
      saveAs(data, this.fileName);
    }, err => {
    });
  }

}
