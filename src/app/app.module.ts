import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { registerLocaleData, DatePipe } from '@angular/common';
import localeAU from '@angular/common/locales/en-AU';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// shared and core modules
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';

// app routing and component
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// layout components
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { EnvService, envInitializer } from './core/services/env.service';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { NotAuthorizeComponent } from './not-authorize/not-authorize.component';
import { SsoPageComponent } from './sso-page/sso-page.component';
import { VersionCheckService } from './core/services/version-check.service';


registerLocaleData(localeAU, 'en-AU');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    NotAuthorizeComponent,
    SsoPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    InfiniteScrollModule,
    NgHttpLoaderModule.forRoot()

  ],
  entryComponents: [],
  providers: [
    Title,
    {
      provide: LOCALE_ID,
      useValue: 'en-AU'
    },
    EnvService,
    {
      provide: APP_INITIALIZER,
      useFactory: envInitializer,
      multi: true,
      deps: [EnvService]
    },
    DatePipe,
    VersionCheckService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
