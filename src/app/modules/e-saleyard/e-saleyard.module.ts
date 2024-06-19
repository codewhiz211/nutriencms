import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ESaleyardRoutingModule } from './e-saleyard-routing.module';
import { EditBuyerComponent } from './buyers/pages/edit-buyer/edit-buyer.component';
import { AddBuyerComponent } from './buyers/pages/add-buyer/add-buyer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersGridComponent } from './buyers/pages/users-grid/users-grid.component';
import { SharedModule } from '@app/shared';
import { ApproveBuyerAccountConfirmModalComponent } from './buyers/components/approve-buyer-account-confirm-modal/approve-buyer-account-confirm-modal.component';


@NgModule({
  declarations: [AddBuyerComponent, EditBuyerComponent, UsersGridComponent, ApproveBuyerAccountConfirmModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    ESaleyardRoutingModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    ApproveBuyerAccountConfirmModalComponent
  ]
})
export class ESaleyardModule { }
