import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class UserDetail {
    constructor(){
        const AccessToken = localStorage.getItem('AccessToken');
        if (AccessToken) {
            const aToken = AccessToken.split('.');
            let currentUser: any;
            const offset = new Date().getTimezoneOffset();
            let userDetail: any;
            if(aToken.length > 1) {
                userDetail = JSON.parse(atob(aToken[1]));
                currentUser = JSON.parse(userDetail.User);
                this.token = userDetail.AcessToken;
                this.RefreshToken = userDetail.RefreshToken;
            } else {
                currentUser = JSON.parse(localStorage.getItem('currentUser'));
                this.token = localStorage.getItem('AccessToken');
                this.RefreshToken = localStorage.getItem('RefreshToken');
            }
            this.TimeZone = offset;
            this.UserName = currentUser.UserName;
            this.UserID = currentUser.UserId;
            this.FirstName = currentUser.FirstName;
            this.LastName = currentUser.LastName;
            this.Language = currentUser.Language;
            this.GroupId = currentUser.GroupId;
            this.ListRole = currentUser.Roles;
            this.FullName = currentUser.FirstName + ' ' + currentUser.LastName;
            this.ApiKey=currentUser.ApiKey;
            this.isAuthenticate = true;
            this.EAccessToken = currentUser.EAccessToken;
            this.ERefreshToken = currentUser.ERefreshToken;
            this.EUserName = currentUser.EUserName;
        } else {
            this.isAuthenticate = false;
        }
        
    }
    UserID: number;
    UserName: string;
    Password: string;
    FirstName: string;
    LastName: string;
    FullName:string;
    TimeZone:number;
    Language: string;
    ListRole:any[];
    token: string;
    RefreshToken: string;
    GroupId: string;
    isAuthenticate: boolean;
    ApiKey:string;
    EAccessToken:any;
    ERefreshToken:any;
    EUserName:any;
}