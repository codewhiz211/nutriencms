import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '@env/environment';
import { MessageService } from './message.service';
import { Base64 } from 'js-base64';
import { Guid } from "guid-typescript";
import { ApiService } from './api.service';
import { UserDetail } from '../models/user-detail';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

class User1 {
    anuSUer: User;

};
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    samlData: any;
    GuidId: Guid;

    constructor(private http: HttpClient, private msg: MessageService, private api: ApiService,
        private routes: Router,
        private toastr: ToastrService) {
        const AccessToken = localStorage.getItem('AccessToken');
        if (AccessToken) {
            const aToken = AccessToken.split('.');
            if (aToken.length > 1) {
                const currentuserDetail = new UserDetail();
                this.currentUserSubject = new BehaviorSubject<User>(currentuserDetail);
                this.currentUser = this.currentUserSubject.asObservable();
            } else {
                this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
                this.currentUser = this.currentUserSubject.asObservable();
            }
        } else {
            this.clearStorage();
        }
        this.GuidId = Guid.create();
         // this.currentUserSubject = new BehaviorSubject<User>(null);
        // const AccessToken = localStorage.getItem('AccessToken');
        // if(AccessToken) {
        // const aToken = AccessToken.split('.');
        // if(aToken.length>1){
        // const userDetail = atob(aToken[1]);
        // this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(userDetail));
        // this.currentUser = this.currentUserSubject.asObservable();
        // } else {
        //     localStorage.clear();
        //     sessionStorage.clear();
        // }
        // } else {
        //     this.currentUserSubject = new BehaviorSubject<User>(null);
        // this.currentUser = this.currentUserSubject.asObservable();
        //    this.logout();
        // }
        
    }

    login(username: string, password: string) {
        const httpHeader = new HttpHeaders({ UserName: username, Password: password });
        const objHttpHeader = { headers: httpHeader };

        return this.http.post<any>(environment.Setting.LoginAPIUrl, {}, objHttpHeader)
            .pipe(map(res => {
                if (res && res.accessToken) { // To handle V2 version 
                    const aToken = res.accessToken.split('.');
                    const userDetail = JSON.parse(atob(aToken[1]));
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    const offset = new Date().getTimezoneOffset();
                    const currentUser =JSON.parse(userDetail.User);
                    currentUser.TimeZone = offset;
                    userDetail.User = JSON.stringify(currentUser);
                  //  const userToken = aToken[0] + '.' + btoa(userDetail) + '.' + aToken[2]
                    //localStorage.setItem('currentUser', JSON.stringify(res.User));
                    localStorage.setItem('AccessToken', res.accessToken);
                    //localStorage.setItem('RefreshToken', res.RefreshToken);
                    localStorage.setItem('loginType', "normalUser");
                   
                    this.currentUserSubject.next(currentUser);
                    return true;
                }                           
                else if (res && res.AcessToken && res.User  && res.User.Message === undefined) { // To handle V1 version 
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    const offset = new Date().getTimezoneOffset();
                    res.User.TimeZone = offset;
                    localStorage.setItem('currentUser', JSON.stringify(res.User));
                    localStorage.setItem('AccessToken', res.AcessToken);
                    localStorage.setItem('RefreshToken', res.RefreshToken);
                    localStorage.setItem('loginType', "normalUser");
                    this.currentUserSubject.next(res.User);
                    return true;
                }
                else if(res && res.AcessToken === '' && res.RefreshToken === '' && !!res.Message){
                    this.msg.showMessage('Fail', { body: res.Message });
                    return false;
                  } 
                else if (res && res[0] !== undefined && res[0].ISLOCKEDOUT === true) {
                    this.msg.showMessage('Fail', { body: 'Your account is locked due to entering the wrong password three times. Please check your email.' });
                    return false;
                }
                else if (res && res.User.Message) {
                    this.msg.showMessage('Fail', { body: 'Your account is locked due to entering the wrong password three times. Please check your email.' });
                    return false;
                }

            }));
    }

    getUserProfile(data: any) {
        //return this.api.user_post('GetUserProfile', data);
        const headers = 'api/getuserprofile_lmkcrm';
        return this.api.post_ice('user/icewebapi', data, headers);
    }


    sendCodeForResetPassword(data: any) {
        //return this.api.user_post('SendCodeForResetPassword', data);
        const headers = 'api/SendCodeForResetPassword';
        return this.api.post_ice('user/icewebapifpwd', data, headers);
    }

    resetPasswordByCode(data: any) {
        const headers = 'api/ResetPasswordByCode';
        //return this.api.post_ice('user/icewebapi', data, headers);
        return this.api.post_ice('user/icewebapifpwd', data, headers);
        //return this.api.user_post('ResetPasswordByCode', data);
    }
    updatePassword(currentPassword: string, newPassword: string, emailAddress: string) {
        const data = {
            EmailAddress: emailAddress,
            Password: currentPassword,
            NewPassword: newPassword,
            AccessToken: localStorage.getItem('AccessToken')
        }
        return this.api.user_post('ChangeAccountPassword', data).toPromise();
    }

    logout(): Observable<any> {
        const accessToken = localStorage.getItem('AccessToken');
        const headers = new HttpHeaders({ accessToken });
        return this.http.post<any>(environment.Setting.BaseAPIUrlLmk + '/user/UserSignout', {}, { headers })
            .pipe(map(res => {
                this.clearStorage();
                return res;
            }));
    }

    clearStorage() {
        // remove user from local storage to log user out
        localStorage.clear();
        sessionStorage.clear();
        if(this.currentUserSubject == undefined) {
            this.currentUserSubject = new BehaviorSubject<User>(null);
            this.currentUser = this.currentUserSubject.asObservable();
        }
        this.currentUserSubject.next(null);
    }

    authenticateSamlData(samlResponse: string) {    
        let value1 = 'samlResponse';
        let value2 = 'Guid';
        var samlObject = {};
        samlObject[value1] = Base64.decode(samlResponse);
        samlObject[value2] = this.GuidId;
        const httpHeader = new HttpHeaders({ samlResponseId: Base64.encode(JSON.stringify(samlObject)), 'Accept': 'application/json', 'Content-Type': 'application/json' });
        httpHeader.append('Access-Control-Allow-Methods', 'POST')
        const objHttpHeader = { headers: httpHeader };
        return this.http.post<any>(environment.Setting.BaseAPIUrlLmk + '/User/AuthenticateSamlData', {}, objHttpHeader).pipe(map
            (res => {            
                this.samlData = JSON.parse(Base64.decode(res));
                var resDecoded = this.samlData;
                if (resDecoded && resDecoded.AccessToken) {
                    let resGuid = resDecoded.LmkGuid;
                    if (resDecoded.Code == '200' && this.GuidId.equals(resGuid)) {

                       // New logic for SSO Login implimentaion 
                        const aToken = resDecoded.AccessToken.split('.');
                        const userDetail = JSON.parse(atob(aToken[1]));
                        // store user details and jwt token in local storage to keep user logged in between page refreshes
                        const offset = new Date().getTimezoneOffset();
                        const currentUser = JSON.parse(userDetail.User);
                        currentUser.TimeZone = offset;
                        userDetail.User = JSON.stringify(currentUser);
                        localStorage.setItem('AccessToken', resDecoded.AccessToken);
                        localStorage.setItem('loginType', "globalUser");                       
                        this.currentUserSubject.next(currentUser);
                        return true;
                        // End
                    
                        // Old Logic for SSO Login implimentaion 
                        //let objuser = JSON.parse(resDecoded.User);
                        // store user details and jwt token in local storage to keep user logged in between page refreshes
                        //const offset = new Date().getTimezoneOffset();
                        //objuser.TimeZone = offset;
                        //const Role = objuser.Roles.join(',');
                        //objuser.Roles = Role;
                        //resDecoded.User = JSON.stringify(objuser);
                        //localStorage.setItem('currentUser', resDecoded.User);
                        //localStorage.setItem('AccessToken', resDecoded.AccessToken);
                        //localStorage.setItem('RefreshToken', resDecoded.RefreshToken);
                        //localStorage.setItem('loginType', "globalUser");
                        //this.currentUserSubject.next(objuser);
                        //return true;
                        // End 
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }));
    }

    getSamlAuthenticateRequestURL(samlEndpointUrl: string, relayState: string) {
        const httpHeader = new HttpHeaders({ samlEndpoint: Base64.encode(samlEndpointUrl), relayState: Base64.encode(relayState), 'Accept': 'application/json', 'Content-Type': 'application/json' });
        const objHttpHeader = { headers: httpHeader };
        return this.http.post<any>(environment.Setting.BaseAPIUrlLmk + '/User/GetRedirectSamlUrl', {}, objHttpHeader).pipe(map
            (res => {
                this.samlData = JSON.parse(Base64.decode(res.detail));
                var resDecoded = this.samlData.SamlAuthenticationUrl;
                return resDecoded;
            }));
    }

    activateUser(url: string) {
        //const httpAllOptions = { headers: new HttpHeaders({ "AccessToken":"eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJBY2Vzc1Rva2VuIjoiMk5aNEdrUWVSOUxob1prZnNmK2x4Q283cHRSS2F2RDlHL0NMa2p4K2pDMlhKWFVuYU9lZUF1dmxBaGcwdHBZSm50NFl6clcxQUN3PSIsIlVzZXIiOiJ7XCJVc2VySWRcIjpcIjI0MzNcIixcIkZpcnN0TmFtZVwiOlwibmloYWxcIixcIkxhc3ROYW1lXCI6XCJyYXdhdFwiLFwiVXNlck5hbWVcIjpcIm5paGFsLmMybTIwMTlcIixcIkVtYWlsQWRkcmVzc1wiOlwibmloYWxuaWhhbDE5OTVAZ21haWwuY29tXCIsXCJHcm91cElkXCI6XCIxMTQ1XCIsXCJMYW5ndWFnZVwiOlwiZW4tVVNcIixcIkFwaUtleVwiOlwiTlZ1S3NjeXd4MjcwRTdVa1ppWnphTm1MN0Z1dGVmXCIsXCJSb2xlc1wiOltcImU4Y2JjcHVibGljdGhpbmdzYWRtaW5cIixcIjAzNTgzbXl0aGluZ3NhZG1pblwiLFwiZThjYmNwdWJsaWN0aGluZ3NcIixcIjAzNTgzbXl0aGluZ3NcIixcImZkMWY2cWFiMmJhZG1pblwiLFwiMjUzYzhxYWNsaWVudGFwcGFkbWluXCIsXCIyMGViNnFhYjJjYWRtaW5cIixcIjU3Yjk0cGt0ZXN0YXBwMWFkbWluXCIsXCI1N2I5NHBrdGVzdHJvbGUxXCIsXCI1N2I5NHBrdGVzdHJvbGUyXCIsXCI1N2I5NHBrdGVzdHJvbGU0XCIsXCI1N2I5NHBrdGVzdHJvbGU1XCIsXCI1N2I5NHBrdGVzdHJvbGU2XCIsXCI1N2I5NHBrdGVzdHJvbGU3XCIsXCI1N2I5NHBrdGVzdHJvbGU4XCIsXCI1N2I5NHBrdGVzdHJvbGU5XCIsXCI1N2I5NHBrdGVzdHJvbGUxMFwiLFwiNTdiOTRwa3Rlc3Ryb2xlMTFcIixcIjU3Yjk0cGt0ZXN0cm9sZTEyXCIsXCI1N2I5NHBrdGVzdHJvbGUxM1wiLFwiNTdiOTRwa3Rlc3Ryb2xlMTRcIixcIjQ1YmUzcWF0ZXN0YXBwYWRtaW5cIixcImQxYzY1cWF0ZXN0bWFya2V0aW5nYWRtaW5cIixcIjRkOWZldGVzdGFkbWluYXBwYWRtaW5cIixcIjliYjY4cWF0ZXN0aW50ZXJuYWxhZG1pblwiLFwiYjE2NDNxYWludGVybmFsYWRtaW5cIixcIjFjOGVhcWF0ZXN0YXV0b2luY2FkbWluXCIsXCI5NmFiNHBsYXNtYXRlc3RhcHBhZG1pblwiLFwiNzkxODFxYWFjbG91ZGFkbWluXCIsXCI3OTE4MXFhYWNsb3Vkdmlld1wiLFwiNjVkNjNhc3NldHRyYWNraW5nYWRtaW5cIixcImZlZWRtb25pdG9yaW5nYWRtaW5cIixcImxta21zdHJkZWxldGVyb2xlXCIsXCJsbWttc3RyZGF0YXZpZXdcIixcImxta21zdHJwbGFzbWF2aWV3XCIsXCJsbWttc3Ryc2FkbW5cIixcImxta21zdHJwbGFzbWFzYWRtblwiLFwiZGU1NzNsbWttc3RycGxhc21hYWRtblwiLFwiNzRkNWZsbWttc3RyYnJhbmNoYWRtaW5cIixcImEzNmYwbG1rbXN0cmRpdmlzaW9uYWRtaW5cIixcIjdjZmY3bG1rbXN0cmFkbW5cIixcIjE5MmE3bWFuYWdlYXBwXCIsXCIxOWMyOG1hbmFnZXJvbGVcIixcIjFhNjE4bWFuYWdldXNlclwiLFwiMWIwMDBtYW5hZ2Vncm91cFwiLFwiNTUyN2RtYW5hZ2V2aWV3XCIsXCI3MTM1NXFhdGVzdHJvbGVcIixcIjcxMzU1cWFyb2xlYWxwaGFcIixcIjcxMzU1dGVzdDAxXCIsXCI3MTM1NXFhdGVzdHJvbGUyXCIsXCI3MTM4ZG5laGF1c2Vycm9sZVwiLFwiNTUyN2RkYXNoYm9hcmRyb2xldGVzdFwiLFwiNTUyN2RwaWdlbmVyYWx1c2VydGVzdFwiLFwiNzEzOGR4eXptYW5hZ2VcIixcImxta3RvcGxpbmVsaXZlc3RvY2thZG1pblwiLFwibG1rdG9wbGluZXdvb2xhZG1pblwiLFwibG1rdG9wbGluZWluc3VyYW5jZWFkbWluXCIsXCJhZ2VuY3lyZXBvcnRpbmdcIixcInRvcGxpbmVicmFuY2hyZXBvcnRpbmdcIixcInRvcGxpbmVkaXZpc2lvbnJlcG9ydGluZ1wiLFwidG9wbGluZXJlZ2lvbmFscmVwb3J0aW5nXCIsXCJ0b3BsaW5ld29vbGFyZWFyZXBvcnRpbmdcIixcInRvcGxpbmVjb3Jwb3JhdGVyZXBvcnRpbmdcIixcIjU3MzU1bG1rbHNhXCJdfSIsIm5iZiI6MTYwNTA5NTcwNSwiZXhwIjoxNjA1MjY4NTA1LCJpc3MiOiJodHRwczovL2xta3N0YWdpbmcyLXdmLmMybS5uZXQiLCJhdWQiOiJodHRwczovL2xta3N0YWdpbmcyLXdmLmMybS5uZXQifQ.clbfOLkydGggAJAHoCtGnasCCEMkGvgRcUCH0c5aPlE" }) }     
        return this.http.post<any>(environment.Setting.BaseAPIUrlLmk + url, {})
    }

    isSamlUser(username: string) {
        const httpHeader = new HttpHeaders({ UserName: username });
        const objHttpHeader = { headers: httpHeader };
        return this.http.post<any>(environment.Setting.BaseAPIUrlLmk + '/User/GetUserInfo', {}, objHttpHeader)
            .pipe(map(res => {
                var userInfo = JSON.parse(Base64.decode(res.userInfo));
                return userInfo;
            }));
    }
}
