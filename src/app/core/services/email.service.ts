import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Email } from '../models/email.model';
import { UserProfile } from '../models/user-profile.model';
import * as templates from '../templates';

import { environment } from '@env/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({providedIn: 'root'})
export class EmailService {

  private _url = `${environment.Setting.BaseAPIUrlLmk}/user/mailLogNotification`;
  //private _urlmailpwd = `${environment.Setting.lmkwebrooturl}/user/mailLogNotification`;
  constructor( private http: HttpClient,@Inject(DOCUMENT) private document ) {}

  sendEmail(type: EmailType, user: UserProfile, data?: any) {
    // let emailBodyHtml: string='';
    // let emailSubect:string='';
    // let fullEmailHtml:string;
    let TradingName:string='';
    let MailKey:string;
    if (type === 'Account Suspended') {
     // emailSubect = 'Your E-Saleyard Account Is Suspended';
      //emailBodyHtml = templates.accountSuspendedEmailBody(user);
      MailKey = 'Account_Suspended';
    } else if(type === 'Account Reactivated') {
      //emailSubect = 'Your E-Saleyard Account Is Now Active';
     // emailBodyHtml = templates.accountReactivatedEmailBody(user);
     MailKey = 'Account_Activated'; 
    } else if (type === 'Nutrien Buyer Account Approved') {
      //emailSubect = 'Your Nutrien E-Saleyard Buyer Account Is Approved';
      //emailBodyHtml = templates.buyerAccountApprovedEmailBody(user, data);
     MailKey = 'Account_Approved';
     TradingName =data.sapNumber+'~'+data.tradingName;
     console.log(TradingName);
    } 
    // else if (type === 'Buyer Account Reactivated') {
    //   emailSubect = type;
    //   emailBodyHtml = templates.buyerAccountReactivatedEmailBody(user, data);      
    //  fullEmailHtml = templates.generateEmailHtml(emailBodyHtml);
    // } else if (type === 'Buyer Account Suspended') {
    //   emailSubect = type;
    //   emailBodyHtml = templates.buyerAccountSuspendedEmailBody(user, data);      
    //   fullEmailHtml = templates.generateEmailHtml(emailBodyHtml);
    // }
    else if (type === 'Password Updated') {
      //emailSubect = 'Your Password Has Been Updated';      
      //emailBodyHtml = templates.passwordUpdatedEmailBody(user);
      MailKey = 'Update_Password';
    }
    const email: Email = {
      MailSubject: '',
      MailBody: '',
      MailFrom: '',     
      MailTo: user.EmailAddress,
      MailKey:MailKey,
      TradingName:TradingName
    };

   if(type === 'Password Updated' ){
     //const fullEmailHtmNuterien = templates.generateNuterienEmailHtml(emailBodyHtml,this.document.location.origin);
    const emailNuterien: Email = {
      MailSubject: '',
      MailBody: '',
      MailFrom:'no-reply@email.plasmacomp.com',
     // MailFrom: 'E-Saleyard@landmark.com.au',
      MailTo: user.EmailAddress,
      MailKey:MailKey,
      TradingName:TradingName
    };
    return this.http.post(this._url, emailNuterien, this._setHeadersforpwd());
   }
    return this.http.post(this._url, email, this._setHeaders());
  }

  private _setHeaders() {
    const accessToken = localStorage.getItem('AccessToken');
    return {
      headers: new HttpHeaders({accessToken})
    } 
  }
  private _setHeadersforpwd() {
    //let { accessToken } = this.auth.credentials.getValue();
    let  accessToken ="";
    if (!accessToken)
      accessToken = environment.Setting.AdminViewAccessToken;

    return {
      headers: new HttpHeaders({accessToken})
    };
  }
}
type EmailType =
| 'Account Suspended'
| 'Account Reactivated'
| 'Nutrien Buyer Account Approved'
| 'Buyer Account Reactivated'
| 'Buyer Account Suspended'
| 'Password Updated'
