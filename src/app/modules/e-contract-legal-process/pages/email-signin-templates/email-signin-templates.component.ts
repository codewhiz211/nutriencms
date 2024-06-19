import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { environment } from '@env/environment';

import { ApiESaleyardService, DocumentViewService } from '@app/core';
import { SignatureModalComponent } from '../../components/signature-modal/signature-modal.component';
import * as watermark from 'watermarkjs';

//WATERMARK_IMAGE_URL : string = 'assets/styles/images/NutrienWaterMark.png';


@Component({
  selector: 'app-email-signin-templates',
  templateUrl: './email-signin-templates.component.html',
  styleUrls: ['./email-signin-templates.component.scss']
})

export class EmailSigninTemplatesComponent implements OnInit, OnDestroy {
  WATERMARK_IMAGE_URL:string;
  processName: string;
  TrnsctnID: string;
  cc: string;
  isForwardSupplier = false;
  resultstr: any;
  submitFlag = false;
  showSubmitBtn = false;
  triggerName: any;
  signRole: string;
  signRoleHtml: string;
  isSignatureModalOpened: boolean;
  alertModalRef: BsModalRef;
  copyType: string;

  signatureElement: any;
  signatureHeight: number;
  signatureWidth: number;

  private unsubscribe: Subscription[] = [];
  Accesstoken: any;


  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    document.getElementById('cms-header').classList.add('sticky');
    document.getElementById('signature-header').classList.add('sticky');
    document.getElementById('email-signin-template').classList.add('sticky');
  }


  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private bsModalService: BsModalService,
    private api: ApiESaleyardService,
    public documentViewService: DocumentViewService
  ) { }

  ngOnInit() {        
    const routerSubscription = this.route.queryParams.subscribe(params => {
      this.TrnsctnID = params.TrnsctnID;
      this.cc = params.cc;
      this.processName = params.processName;

      this.submitFlag = false;
      this.showSubmitBtn = false;
      this.isSignatureModalOpened = false;

      if (this.cc === environment.Setting.signRoleKey.vendor) {
        this.copyType = 'Vendor Copy';
        this.signRole = environment.Setting.signRoleClass.vendor;
      } else if (this.cc === environment.Setting.signRoleKey.buyer) {
        this.copyType = 'Buyer Copy';
        this.signRole = environment.Setting.signRoleClass.buyer;
      } else if (this.cc === environment.Setting.signRoleKey.agent) {
        this.isForwardSupplier = true;
        this.copyType = 'Forward Supply Approval';
        this.signRole = environment.Setting.signRoleClass.agent;
      }

      const parameters: any = {
        processname: this.processName,
        transactionId: this.TrnsctnID,
        partner: this.cc
      };

      this.unsubscribe.push(
        this.api.getWithoutToken('LegalDocument/GetLegalDoc', parameters).subscribe(res2 => {
          this.setDynamicLoadingWithFilter(typeof res2 === 'string' ? JSON.parse(res2)[0] : res2[0]);
        }, err => {
          console.log(err);
        })
      );

    });
    this.unsubscribe.push(routerSubscription);
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

  disableInputs() {
    (document.getElementById('vendrname') as HTMLInputElement).readOnly = true;
    (document.getElementById('vendremail') as HTMLInputElement).readOnly = true;
    (document.getElementById('buyername') as HTMLInputElement).readOnly = true;
    (document.getElementById('buyeremail') as HTMLInputElement).readOnly = true;
    (document.getElementById('agentname') as HTMLInputElement).readOnly = true;
    (document.getElementById('agentemail') as HTMLInputElement).readOnly = true;
  }

  signElmClickCallback() {    
    if (!this.isSignatureModalOpened) {
      this.isSignatureModalOpened = true;
      const modalRef = this.modalService.open(SignatureModalComponent, { backdrop: 'static', keyboard: false, size: 'lg' });
      const modalInstance: SignatureModalComponent = modalRef.componentInstance;
      modalInstance.signatureWidth = this.signatureWidth;
      modalInstance.signatureHeight = this.signatureHeight;
      modalRef.result.then(result => {
        this.isSignatureModalOpened = false;

        if (result) {
          this.signatureElement.innerHTML = '';
          const img = document.createElement('img');
          img.style.height = this.signatureHeight + 'px';         
          const image = {
            url: this.WATERMARK_IMAGE_URL,
            height: result.height
          };

          this.unsubscribe.push(
            this.getResizedWaterMark(image).subscribe(waterMarkImg => {
              watermark([result.content, waterMarkImg])
                .image(watermark.image.center(0.09))
                .then(wImg => {
                  img.src = (wImg as HTMLImageElement).src;
                  this.signatureElement.appendChild(img);
                });
            })
          );
        } else {
          this.signatureElement.innerHTML = '';
        }

      }, reason => {
        this.isSignatureModalOpened = false;
      });
    }
  }


  checkSignin() {
    const elems = document.getElementsByClassName(this.signRole);
    this.signatureElement = elems[0];

    if (this.signatureElement) {
      this.disableInputs();

      if (this.signatureElement.innerHTML !== '') {
        return;
      }

      if (this.signRole === environment.Setting.signRoleClass.vendor) {
        (document.getElementById('vendrname') as HTMLInputElement).readOnly = false;
        (document.getElementById('vendremail') as HTMLInputElement).readOnly = false;
      } else if (this.signRole === environment.Setting.signRoleClass.buyer) {
        (document.getElementById('buyername') as HTMLInputElement).readOnly = false;
        (document.getElementById('buyeremail') as HTMLInputElement).readOnly = false;
      } else if (this.signRole === environment.Setting.signRoleClass.agent) {
        (document.getElementById('agentname') as HTMLInputElement).readOnly = false;
        (document.getElementById('agentemail') as HTMLInputElement).readOnly = false;
      }

      this.signatureHeight = this.getSignatureHeight(); 
      const image = {
        url: this.WATERMARK_IMAGE_URL
      }
      this.unsubscribe.push(
        this.getImageDimension(image).subscribe(
          response => { 
            this.signatureWidth = Math.round((response.width / response.height) * this.signatureHeight) + 1;
            this.signatureElement.addEventListener('click', this.signElmClickCallback.bind(this));
          }
        )
      );
    }
  }

  // calculate the height of signature
  getSignatureHeight() {
    const computedStyle = getComputedStyle(this.signatureElement);
    let elementHeight: any;
    elementHeight = this.signatureElement.clientHeight;  // height with padding
    elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    return elementHeight;
  }

  getResizedWaterMark(image: any): Observable<any> {
    return new Observable(observer => {
        const img = new Image();
        img.onload = function (event) {
          const loadedImage: any = event.currentTarget;

          const elem = document.createElement('canvas');
          elem.height = image.height;
          elem.width = Math.round((loadedImage.width / loadedImage.height) * image.height) + 1;

          // draw in canvas
          const ctx = elem.getContext('2d');
          ctx.drawImage(img, 0, 0, elem.width, elem.height);

          // get the base64-encoded Data URI from the resize image
          observer.next(elem.toDataURL());
          observer.complete();
        }
        img.src = image.url;
    });
  }

  getImageDimension(image): Observable<any> {
    return new Observable(observer => {
        const img = new Image();
        img.onload = function (event) {
            const loadedImage: any = event.currentTarget;
            image.width = loadedImage.width;
            image.height = loadedImage.height;
            observer.next(image);
            observer.complete();
        }
        img.src = image.url;
    });
  }

  public base64ToBlob(b64Data, type, sliceSize = 512) {
    const byteCharacters = atob(b64Data); // data.file there
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type });
  }

  isIE() {
    const ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
  }

  readyPreview() {
    // Get the modal    
    const modal = document.getElementById('previewModal');
    // Get the image and insert it inside the modal
    const images = document.querySelectorAll('table img');
    const modalImg = document.getElementById('img01') as HTMLImageElement;

    for (let i = 0; i < images.length; i++) {
      const img = images[i] as HTMLImageElement;
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        const fileName = img.nextElementSibling.innerHTML;
        const fullFileName = img.nextElementSibling.attributes['title'].value;              
        let exttyp = (fileName.split('.').pop()).toLowerCase();       
        if(exttyp  === 'jpeg' || exttyp === 'jpg' || exttyp === 'png'){
          modal.style.display = 'block';
             modalImg.src = img.src;
        }
        else{
          const data_img = img.dataset.img;
          const formData = new FormData();
          formData.append('transactionID', data_img.split('~')[0]);
          formData.append('processName', 'LMKOpportunities');
          formData.append('docName', fullFileName);
          formData.append('path', data_img.split('~')[1]);
          formData.append('FileName', fullFileName);
          formData.append('type', '1');          
          this.documentViewService.downloadfileforSignature('documentView/downloadfile', formData).subscribe(
            (resultBlob: Blob) => {
              if (exttyp === 'pdf') {
              var contantType = '';
                contantType = 'application/pdf';              
                let file = new Blob([resultBlob], { type: contantType });
                let fileURL = URL.createObjectURL(file);
                window.open(fileURL);              
            }
            else {
              saveAs(resultBlob, fullFileName);
            }
          }, err => {
            console.log(err);
          });
        }            
      });
    }

    // Get the <span> element that closes the modal
    const span = document.querySelectorAll('#previewModal .close')[0];

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  setDynamicLoadingWithFilter(data: any) {        
    this.resultstr = data.CONTENTDESCRIPTION;
    this.Accesstoken = data.ACCESSTOKEN;
    var parser = new DOMParser();
    var doc = parser.parseFromString(this.resultstr, 'text/html');    
    this.WATERMARK_IMAGE_URL = doc.images[0].src;
    if (data.PARTNERSIGNED === '1') {
      this.submitFlag = true;
    } else {
      this.showSubmitBtn = true;
    }
    this.triggerName = data.TRGNAM;
    setTimeout(() => {
      this.checkSignin();
      this.readyPreview();
    });
  }


  onsubmit(alertModal: any) {
    if (this.signatureElement) {
      if (this.signatureElement.innerHTML === '') {
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1) {
          document.documentElement.scrollTop = this.signatureElement.offsetTop - 100;
        } else {
          window.scrollTo({
            top: this.signatureElement.offsetTop - 100,
            behavior: 'smooth',
          });
        }

        setTimeout(() => {
          this.alertModalRef = this.bsModalService.show(alertModal);
        }, 1000);
        return;
      }

      this.saveData();
    }
  }

  saveData() {
    const maindivtemplates = document.getElementById('maindivtemplates') as HTMLElement;

    const data: any = {
      Identifier: {
        Name: '',
        Value: '',
        TrnsctnID: this.TrnsctnID,
        processName: 'Econtract_Legal_Process'
      },
      ContractTemplate: '',//maindivtemplates.innerHTML
      processName: 'Econtract_Legal_Process',
      TriggerName: this.triggerName,
      UserName: 'developer_account',
      UniqueConstraints: '',
      Data: [],
      ParentTransactionID: '',
      TempTransactionID: '',
      IsBulkUpload: true,
      CurrentStateName: '',
      agentSign: '',
      buyerSign: '',
      vendorSign: '',
      parallelemail: true,
      VendorPrintName: '',
      VendorEmail: '',
      BuyerPrintName: '',
      BuyerEmail: '',
      AgentPrintName: '',
      AgentEmail: ''
    };


    if (this.signRole === environment.Setting.signRoleClass.vendor) {
      data.vendorSign = this.signatureElement.innerHTML;
      data.Data.push({ ECLG_Setting_vendorsign: 'Yes' });
      data.VendorPrintName = (document.getElementById('vendrname') as HTMLInputElement).value;
      data.VendorEmail = (document.getElementById('vendremail') as HTMLInputElement).value;
    } else if (this.signRole === environment.Setting.signRoleClass.buyer) {
      data.buyerSign = this.signatureElement.innerHTML;
      data.Data.push({ ECLG_Setting_BuyerSigned: 'Yes' });
      data.BuyerPrintName = (document.getElementById('buyername') as HTMLInputElement).value;
      data.BuyerEmail = (document.getElementById('buyeremail') as HTMLInputElement).value;
    } else if (this.signRole === environment.Setting.signRoleClass.agent) {
      data.agentSign = this.signatureElement.innerHTML;
      data.Data.push({ ECLG_Setting_suppliersign: 'Yes' });
      data.AgentPrintName = (document.getElementById('agentname') as HTMLInputElement).value;
      data.AgentEmail = (document.getElementById('agentemail') as HTMLInputElement).value;
    }

    this.unsubscribe.push(
      this.api.postWithoutToken('LegalDocument/updateapplication', data).subscribe(result => {
        this.toastr.success('Contract signed successfully.');
        this.disableInputs();
        this.submitFlag = true;
        this.showSubmitBtn = false;
        const newElm = this.signatureElement.cloneNode(true);
        this.signatureElement.parentNode.replaceChild(newElm, this.signatureElement);
      })
    );
  }
}
