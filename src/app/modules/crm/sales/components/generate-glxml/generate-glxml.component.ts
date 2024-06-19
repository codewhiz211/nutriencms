
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SalesService } from '../../services/sales.service';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-generate-glxml',
  templateUrl: './generate-glxml.component.html',
  styleUrls: ['./generate-glxml.component.scss']
})
export class GenerateGLXMLComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  loading = false;
  saleNumber=false;
  documentNumber=false;
  processdate=false;
  accumulation=false;
  agencysapnumber=false;
  saleseason=false;
  salecenter=false;
  storagecenter=false;
  wfiinvoiceno=false;
  wfibatchnumber=false;

ReportType = -1;
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private saleService: SalesService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      invoiceType: ['', Validators.required],
      saleNumber: ['', Validators.required],
      documentNumber: [''],
      processdate: [''],
      accumulation: [''],
      agencysapnumber: [''],
      saleseason: [''],
      salecenter: [''],
      storagecenter: [''],
      wfiinvoiceno: [''],
      wfibatchnumber: ['']

    });
  }

  get f() {
    return this.form.controls;
  }
  parseToYYMMDD(value: any): string | null {
    if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
      const str = value.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]);
      const date = Number(str[0]);
      return year +'-'+ month +'-'+ date;
    }
  }
  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.form.invalid) {
      this.loading = false;
      return;
    } else {
      let url = '';
      let FileName = '';
      const formvalue = this.form.value;
      let saleTranscId = '';
      if(this.ReportType == 6 || this.ReportType == 7){
        var processDate=this.parseToYYMMDD(formvalue.processdate);
         if (this.ReportType == 6){
          url = 'gl/LS_AgencyCommissionsNew?processDate='+processDate+'&interval='+formvalue.accumulation+'&agencyNumber='+formvalue.agencysapnumber;
          FileName = 'AgencyCommissionsProceedFile.xml';
        }
        else if (this.ReportType == 7){
          url = 'gl/LS_AgencyCommissionsGLIdocFileNew?processDate='+processDate+'&interval='+formvalue.accumulation+'&agencyNumber='+formvalue.agencysapnumber;
          FileName = 'AgencyCommissionsGLIdocFile.xml';
        }
        this.saleService.DwonloadXML(url).subscribe( (resultBlob: any) => {
          if(resultBlob.type == 'application/json'){
              this.toastr.warning('File not exists');
          } else{
          saveAs(resultBlob,FileName);
          }
        });
      }
      else if (this.ReportType == 10){
        url = 'gl/WFI_FT_Invoicing?invoiceNumber='+formvalue.wfiinvoiceno+'&batchNumber='+formvalue.wfibatchnumber;
        FileName = 'WFI_FT_Invoicing.xml';
        this.saleService.DwonloadXML(url).subscribe( (resultBlob: any) => {
          if(resultBlob.type == 'application/json'){
              this.toastr.warning('File not exists');
          } else{
          saveAs(resultBlob,FileName);
          }
        });
      }   else if (this.ReportType == 11){
        url = 'gl/WFI_GLIdocFile?batchNumber='+formvalue.wfibatchnumber;
        FileName = 'WFI_GLIdocFile.xml';
        this.saleService.DwonloadXML(url).subscribe( (resultBlob: any) => {
          if(resultBlob.type == 'application/json'){
              this.toastr.warning('File not exists');
          } else{
          saveAs(resultBlob,FileName);
          }
        });
      }  
     else if(this.ReportType == 8 || this.ReportType == 9){
         if (this.ReportType == 8){
          url = 'gl/AWH_FT_Proceed?documentNumber='+formvalue.documentNumber;
          FileName = 'AWHProceedFile.xml';
          this.saleService.DwonloadXML(url).subscribe( (resultBlob: any) => {
            if(resultBlob.type == 'application/json'){
                this.toastr.warning('File not exists');
            } else{
            saveAs(resultBlob,FileName);
            }
          });
        }
        else if (this.ReportType == 9){
          const bodyParam: any = {
            season: formvalue.saleseason,
            saleCentre: formvalue.salecenter,
            storageCentre: formvalue.storagecenter,
            saleNumber: formvalue.saleNumber
          }
          url = 'gl/AWH_SaleGLIdocFile';
          FileName = 'AWHGLIdocFile.xml';
          this.saleService.DwonloadXML(url,bodyParam).subscribe( (resultBlob: any) => {
            if(resultBlob.type == 'application/json'){
                this.toastr.warning('File not exists');
            } else{
            saveAs(resultBlob,FileName);
            }
          });
        }
     
      }else{
      this.saleService.getSaleTrnsctnid(formvalue.saleNumber).subscribe(x=>{

        if(this.ReportType == 0){
          url = 'gl/LS_FT_Invoicing?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleInvoicing.xml';
        }
        if(this.ReportType == 1){
          url = 'gl/LS_FT_Proceed?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleProceed.xml';
        }
        if(this.ReportType == 2){
          url = 'gl/LS_saleGLIdocFile?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleIdocFile.xml';
        }
       
        else if (this.ReportType == 3){
          url = 'gl/LS_FT_RVSL_Invoicing?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleReversalInvoicing.xml';
        }
        else if (this.ReportType == 4){
          url = 'gl/LS_FT_RVSL_Proceed?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleReversalProceed.xml';
        }
        else if (this.ReportType == 5){
          url = 'gl/LS_rvslSaleGLIdocFile?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleReversalIdocFile.xml';
        }
        else if (this.ReportType == 12){
          url = 'gl/LS_FT_Proceed_ThirdParty?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleThirdPartyProceeds.xml';
        } 
        else if (this.ReportType == 13){
          url = 'gl/LS_FT_Proceed_RCTI?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleCongAgentProceeds.xml';
        } 
        else if (this.ReportType == 14){
          url = 'gl/LS_FT_RVSL_Proceed_ThirdParty?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleRVSLThirdPartyProceeds.xml';
        } 
        else if (this.ReportType == 15){
          url = 'gl/LS_FT_RVSL_Proceed_RCTI?saleTransactionID='+x.trnsctnid+'&documentNumber='+formvalue.documentNumber;
          FileName = 'SaleRVSLCongAgentProceeds.xml';
        }       
        else if (this.ReportType == 16){
          url = 'gl/LS_AgencyGLXML?saleTransactionID='+x.trnsctnid;
          FileName = 'AgencyIdocFile.xml';
        }
        else if (this.ReportType == 17){
          url = 'gl/LS_AgencyGLXML?saleTransactionID='+x.trnsctnid+'&isReversal=true';
          FileName = 'RVSLAgencyIdocFile.xml';
        } 

        this.saleService.DwonloadXML(url).subscribe( (resultBlob: any) => {
          if(resultBlob.type == 'application/json'){
              this.toastr.warning('File not exists');
          } else{
          saveAs(resultBlob,FileName);
          }
        });
      })
   
    }
  }
  }
  Show(){
    this.ReportType = this.form.get('invoiceType').value;
    if(this.ReportType == 2 || this.ReportType == 5 || this.ReportType == 16 || this.ReportType == 17){
      this.form.get('saleNumber').setValidators([Validators.required]);
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('documentNumber').clearValidators();
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('processdate').clearValidators();
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').clearValidators();
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').clearValidators();
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('saleseason').clearValidators();
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').clearValidators();
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').clearValidators();
      this.form.get('storagecenter').updateValueAndValidity();
      this.form.get('wfiinvoiceno').clearValidators();
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.form.get('wfibatchnumber').clearValidators();
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.saleNumber=true;
      this.documentNumber=false;
      this.processdate=false;
      this.accumulation=false;
      this.agencysapnumber=false;
      this.saleseason=false;
      this.salecenter=false;
      this.storagecenter=false;
      this.wfibatchnumber=false;
      this.wfiinvoiceno=false;

    }else if(this.ReportType == 0 || this.ReportType == 1 || this.ReportType == 3 || this.ReportType==4 || this.ReportType == 12 || this.ReportType == 13|| this.ReportType == 14|| this.ReportType == 15){
      this.form.get('saleNumber').setValidators([Validators.required]);
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('documentNumber').setValidators([Validators.required]);
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('processdate').clearValidators();
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').clearValidators();
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').clearValidators();
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('saleseason').clearValidators();
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').clearValidators();
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').clearValidators();
      this.form.get('storagecenter').updateValueAndValidity();
      this.form.get('wfiinvoiceno').clearValidators();
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.form.get('wfibatchnumber').clearValidators();
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.saleNumber=true;
      this.documentNumber=true;
      this.processdate=false;
      this.accumulation=false;
      this.agencysapnumber=false;
      this.saleseason=false;
      this.salecenter=false;
      this.storagecenter=false;
      this.wfibatchnumber=false;
      this.wfiinvoiceno=false;
      
    }
    else if(this.ReportType==8){
      this.form.get('documentNumber').setValidators([Validators.required]);
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('saleseason').clearValidators();
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').clearValidators();
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').clearValidators();
      this.form.get('storagecenter').updateValueAndValidity();
      this.form.get('saleNumber').clearValidators();
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('processdate').clearValidators();
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').clearValidators();
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').clearValidators();
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('wfiinvoiceno').clearValidators();
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.form.get('wfibatchnumber').clearValidators();
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.saleNumber=false;
      this.documentNumber=true;
      this.processdate=false;
      this.accumulation=false;
      this.agencysapnumber=false;
      this.saleseason=false;
      this.salecenter=false;
      this.storagecenter=false;
      this.wfibatchnumber=false;
      this.wfiinvoiceno=false;
    }
    else if(this.ReportType==9){
      this.form.get('documentNumber').clearValidators();
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('saleseason').setValidators([Validators.required]);
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').setValidators([Validators.required]);
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').setValidators([Validators.required]);
      this.form.get('storagecenter').updateValueAndValidity();
      this.form.get('saleNumber').setValidators([Validators.required]);
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('processdate').clearValidators();
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').clearValidators();
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').clearValidators();
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('wfiinvoiceno').clearValidators();
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.form.get('wfibatchnumber').clearValidators();
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.saleNumber=true;
      this.documentNumber=false;
      this.processdate=false;
      this.accumulation=false;
      this.agencysapnumber=false;
      this.saleseason=true;
      this.salecenter=true;
      this.storagecenter=true;
      this.wfibatchnumber=false;
      this.wfiinvoiceno=false;
    }else if(this.ReportType==10){
      this.form.get('wfiinvoiceno').setValidators([Validators.required]);
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.form.get('documentNumber').clearValidators();
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('saleseason').clearValidators();
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').clearValidators();
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').clearValidators();
      this.form.get('storagecenter').updateValueAndValidity();
      this.form.get('saleNumber').clearValidators();
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('processdate').clearValidators();
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').clearValidators();
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').clearValidators();
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('wfibatchnumber').setValidators([Validators.required]);
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.saleNumber=false;
      this.documentNumber=false;
      this.processdate=false;
      this.accumulation=false;
      this.agencysapnumber=false;
      this.saleseason=false;
      this.salecenter=false;
      this.storagecenter=false;
      this.wfibatchnumber=true;
      this.wfiinvoiceno=true;
    }else if(this.ReportType==11){
      this.form.get('wfibatchnumber').setValidators([Validators.required]);
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.form.get('documentNumber').clearValidators();
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('saleseason').clearValidators();
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').clearValidators();
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').clearValidators();
      this.form.get('storagecenter').updateValueAndValidity();
      this.form.get('saleNumber').clearValidators();
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('processdate').clearValidators();
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').clearValidators();
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').clearValidators();
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('wfiinvoiceno').clearValidators();
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.saleNumber=false;
      this.documentNumber=false;
      this.processdate=false;
      this.accumulation=false;
      this.agencysapnumber=false;
      this.saleseason=false;
      this.salecenter=false;
      this.storagecenter=false;
      this.wfibatchnumber=true;
      this.wfiinvoiceno=false;
    }
     else {
      this.form.get('documentNumber').clearValidators();
      this.form.get('documentNumber').updateValueAndValidity();
      this.form.get('processdate').setValidators([Validators.required]);
      this.form.get('processdate').updateValueAndValidity();
      this.form.get('accumulation').setValidators([Validators.required]);
      this.form.get('accumulation').updateValueAndValidity();
      this.form.get('agencysapnumber').setValidators([Validators.required]);
      this.form.get('agencysapnumber').updateValueAndValidity();
      this.form.get('saleNumber').clearValidators();
      this.form.get('saleNumber').updateValueAndValidity();
      this.form.get('wfiinvoiceno').clearValidators();
      this.form.get('wfiinvoiceno').updateValueAndValidity();
      this.form.get('wfibatchnumber').clearValidators();
      this.form.get('wfibatchnumber').updateValueAndValidity();
      this.form.get('saleseason').clearValidators();
      this.form.get('saleseason').updateValueAndValidity();
      this.form.get('salecenter').clearValidators();
      this.form.get('salecenter').updateValueAndValidity();
      this.form.get('storagecenter').clearValidators();
      this.form.get('storagecenter').updateValueAndValidity();
      this.saleNumber=false;
      this.documentNumber=false;
      this.processdate=true;
      this.accumulation=true;
      this.agencysapnumber=true;
      this.saleseason=false;
      this.salecenter=false;
      this.storagecenter=false;
      this.wfibatchnumber=false;
      this.wfiinvoiceno=false;
    }
  }
}

