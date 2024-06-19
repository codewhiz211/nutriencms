import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmailSigninTemplatesComponent } from './pages/email-signin-templates/email-signin-templates.component';
import { LegalDocDownloadComponent } from './pages/legal-doc-download/legal-doc-download.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'sign',
        component: EmailSigninTemplatesComponent
      }, {
        path: 'download',
        component: LegalDocDownloadComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EContractLegalProcessRoutingModule { }
