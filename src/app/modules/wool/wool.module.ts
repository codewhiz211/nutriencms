import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateFRParserFormatter } from '@app/core';
import { SharedModule } from '@app/shared';
import { WoolRoutingModule } from './wool-routing.module';

import { WoolSearchComponent } from './wool-search/wool-search.component';
import { ReceivalsComponent } from './grids/receivals/receivals.component';
import { UnsoldWoolComponent } from './grids/unsold-wool/unsold-wool.component';
import { TestResultComponent } from './grids/test-result/test-result.component';
import { AppraisalComponent } from './grids/appraisal/appraisal.component';
import { InterimSalePriceAdviceComponent } from './grids/interim-sale-price-advice/interim-sale-price-advice.component';
import { SoldWoolComponent } from './grids/sold-wool/sold-wool.component';
import { SaleSummaryComponent } from './grids/sale-summary/sale-summary.component';

import { WoolSearchService } from './wool-search.service';
import { BaleDetailModalComponent } from './bale-detail-modal/bale-detail-modal.component';
import { SoldRehandleWoolComponent } from './grids/sold-rehandle-wool/sold-rehandle-wool.component';
import { SoldAppraisalComponent } from './grids/sold-appraisal/sold-appraisal.component';
import { SoldTestResultComponent } from './grids/sold-test-result/sold-test-result.component';

@NgModule({
  declarations: [
    WoolSearchComponent,
    ReceivalsComponent,
    UnsoldWoolComponent,
    TestResultComponent,
    AppraisalComponent,
    InterimSalePriceAdviceComponent,
    SoldWoolComponent,
    SaleSummaryComponent,
    BaleDetailModalComponent,
    SoldRehandleWoolComponent,
    SoldAppraisalComponent,
    SoldTestResultComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    WoolRoutingModule
  ],
  providers: [
    WoolSearchService,
    {
      provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter
    }
  ],
  entryComponents: [
    BaleDetailModalComponent
  ]
})
export class WoolModule { }
