import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { NEVER } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import * as rg4js from 'raygun4js';

import { environment } from '@env/environment';


@Injectable()
export class EnvService {

  constructor(private http: HttpClient) {}

  public init() {
     // Set Raygun settings on production mode
     if (environment.production) {
      rg4js('apiKey', environment.Setting.raygunAPIKey);
      rg4js('setVersion', environment.Setting.raygunVersion);
      rg4js('enableCrashReporting', true);
      rg4js('enablePulse', true);
      rg4js('logContentsOfXhrCalls', true);
    }
    // const url = this._setupUrl();
    // return this.http.get(url)
    //   .pipe(
    //     tap((env: any) => {
    //       env = env.Setting;

    //       for (const prop in env) {
    //         if (prop in environment.Setting) {
    //           environment.Setting[prop] = env[prop];
    //         }
    //       }
    //       // Set Raygun settings on production mode
    //       if (environment.production) {
    //         rg4js('apiKey', env.raygunAPIKey);
    //         rg4js('setVersion', env.raygunVersion);
    //         rg4js('enableCrashReporting', true);
    //         rg4js('enablePulse', true);
    //         rg4js('logContentsOfXhrCalls', true);
    //       }
    //     }),
    //     catchError(error => NEVER)
    //   )
    //   .toPromise();
  }

  private _setupUrl() {
    let url = '';
    const endpoint = 'api/v2/user/CRMWebAppConfig';
    const origin = location.origin;
    if (origin.includes('-wf')) {
      url = `${origin.replace('-wf', '-api')}/${endpoint}`
    } else if (origin.includes('crm-')) {
      url = `${origin.replace('crm-', 'api-')}/${endpoint}`
    } else {
      url = '/assets/config/env.json';
    }
    return url;
  }
}

export const envInitializer = (env: EnvService) => {
  return () => env.init();
}