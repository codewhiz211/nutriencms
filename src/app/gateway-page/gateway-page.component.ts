import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Base64 } from 'js-base64';
import { BehaviorSubject, Observable, from, throwError, Subscriber } from 'rxjs';
import { User } from '../core/models/user';
import { environment } from '@env/environment';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-gateway-page',
  templateUrl: './gateway-page.component.html',
  styleUrls: ['./gateway-page.component.scss']
})

export class GatewayPageComponent implements OnInit {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  samlData: any;

  constructor(private routes: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private httpclient: HttpClient) {

    const AccessToken = localStorage.getItem('AccessToken');
    if (AccessToken) {
      const aToken = AccessToken.split('.');
      const userDetail = atob(aToken[1]);
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(userDetail));
      this.currentUser = this.currentUserSubject.asObservable();
    } else {
      this.currentUserSubject = new BehaviorSubject<User>(null);
      this.currentUser = this.currentUserSubject.asObservable();
    }
    // this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    //this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  async ngOnInit() {
    var samlId = this.route.snapshot.queryParamMap.get('samlid');
    if (samlId) {
      this.authenticateUser(samlId);
    }
    else {
      alert("Unable to find parameter.");
    }
    //this.authenticateSamlData();
  }

  //authenticateSamlData() {
  //debugger;
  //let res = 'eyJDb2RlIjoiMjAwIiwiU3RhdHVzIjoiU3VjY2VzcyIsIk1lc3NhZ2UiOiJTQU1MIGZpbGUgdmVyaWNhdGlvbiAmIHZhbGlkYXRpb24gY29tcGxldGUiLCJBY2Nlc3NUb2tlbiI6ImV5SmhiR2NpT2lKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1EQXhMekEwTDNodGJHUnphV2N0Ylc5eVpTTm9iV0ZqTFhOb1lUSTFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpxZEdraU9pSTNNbVV5TmpNNU15MHdPVEl6TFRRMU9EVXRPR1JrTlMwMFpXWXhaVGN5TVRVeU16TWlMQ0pCWTJWemMxUnZhMlZ1SWpvaWFFOVliVkZ6UW5CcVZrNXFUSEl2TDBsbVNGVjBjRGRvVkVJek9HbE1TRVpITDBOTWEycDRLMnBETWxoS1dGVnVZVTlsWlVGeGEwTjZlVmRCT0dObGVqUmxXalZZYVdkS2JuazRQU0lzSWxWelpYSWlPaUo3WENKVmMyVnlTV1JjSWpwY0lqRXhPVGRjSWl4Y0lrWnBjbk4wVG1GdFpWd2lPbHdpUVcxcGRHVnphRndpTEZ3aVRHRnpkRTVoYldWY0lqcGNJa1JsZGx3aUxGd2lWWE5sY2s1aGJXVmNJanBjSW1GdGFYUmxjMmd1WXpKdE1qQXhPVndpTEZ3aVIzSnZkWEJKWkZ3aU9sd2lNVEUwTlZ3aUxGd2lUR0Z1WjNWaFoyVmNJanBjSW1WdUxWVlRYQ0lzWENKU2IyeGxjMXdpT2x0Y0lqRTVNbUUzYldGdVlXZGxZWEJ3WENJc1hDSXhPV015T0cxaGJtRm5aWEp2YkdWY0lpeGNJakZoTmpFNGJXRnVZV2RsZFhObGNsd2lMRndpTVdJd01EQnRZVzVoWjJWbmNtOTFjRndpTEZ3aU5UVXlOMlJ0WVc1aFoyVjJhV1YzWENJc1hDSmxPR05pWTNCMVlteHBZM1JvYVc1bmMyRmtiV2x1WENJc1hDSXdNelU0TTIxNWRHaHBibWR6WVdSdGFXNWNJaXhjSW1VNFkySmpjSFZpYkdsamRHaHBibWR6WENJc1hDSXdNelU0TTIxNWRHaHBibWR6WENJc1hDSTRZVE5pWVcxNWRHbHRaV0ZrYldsdVhDSmRmU0lzSWxKbFpuSmxjMmhVYjJ0bGJpSTZJbWhQV0cxUmMwSndhbFpPYWt4eUx5OUpaa2hWZEhBM2FGUkNNemhwVEVoR1J5OURUR3RxZUN0cVF6SllTbGhWYm1GUFpXVkJiRFJhY1d0VFlXOWlTM00wWlZvMVdHbG5TbTU1T0QwaUxDSnVZbVlpT2pFMk1EQTNPVE0xTWpJc0ltVjRjQ0k2TVRZd01EazJOak15TWl3aWFYTnpJam9pYUhSMGNEb3ZMMnh2WTJGc2FHOXpkRG8wT1RjMk55OGlMQ0poZFdRaU9pSm9kSFJ3T2k4dmJHOWpZV3hvYjNOME9qUTVOelkzTHlKOS45d1VtdkxnclQzMllySmtOSmxDUEJuZkd1Nk11ZnZzY2xKSUpncWVDMk1RIiwiTG1rR3VpZCI6Ijg2OWFmYTNlLTdmNjgtYTk1MS00NWE1LTI4MTdiMTk0YTQ1YiJ9';
  //this.samlData = JSON.parse(Base64.decode(res));
  //var resDecoded = this.samlData;
  //if (resDecoded && resDecoded.AccessToken) {
  //let resGuid = resDecoded.LmkGuid;
  // if (resDecoded.Code == '200') {
  // New SSO Login implimentaion 
  //const aToken = resDecoded.AccessToken.split('.');
  //const userDetail = JSON.parse(atob(aToken[1]));
  // store user details and jwt token in local storage to keep user logged in between page refreshes
  //const offset = new Date().getTimezoneOffset();
  //const currentUser = JSON.parse(userDetail.User);
  //currentUser.TimeZone = offset;
  //userDetail.User = JSON.stringify(currentUser);
  //localStorage.setItem('AccessToken', resDecoded.AccessToken);
  //localStorage.setItem('loginType', "globalUser");
  //this.currentUserSubject.next(currentUser);
  //this.getSamlResponse(true);
  // End
  //}
  //else {
  // this.getSamlResponse(false);
  //}
  //}
  //else {
  //this.getSamlResponse(false);
  //}
  //}

  async authenticateUser(samlId: string) {
    this.authenticationService.authenticateSamlData(samlId).subscribe(
      resp => {
        this.getSamlResponse(resp);
      },
      error => {
        this.getSamlResponse(error);
      });
  }

  goToLogin() {
    this.routes.navigate(['/auth/login']);
  }

  gotoUnAuthorize() {
    this.routes.navigate(['/unauthorized'])
  }

  getSamlResponse(data) {
    if (data == true) {
      this.routes.navigate(['/app_list']);
    }
    else {
      this.gotoUnAuthorize();
      localStorage.clear();
      sessionStorage.clear();
    }
  }
}
