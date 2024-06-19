import { NgModule } from '@angular/core';

// custom date formater
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from '@app/core';

import { SharedModule } from '@app/shared';
import { ProcessControlRoutingModule } from './process-control-routing.module';

// pages
import { ProcessControlComponent } from './pages/process-control/process-control.component';
import { FormViewComponent } from './pages/form-view/form-view.component';
import { ChildFormViewComponent } from './pages/child-form-view/child-form-view.component';
import { EContractsRecordViewComponent } from './components/e-contracts-record-view/e-contracts-record-view.component';
import { DetailViewComponent } from './pages/detail-view/detail-view.component';
import { BulkLogComponent } from './pages/bulk-log/bulk-log.component';
import { BidsComponent } from './components/bids/bids.component';
import { ProcessFormViewComponent } from '@app/shared/components/process-form-view/process-form-view.component';
import { SubProcessCopyRecordComponent } from '@app/shared/components/sub-process-copy-record/sub-process-copy-record.component';
@NgModule({
  declarations: [
    ProcessControlComponent,
    FormViewComponent,
    ChildFormViewComponent,
    EContractsRecordViewComponent,
    DetailViewComponent,
    BulkLogComponent,
    BidsComponent,
  ],
  imports: [
    SharedModule,
    ProcessControlRoutingModule
  ],
  entryComponents: [
    ProcessFormViewComponent,
    ChildFormViewComponent,
    SubProcessCopyRecordComponent
  ],
  providers: [{
    provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter
  }]
})
export class ProcessControlModule { }
