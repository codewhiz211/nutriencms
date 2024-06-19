import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@app/core';

import { SalesGridViewComponent } from './sales/pages/sales-grid-view/sales-grid-view.component';
import { SalesDetailViewComponent } from './sales/pages/sales-detail-view/sales-detail-view.component';
import { SalesFileImportReviewComponent } from './sales/pages/sales-file-import-review/sales-file-import-review.component';
import { LotsDetailViewComponent } from './lots/pages/lots-detail-view/lots-detail-view.component';

import { EContractViewComponent } from './e-contracts/pages/e-contract-view/e-contract-view.component';
import { EContractDetailViewComponent } from './e-contracts/pages/e-contract-detail-view/e-contract-detail-view.component';
import { ELotDetailComponent } from './e-contracts/components/e-lot-detail/e-lot-detail.component';
import { AdjustmentGridViewComponent } from './CommissionAdjustment/pages/adjustment-grid-view/adjustment-grid-view.component';
import { AdjustmentDetailViewComponent } from './CommissionAdjustment/pages/adjustment-detail-view/adjustment-detail-view.component';
import { AgencyStatementComponent } from './agency-comm-statement/pages/agency-statement/agency-statement.component';
import { GenerateGLXMLComponent } from './sales/components/generate-glxml/generate-glxml.component';
import { DownloadGlxmlComponent } from './sales/components/download-glxml/download-glxml.component';
import { DownloadAgencyglxmlComponent } from './sales/components/download-agencyglxml/download-agencyglxml.component';
import { DownloadWoolglxmlComponent } from './sales/components/download-woolglxml/download-woolglxml.component';
const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'sales',
        component: SalesGridViewComponent
      },
      {
        path: 'sales/:id',
        component: SalesDetailViewComponent
      },
      {
        path: 'sales/processing/file-import-review',
        component: SalesFileImportReviewComponent
      },
      {
        path: 'sales/:sale_id/lots/:id',
        component: LotsDetailViewComponent
      },
      {
        path: 'e-contract/:id',
        component: EContractViewComponent
      },
      {
        path: 'contract_view/:id',
        component: EContractDetailViewComponent
      },
      {
        path: 'contract_view/:sale_id/lot_view/:id',
        component: ELotDetailComponent
      },
      {
        path: 'commissionadjustment/:id',
        component: AdjustmentGridViewComponent
      },
      {
        path: 'adjustment-detail/:id',
        component: AdjustmentDetailViewComponent
      },
      {
        path: 'agency-comm-statement', // #254 - Agency Commission Statement - Add New component
        component: AgencyStatementComponent
      },
      {
        path: 'glxml',
        component: GenerateGLXMLComponent
      },
      {
        path: 'download-glxml',
        component: DownloadGlxmlComponent
      },
      {
        path: 'download-agencyglxml',
        component: DownloadAgencyglxmlComponent
      },
      {
        path: 'download-woolglxml',
        component: DownloadWoolglxmlComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmRoutingModule { }
