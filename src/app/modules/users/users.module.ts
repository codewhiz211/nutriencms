import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { AddUserComponent } from './pages/add-user/add-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ManageUsersGridComponent } from './pages/manageusers-grid/manageusers-grid.component';
import { SharedModule } from '@app/shared';
import{UserProfileComponent} from './pages/user-profile/user-profile.component';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [UserProfileComponent,ManageUsersGridComponent,AddUserComponent,EditUserComponent],
  imports: [
    CommonModule,
    SharedModule,
    UsersRoutingModule,
    ReactiveFormsModule,
    ImageCropperModule,
  ],
  entryComponents: [
   
  ]
})
export class UsersModule { }
