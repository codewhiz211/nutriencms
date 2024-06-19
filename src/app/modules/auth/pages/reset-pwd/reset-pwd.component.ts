import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '@app/core';
// import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '@app/core/services/message.service';
import { environment } from '@env/environment';
import { EmailService } from '@app/core/services/email.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-reset-pwd',
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-pwd.component.scss']
})
export class ResetPwdComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private msg: MessageService,
    private emailService: EmailService,
    private router_activate: ActivatedRoute,
    private router: Router,
    
  ) {}

  ngOnInit() {

    this.form = this.formBuilder.group({
      resetCode: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, confirmPassword]]
    });    
      this.isLinkExpire();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

 isLinkExpire(){
  try{
    if(!this.router_activate.snapshot.queryParamMap.get('ids')){
      this.msg.showMessage('Warning', {body: `Can't complete this request`})
      this.router.navigateByUrl('/auth/login');
     return true;
    }
   //this.router_activate.snapshot.queryParamMap.get('ids');
   var decrypted = CryptoJS.AES.decrypt(decodeURIComponent(this.router_activate.snapshot.queryParamMap.get('ids')), environment.Setting.secretCode);
   const minutes=diff_minutes(((new Date()).toUTCString()),(decrypted.toString(CryptoJS.enc.Utf8)))
   if(!(minutes<=10)){
    this.msg.showMessage('Warning', {body: `Your activation link has been expired.`})
    this.router.navigateByUrl('/auth/login');
    return true;
   }
  else{
    return false;
  }}
   catch(err){
    this.msg.showMessage('Warning', {body: `Can't complete this request `})
    this.router.navigateByUrl('/auth/login');
    return true;
   }
}
  async resetPassword() {
    
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    if(this.isLinkExpire()){
      return;
    };
    const email = localStorage.getItem('EmailAddressForResetPassword');
     const data = {
       AccessToken: environment.Setting.AdminViewAccessToken,
       EmailAddress: Encryption(email),
       PasswordResetCode: Encryption((this.form.value.resetCode as string).trim()),
       Password: Encryption(this.form.value.password),
       EmailBody:'blank'
     };

    try {
       const response = await this.auth.resetPasswordByCode(data).toPromise();
       if (response.status === 'SUCCESS') {
         const userData = {
           AccessToken:environment.Setting.AdminViewAccessToken,
           EmailAddress: email
         };        
         //const userResponse = await this.auth.getUserProfile(userData).toPromise();
        //if (userResponse.status === 'SUCCESS') {
         
           this.emailService.sendEmail("Password Updated", {EmailAddress: email,FirstName:''}).toPromise();
           this.msg.showMessage('Success', {header: 'Password Reset', body: 'Your password has been successfully updated. Click continue to log in.'})
         //this.toastr.success(`New password activated.`);
           this.router.navigateByUrl('/auth/login');
           //localStorage.removeItem('EmailAddressForResetPassword');
        // }
       }
       else if(response.code==='9094'){
        this.msg.showMessage("Warning", {body: `Please try again after two hour.`})
      }  
        else {
      //   // this.toastr.error(`Can't complete this request.`);
         this.msg.showMessage('Warning',{body: `Can't complete this request`})
      //   // console.log('response...', response);
       }
    } catch (err) {
      console.log(err);
     this.msg.showMessage('Warning', {body: `Can't complete this request`})
      // this.toastr.error(`Can't complete this request.`);
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

function diff_minutes(dt2, dt1) 
 {
  dt2=new Date(dt2);
  dt1=new Date(dt1);
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
 }

function confirmPassword(control: AbstractControl): any {
  if (!control.parent || !control) {
    return;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('confirmPassword');

  if (!password || !passwordConfirm) {
    return;
  }

  if (passwordConfirm.value === '') {
    return;
  }

  if (password.value !== passwordConfirm.value) {
    return {
      passwordsNotMatch: true
    };
  }
}
