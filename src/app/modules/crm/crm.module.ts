import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app/shared';
import { CrmRoutingModule } from './crm-routing.module';

// services
import { LotSearchService } from './lots/services/lot-search.service';

// sales components
import { SalesGridViewComponent } from './sales/pages/sales-grid-view/sales-grid-view.component';
import { SalesDetailViewComponent } from './sales/pages/sales-detail-view/sales-detail-view.component';
import { SalesFormViewModalComponent } from './sales/components/sales-form-view-modal/sales-form-view-modal.component';
import { SalesSummaryComponent } from './sales/components/sales-summary/sales-summary.component';
import { SalesSummaryGridComponent } from './sales/components/sales-summary-grid/sales-summary-grid.component';
import { SalesFeesChargesComponent } from './sales/components/sales-fees-charges/sales-fees-charges.component';
import { SalesVendorTermsComponent } from './sales/components/sales-vendor-terms/sales-vendor-terms.component';
import { SalesDocumentsComponent } from './sales/components/sales-documents/sales-documents.component';
import { SalesFileImportReviewComponent } from './sales/pages/sales-file-import-review/sales-file-import-review.component';
import { UpdateAliasDataModalComponent } from './sales/components/update-alias-data-modal/update-alias-data-modal.component';
import { ImportDataGridComponent } from './sales/pages/import-data-grid/import-data-grid.component';
import { BillingDocumentLogModalComponent } from './sales/components/billing-document-log-modal/billing-document-log-modal.component';
// lots components
import { LotsGridViewComponent } from './lots/pages/lots-grid-view/lots-grid-view.component';
import { LotsDetailViewComponent } from './lots/pages/lots-detail-view/lots-detail-view.component';
import { LotDetailComponent } from './lots/components/lot-detail/lot-detail.component';
import { LotAgentComponent } from './lots/components/lot-agent/lot-agent.component';
import { LotShareAgentModalComponent } from './lots/components/lot-share-agent-modal/lot-share-agent-modal.component';
import { LotFeesChargesComponent } from './lots/components/lot-fees-charges/lot-fees-charges.component';
import { BulkUploadLotComponent } from './lots/pages/bulk-upload-lot/bulk-upload-lot.component';
import { VendorInformationComponent } from './lots/components/vendor-information/vendor-information.component';
import { BuyerInformationComponent } from './lots/components/buyer-information/buyer-information.component';
import { LotInformationComponent } from './lots/components/lot-information/lot-information.component';
import { AgentInformationComponent } from './lots/components/agent-information/agent-information.component';
import { LotAddAgentModalComponent } from './lots/components/lot-add-agent-modal/lot-add-agent-modal.component';
// e-contracts components
import { EContractViewComponent } from './e-contracts/pages/e-contract-view/e-contract-view.component';
import { EContractConfigComponent } from './e-contracts/components/e-contract-config/e-contract-config.component';
import { EContractDetailViewComponent } from './e-contracts/pages/e-contract-detail-view/e-contract-detail-view.component';
import { EContractGridViewComponent } from './e-contracts/pages/e-contract-grid-view/e-contract-grid-view.component';
import { LotSummaryComponent } from './e-contracts/components/lot-summary/lot-summary.component';
import { EContractViewModalComponent } from './e-contracts/components/e-contract-view-modal/e-contract-view-modal.component';
import { ELotDetailComponent } from './e-contracts/components/e-lot-detail/e-lot-detail.component';

import { AdjustmentGridViewComponent } from './CommissionAdjustment/pages/adjustment-grid-view/adjustment-grid-view.component';
import { AdjustmentFormViewModalComponent } from './CommissionAdjustment/components/adjustment-form-view-modal/adjustment-form-view-modal.component';
import { AdjustmentDetailViewComponent } from './CommissionAdjustment/pages/adjustment-detail-view/adjustment-detail-view.component';
import { AgencyStatementComponent } from './agency-comm-statement/pages/agency-statement/agency-statement.component';
import { GenerateGLXMLComponent } from './sales/components/generate-glxml/generate-glxml.component';
import { ExportEConractConfigComponent } from './e-contracts/components/export-e-conract-config/export-e-conract-config.component';
import { DownloadGlxmlComponent } from './sales/components/download-glxml/download-glxml.component';
import { DownloadAgencyglxmlComponent } from './sales/components/download-agencyglxml/download-agencyglxml.component';
import { DownloadWoolglxmlComponent } from './sales/components/download-woolglxml/download-woolglxml.component';


@NgModule({
  declarations: [
    SalesGridViewComponent,
    SalesFormViewModalComponent,
    SalesDetailViewComponent,
    SalesSummaryComponent,
    SalesSummaryGridComponent,
    SalesFeesChargesComponent,
    SalesVendorTermsComponent,
    SalesDocumentsComponent,
    BillingDocumentLogModalComponent,
    LotsGridViewComponent,
    LotsDetailViewComponent,
    LotDetailComponent,
    LotAgentComponent,
    LotShareAgentModalComponent,
    LotFeesChargesComponent,
    EContractViewComponent,
    EContractConfigComponent,
    EContractDetailViewComponent,
    EContractGridViewComponent,
    LotSummaryComponent,
    SalesFileImportReviewComponent,
    UpdateAliasDataModalComponent,
    EContractViewModalComponent,
    ELotDetailComponent,
    ImportDataGridComponent,
    BulkUploadLotComponent,
    VendorInformationComponent,
    BuyerInformationComponent,
    LotInformationComponent,
    AgentInformationComponent,
    LotAddAgentModalComponent,
    AdjustmentGridViewComponent,
    AdjustmentFormViewModalComponent,
    AdjustmentDetailViewComponent,
    AgencyStatementComponent,
    GenerateGLXMLComponent,
    ExportEConractConfigComponent,
    DownloadGlxmlComponent,
    DownloadAgencyglxmlComponent,
    DownloadWoolglxmlComponent
  ],
  imports: [
    CommonModule,
    CrmRoutingModule,
    SharedModule
  ],
  providers: [
    LotSearchService
  ],
  entryComponents: [
    SalesFormViewModalComponent,
    LotShareAgentModalComponent,
    EContractConfigComponent,
    UpdateAliasDataModalComponent,
    EContractViewModalComponent,
    BulkUploadLotComponent,
    LotAddAgentModalComponent,
    AdjustmentFormViewModalComponent,
    BillingDocumentLogModalComponent,
    ExportEConractConfigComponent
  ]
})
export class CrmModule { }
