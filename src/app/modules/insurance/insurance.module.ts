import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateFRParserFormatter } from '@app/core';
import { SharedModule } from '@app/shared';
import { InsuranceRoutingModule } from './insurance-routing.module';

import { InsuranceSearchComponent } from './components/insurance-search/insurance-search.component';

import { InsuranceSearchService } from './services/insurance-search.service';

@NgModule({
  declarations: [
    InsuranceSearchComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InsuranceRoutingModule
  ],
  providers: [
    InsuranceSearchService,
    {
      provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter
    }
  ]
})
export class InsuranceModule { }
