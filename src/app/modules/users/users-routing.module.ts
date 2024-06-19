import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddUserComponent } from './pages/add-user/add-user.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { ManageUsersGridComponent } from './pages/manageusers-grid/manageusers-grid.component';
import{UserProfileComponent} from './pages/user-profile/user-profile.component';
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
        component: ManageUsersGridComponent
      },
      {
        path: 'add-user',
        component: AddUserComponent
      },
      {
        path: 'edit-user',
        component: EditUserComponent
      },
      {
        path: 'edit-user/:id',
        component: EditUserComponent
      },
      {
        path: 'user-profile',
        component: UserProfileComponent
      },
      {
        path: 'user-profile/:uName',
        component: UserProfileComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
