import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddBuyerComponent } from './buyers/pages/add-buyer/add-buyer.component';
import { EditBuyerComponent } from './buyers/pages/edit-buyer/edit-buyer.component';
import { UsersGridComponent } from './buyers/pages/users-grid/users-grid.component';

import { AuthGuard } from '@app/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grid',
    pathMatch: 'full'
  },
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'grid',
        component: UsersGridComponent
      },
      {
        path: 'add-buyer',
        component: AddBuyerComponent
      },
      {
        path: 'edit-buyer',
        component: EditBuyerComponent
      },
      {
        path: 'edit-buyer/:id',
        component: EditBuyerComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ESaleyardRoutingModule {}
