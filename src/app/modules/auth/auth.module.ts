import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { AuthRoutingModule } from './auth-routing.module';
import { ResetPwdComponent } from './pages/reset-pwd/reset-pwd.component';
import { LoginComponent } from './pages/login/login.component';
//import { SsoPageComponent } from '@app/sso-page/sso-page.component';
import { GatewayPageComponent } from '@app/gateway-page/gateway-page.component';
import { ErrorComponent } from './pages/error/error.component';
import { ActivateAccountComponent } from './pages/activate-account/activate-account.component';

@NgModule({
  declarations: [LoginComponent, ResetPwdComponent,
   GatewayPageComponent,
   ErrorComponent,
   ActivateAccountComponent],
  imports: [
    SharedModule,
    AuthRoutingModule 
  ],
})
export class AuthModule { }
