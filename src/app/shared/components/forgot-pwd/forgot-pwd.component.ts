import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '@app/core';
// import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '@app/core/services/message.service';
import { environment } from '@env/environment';
import { forgotPasswordTemplate } from './custom-email-template';
import * as templates from '@app/core/templates';
import { DOCUMENT } from '@angular/common';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-forgot-pwd',
  templateUrl: './forgot-pwd.component.html',
  styleUrls: ['./forgot-pwd.component.scss']
})
export class ForgotPwdComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  userFirstname:any;
  data:any;
  constructor(
    private formBuilder: FormBuilder,
    // private api: ApiService,
    private auth: AuthenticationService,
    private msg: MessageService,
    // private toastr: ToastrService,
    private router: Router,
    public activeModal: NgbActiveModal,
    @Inject(DOCUMENT) private document
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  async sendResetCode() {
    //console.log(this.document.location);
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    const userData = {
      AccessToken:environment.Setting.AdminViewAccessToken,
     //AccessToken:'IAvlnTUr8mHZyOtXllEWgf2iD0TVzm32G/CLkjx+jC2XJXUnaOeeAsy1wRoa5etoaOEwdnXL3/A=',
      EmailAddress: this.form.value.email
    };  
      try {
        //this.router.navigateByUrl('/auth/reset-password');    
         //const userResponse = await this.auth.getUserProfile(userData).toPromise();
       //  if (userResponse.status === 'SUCCESS') {      
           
            this.userFirstname = '';
            const now= CryptoJS.AES.encrypt((new Date()).toUTCString(),environment.Setting.secretCode);
            const params = now.toString();
            const Body = 'wf:auth/reset-password/?ids=' + encodeURIComponent(params) + ':' + this.userFirstname;          
            //var emailBody = forgotPasswordTemplate(this.document.location.origin,this.userFirstname);
            this.data = {
             AccessToken: environment.Setting.AdminViewAccessToken,
             EmailAddress: Encryption(this.form.value.email),
             //EmailBody: templates.generateNuterienEmailHtml(emailBody,this.document.location.origin),
             EmailBody: Encryption(Body),
             //Subject: Encryption('Please Reset Your Password'),
             //FromEmail:'E-Saleyard@landmark.com.au',
             //FromEmail: Encryption('no-reply@email.plasmacomp.com'),
             SendSMS:false
           };    
         //}
       const response = await this.auth.sendCodeForResetPassword(this.data).toPromise()
       if (response.status === 'SUCCESS') {
        this.activeModal.close(true);
        this.msg.showMessage('Success', { header: 'Code sent', body: `Code for reset password sent to ${this.form.value.email}.`})
        const now= CryptoJS.AES.encrypt((new Date()).toUTCString(),environment.Setting.secretCode);
         const params=now.toString()
        //this.toastr.success(`Code for reset password sent to ${data.EmailAddress}.`);
         this.router.navigate(['/auth/reset-password'],{ queryParams: { ids: encodeURIComponent(params) }});
         localStorage.setItem('EmailAddressForResetPassword', this.form.value.email);
      } else {
         if (response.code === '8087') {
           this.msg.showMessage("Warning", {body: `Please check your email to activate your account.`})
         // this.toastr.error(`Please check your email to activate your account.`);
         } 
         else if(response.code==='9094'){
          this.msg.showMessage("Warning", {body: `Please try again after two hours.`})
         }
         else if (response.code === '5002') {
             this.msg.showMessage("Warning", { body: response.message })
         }
         else {
          this.msg.showMessage('Warning', {body: `Can't complete this request`})
      //     // this.toastr.error(`Can't complete this request.`);
       }
      //   // console.log('response...', response);
    // }
   } } catch (err) {
      //console.log(err);
      this.msg.showMessage('Warning', {body: `Can't complete this request`})
     //this.toastr.error(`Can't complete this request.`);
    }
  }
}

function Encryption(text) {
    var key = CryptoJS.enc.Utf8.parse('lmkkeyasdfghjklq');
    var iv = CryptoJS.enc.Utf8.parse('lmkkeyasdfghjklq');
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encrypted.toString();
}
