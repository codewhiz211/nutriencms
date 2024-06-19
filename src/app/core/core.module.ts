import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';

import { AuthGuard } from './guards/auth.guard';
import { throwIfAlreadyLoaded } from './guards/module-import.guard';

import { ApiService } from './services/api.service';
import { AuthenticationService } from './services/authentication.service';
import { ListviewService } from './services/list-view.service';
import { FormViewService } from './services/form-view.service';
import { DmoControlService } from './services/dmo-control.service';
import { UserService } from './services/user.service';
import { ApplicationService } from './services/application.service';
import { NgbDateFRParserFormatter } from './services/ngb-date-fr-parser-formatter';
import { DocumentViewService } from './services/document-view.service';
import {BMConditionService} from './services/bmCondition.service';

import { GlobalHttpInterceptorService } from './handle-errors/global-http-interceptor.service';
import { GlobalErrorHandlerService } from './handle-errors/global-error-handler.service';

@NgModule({
    imports: [
        HttpClientModule
    ],
    providers: [
      CurrencyPipe,
      AuthGuard,
      ApiService,
      AuthenticationService,
      ListviewService,
      FormViewService,
      DmoControlService,
      UserService,
      ApplicationService,
      NgbDateFRParserFormatter,
      DocumentViewService,
      BMConditionService,
      { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
      { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpInterceptorService, multi: true }

    ]
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
    }
}
