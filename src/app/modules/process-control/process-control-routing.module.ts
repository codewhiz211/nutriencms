import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProcessControlComponent } from './pages/process-control/process-control.component';
import { FormViewComponent } from './pages/form-view/form-view.component';
import { ChildFormViewComponent } from './pages/child-form-view/child-form-view.component';

import { ListComponent } from '@app/shared/components/Annoucement/list/list.component';
import { AddNewComponent } from '@app/shared/components/Annoucement/add-new/add-new.component';
import { ProcessFormViewComponent } from '@app/shared/components/process-form-view/process-form-view.component';
import { SubProcessCopyRecordComponent } from '@app/shared/components/sub-process-copy-record/sub-process-copy-record.component';

import { AuthGuard } from '@app/core';
import { DetailViewComponent } from './pages/detail-view/detail-view.component';
import { BulkLogComponent } from './pages/bulk-log/bulk-log.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: ProcessControlComponent
      },
      {
        path: 'detail_view/:id',
        component: DetailViewComponent
      },
      {
        path: 'form-view/:id',
        component: FormViewComponent
      },
      {
        path: 'child_view/:id',
        component: ChildFormViewComponent
      },
      {
        path: 'grid_view',
        component: ProcessControlComponent
      },
        {
        path: 'child_form_view/:parenttranctionId',
        component: ProcessFormViewComponent
      },
      {
        path: 'child_form_view',
        component: ProcessFormViewComponent
      },
      {
        path: 'copy_view/:id/:parenttranctionId',
        component: SubProcessCopyRecordComponent
      },
      {
        path: 'copy_view/:id',
        component: SubProcessCopyRecordComponent
      },
      {
        path: 'list',
        component: ListComponent
      },
      {
        path: 'bulk-log',
        component: BulkLogComponent
      },
      {
        path: 'add_new', component: AddNewComponent
      },
      {
        path: 'add_new/:ID', component: AddNewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessControlRoutingModule { }
