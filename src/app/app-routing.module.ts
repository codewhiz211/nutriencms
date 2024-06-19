import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/core';
import { ListComponent } from './shared/components/Annoucement/list/list.component';
import { ShowDetailComponent } from './shared/components/Annoucement/show-detail/show-detail.component';
import { QuickMindComponent } from './shared/components/quick-mind/quick-mind.component';
import { ListingComponent } from './shared/components/quick-mind/admin/listing/listing.component';
import { QuickMindDetailComponent } from './shared/components/quick-mind-detail/quick-mind-detail.component';

import { TermsAndConditionsComponent } from './shared/components/terms-and-conditions/terms-and-conditions.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { NotAuthorizeComponent } from './not-authorize/not-authorize.component';
import { SsoPageComponent } from './sso-page/sso-page.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'sso', pathMatch: 'full'
  },
  {
    path: 'sso', component: SsoPageComponent
  },
  {
    path: 'login', redirectTo: '/auth/login', pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'app_list',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/app-list/app-list.module').then(m => m.AppListModule)
  },
  {
    path: 'process_control/:process_name',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/process-control/process-control.module').then(m => m.ProcessControlModule)
  },
  {
    path: 'content_manager',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/content-manager/content-manager.module').then(m => m.ContentManagerModule)
  },
  {
    path: 'crm',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/crm/crm.module').then(m => m.CrmModule)
  },
  {
    path: 'announcement',
    canActivate: [AuthGuard],
    component: ListComponent
  },
  {
    path: 'announcement/showdetail/:ID',
    canActivate: [AuthGuard],
    component: ShowDetailComponent
  },
  {
    path: 'quickmind',
    canActivate: [AuthGuard],
    component: QuickMindComponent
  },
  {
    path: 'quickminddetail',
    canActivate: [AuthGuard],
    component: QuickMindDetailComponent
  },
  {
    path: 'quickmindlist',
    canActivate: [AuthGuard],
    component: ListingComponent
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent
  },
  {
    path: 'e-saleyard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/e-saleyard/e-saleyard.module').then(m => m.ESaleyardModule)
  },
  {
    path: 'insurance',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/insurance/insurance.module').then(m => m.InsuranceModule)
  },
  {
    path: 'wool',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/wool/wool.module').then(m => m.WoolModule)
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'livestock',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/livestock-search/livestock-search.module').then(m => m.LivestockSearchModule)
  },
  {
    path: 'e-contract-legal-process',
    loadChildren: () => import('./modules/e-contract-legal-process/e-contract-legal-process.module').then(m => m.EContractLegalProcessModule)
  },
  {
    path: 'unauthorized',
    component: NotAuthorizeComponent
  },
  // Wrong route
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload', scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled', scrollOffset: [0, 64],
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
