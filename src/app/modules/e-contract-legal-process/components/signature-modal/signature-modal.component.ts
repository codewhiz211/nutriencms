import { Component, AfterViewChecked, ViewChild, OnInit, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signature-modal',
  templateUrl: './signature-modal.component.html',
  styleUrls: ['./signature-modal.component.scss']
})
export class SignatureModalComponent implements OnInit, AfterViewChecked {

  @ViewChild('signaturePad', { static: false }) signaturePad: SignaturePad;

  signatureWidth: number;
  signatureHeight: number;

  previewUrl: any = null;
  signText: string;
  selectedTextType = 1;

  signaturePadOptions = {
    minWidth: 3,
    canvasHeight: 300,
    backgroundColor: 'rgb(255,255,255)'
  };

  previousSignPadWidth = 0;
  originalSignPadWidth = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    let width = 800;
    if (this.el.nativeElement.offsetWidth < 766) {
      width = 300;
    } else if (this.el.nativeElement.offsetWidth < 1022) {
      width = 450;
    }
    this.signaturePadOptions.canvasHeight = Math.floor((this.signatureHeight / this.signatureWidth) * width);
  }

  ngAfterViewChecked() {
    if (this.previousSignPadWidth !== document.getElementById('sign_canvas').offsetWidth) {
      this.resizeSignaturePad();
    }
  }

  resizeSignaturePad() {
    // keep and rescale signature data before canvas is resized because it's automatically cleared by browser
    const signatureData = this.signaturePad.toData();
    const currentSignPadWidth = document.getElementById('sign_canvas').offsetWidth;
    const scale = this.previousSignPadWidth / currentSignPadWidth;
    if (this.originalSignPadWidth >= currentSignPadWidth && this.originalSignPadWidth >= this.previousSignPadWidth) {
      signatureData.forEach((line: any) => {
        line.forEach((point: any) => {
          point.x /= scale;
          point.y /= scale;
        });
      });
    }
    this.signaturePad.set('canvasWidth', currentSignPadWidth);
    this.previousSignPadWidth = currentSignPadWidth;
    // write the saved signature image data after resizing
    this.signaturePad.fromData(signatureData);
  }

  clear() {
    this.signText = '';
    const c1: any = document.getElementById('textCanvas1');
    const ctx1 = c1.getContext('2d');
    ctx1.clearRect(0, 0, c1.width, c1.height);

    this.previewUrl = null;
    this.signaturePad.clear();
  }

  drawComplete() {
    this.originalSignPadWidth = document.getElementById('sign_canvas').offsetWidth;
  }

  drawTextToCanvas() {
    const c1: any = document.getElementById('textCanvas1');
    const ctx1 = c1.getContext('2d');
    const stringWidth = ctx1.measureText(this.signText).width;
    if (stringWidth > 800) {
      c1.width = 800;
    } else if (stringWidth < this.signatureWidth) {
      c1.width = this.signatureWidth;
    } else {
      c1.width = stringWidth + 12;
    }
    ctx1.font = '24px Times New Roman';
    ctx1.fillStyle = 'white';
    ctx1.fillRect(0, 0, c1.width, c1.height);
    ctx1.fillStyle = 'black';
    ctx1.fillText(this.signText, (c1.width - stringWidth) / 2, 53);
  }

  handleInputChange(e: any) {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    const pattern = /image-*/;
    const reader = new FileReader();
    // this is for displaying validation errors
    if (!file.type.match(pattern)) {
        this.toastr.error('Invalid Format.');
        return;
    // size can't be > 10 MB
    } else if (file.size > 10000000) {
        this.toastr.error('File is too large. Please make sure it is under 10 MB.');
        return;
    }
    reader.onload = (event: any) => {
      this.previewUrl = event.target.result;
    };
    reader.readAsDataURL(file);

  }

  apply(type: 'text' | 'sign' | 'image') {    
    let data: any;
    if (type === 'text') {
      if (this.signText) {
        const c: any = document.getElementById('textCanvas1');
        data = {
          height: this.signatureHeight,
          content: c.toDataURL()
        };
      }
    } else if (type === 'sign') {
      if (!this.signaturePad.isEmpty()) {
        data = {
          height: this.signaturePadOptions.canvasHeight,
          content: this.signaturePad.toDataURL()
        };
      }
    } else if (type === 'image') {
      if (this.previewUrl) {
        const img = document.createElement('img');
        img.src = this.previewUrl
        const canvas = document.createElement('canvas');
        canvas.width = this.signatureWidth;
        canvas.height = this.signatureHeight;

        canvas.getContext('2d').drawImage(img, 0, 0, this.signatureWidth, this.signatureHeight);

        data = {
          height: this.signatureHeight,
          content: canvas.toDataURL()}
        ;
      }
    }

    this.activeModal.close(data);
  }

}
