import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateFRParserFormatter } from '@app/core';
import { SharedModule } from '@app/shared';
import { LivestockSearchRoutingModule } from './livestock-search-routing.module';

import { LivestockSearchComponent } from './pages/livestock-search/livestock-search.component';

import { LivestockService } from './services/livestock.service';


@NgModule({
  declarations: [LivestockSearchComponent],
  imports: [
    CommonModule,
    SharedModule,
    LivestockSearchRoutingModule
  ],
  providers: [
    LivestockService,
    {
      provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter
    }
  ]
})
export class LivestockSearchModule { }
