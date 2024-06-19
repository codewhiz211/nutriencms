import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { AppListRoutingModule } from './app-list-routing.module';

import { AppListComponent } from './pages/app-list/app-list.component';

@NgModule({
  declarations: [AppListComponent],
  imports: [
    SharedModule,
    AppListRoutingModule
  ]
})
export class AppListModule { }
