import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '../message/message.component';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { MediaService } from '@app/core/services/media.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { MessageService } from '@app/core';
import { ImageCompressorService } from '@app/core/services/image-compressor.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-media-view',
  templateUrl: './media-view.component.html',
  styleUrls: ['./media-view.component.scss']
})
export class MediaViewComponent implements OnInit {

  @Input()
  dmogGuid: string;
  width: number;
  height: number;
  Croppedwidth: number;
  Croppedheight: number;
  transform: ImageTransform = {scale: 1};

  imageChangedEvent: any = '';
  croppedImage: any = '';
  errorMsg: string;

  listData: any[];
  transId: string;
  ImageList = [];

  isProcess = true;
  processCompleted = 0.0;
  ProcessPer = 0;

  constructor(
    private compressor: ImageCompressorService,
    private msg: MessageService,
    private mda: MediaService, 
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private spinner: SpinnerVisibilityService) { }

  ngOnInit() {
    this.transId = this.route.snapshot.paramMap.get('id');
    this.LoadData();
  }
  LoadData() {
    this.spinner.hide();
    console.log();
    this.mda.getList({ transactionID: this.transId }).subscribe(result => {
      console.log(result);
      result.forEach((element) => {
        if (element.MediaType === 'image') {
          this.download(element.MediaID);
        }
      });
      this.listData = result;
    },
      err => {
        console.log(err);
      });
  }
  fileChangeEvent(event: any, id, width, height): void {
    this.width = width;
    this.height = height;
    const file = event.target.files.item(0);
    const filetype = file.type.split('/')[0];
    if (filetype === 'image') {
      this.errorMsg = '';
      this.imageChangedEvent = event;
      this.modalService.open(id, { ariaLabelledBy: 'modal-basic-title' });
    } else if (filetype === 'video') {
      this.CreateChunk(file, file.name, file.type);
    } else {
      this.msg.showMessage('Warning', {body: 'Not a valid file'});
      // this.showErrorMessage('Not a valid file', 'Warning !', 'Ok', null, false);
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = {...event, file: this.imageChangedEvent.target.files.item(0)};
    this.Croppedwidth = event.width;
    this.Croppedheight = event.height;
    // console.log(event);
  }
  Cropped() {
    if (this.height >= this.Croppedheight && this.width >= this.Croppedwidth) {
      this.compressor
        .compress(this.croppedImage, this.imageChangedEvent.target.files.item(0).name)
        .pipe(tap(file => {
          this.CreateChunk(file, file.name, file.type);
          this.modalService.dismissAll();
        }))
        .toPromise();    
    } else
        this.msg.showMessage('Fail', {body: 'Image size is not correct'});
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

  // Here i am going to create chunk and upload on remote.
  CreateChunk(file, fileName, type) {
    const fileChunks = this.mda.getChunk(file, type);
    this.isProcess = false;
    this.processCompleted = 0.1;
    this.ProcessPer =  100 / fileChunks.length;
    const filetype = type.split('/')[0];
    this.uploadFileChunk(fileChunks, fileName, 0, fileChunks.length, filetype);
  }

  uploadFileChunk(fileChunks, fileName, currentPart, totalPart, type) {
    const formData = new FormData();
    formData.append('uploadFile', fileChunks[currentPart], fileName);
    formData.append('transactionID', this.transId);
    formData.append('dmogGuid', this.dmogGuid);
    formData.append('mediaType', type);
    formData.append('totalPart', totalPart);
    formData.append('partIndex', currentPart);
    this.spinner.hide();
    this.mda.uploadFile(formData).subscribe(result => {
      if (result.status === true) {
        if ((totalPart - 1) === currentPart) {
          // Whole file uploaded
          this.isProcess = true;
          this.processCompleted = 100;
          this.mda.getSingle(this.transId, result.MediaID).subscribe(res => {
            if (this.listData.length === 0) {
              this.setFeatured(res);
            }
            this.listData.push(res);
            this.download(res.MediaID);
          });
          console.log('whole file uploaded successfully');
        } else {
          // Show uploading progress
          currentPart += 1;
          this.processCompleted = Number.parseFloat((this.processCompleted + this.ProcessPer).toFixed(1));
          this.uploadFileChunk(fileChunks, fileName, currentPart, totalPart, type);
        }
      } else {
        // retry message to upload rest of the file
        this.isProcess = true;
        console.log('failed to upload file part no: ' + currentPart);
      }
      this.transform.scale = 1;
    });
  }
  download(mediaID) {
    this.mda.getFile(mediaID).subscribe(data => {
      console.log('Img');
      console.log(data);
      this.createImageFromBlob(data, mediaID);
    }, err => {
    });
  }
  createImageFromBlob(image: Blob, mediaid: string) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.ImageList[mediaid] =  reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
  setFeatured(item) {
    this.mda.setFeatured(this.transId, item.MediaID).subscribe(result => {
      if (result) {
        this.listData.map(x => x.Featured = 'unfeatured');
        item.Featured = 'Featured';
      }
    });
  }
  setStatus(item) {
    this.mda.setStatus(this.transId, item.MediaID, item.Status === 'Active' ? 0 : 1).subscribe(result => {
      if (result) {
        item.Status = item.Status === 'Active' ? 'Inactive' : 'Active';
      }
    });
  }
  Delete(item) {
    this.mda.Delete(this.transId, item.MediaID).subscribe(result => {
      if (result) {
        const ind = this.listData.findIndex(x => x.MediaID === item.MediaID);
        this.listData.splice(ind, 1);
      }
    });
  }
}
