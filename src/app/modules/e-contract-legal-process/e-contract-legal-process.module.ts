import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignaturePadModule } from 'angular2-signaturepad';
import { EContractLegalProcessRoutingModule } from './e-contract-legal-process-routing';
import { SharedModule } from '@app/shared';
import { ModalModule } from 'ngx-bootstrap/modal';

import { EmailSigninTemplatesComponent } from './pages/email-signin-templates/email-signin-templates.component';
import { LegalDocDownloadComponent } from './pages/legal-doc-download/legal-doc-download.component';
import { SignatureModalComponent } from './components/signature-modal/signature-modal.component';

@NgModule({
  declarations: [
    EmailSigninTemplatesComponent,
    SignatureModalComponent,
    LegalDocDownloadComponent
  ],
  imports: [
    CommonModule,
    SignaturePadModule,
    SharedModule,
    EContractLegalProcessRoutingModule,
    ModalModule.forRoot()
  ],
  entryComponents: [
    SignatureModalComponent
  ]
})
export class EContractLegalProcessModule { }
