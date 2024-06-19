import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '@app/core';
// import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '@app/core/services/message.service';
import { environment } from '@env/environment';
import * as templates from '@app/core/templates';

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.scss']
})
export class ChangePwdComponent implements OnInit {
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
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      oldpwd: ['', [Validators.required,,Validators.minLength(8), Validators.pattern(environment.regex.password)]],
      newpwd:['',[Validators.required,Validators.minLength(8), Validators.pattern(environment.regex.password)]],
      confpwd:['',[Validators.required]],
    },
    {validators: MustMatch('newpwd', 'confpwd')}
    );
  }

  get formHasErrors() {
    return  (this.f.oldpwd.dirty && this.f.oldpwd.touched && this.f.oldpwd.errors) ||
            (this.f.newpwd.dirty && this.f.newpwd.touched && this.f.newpwd.errors) ||
            (this.f.confpwd.dirty && this.f.confpwd.touched && this.f.confpwd.errors) 
         
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  async changepassword() {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    const emailforchangepwd =localStorage.getItem('emailforchangepwd');

    if (this.f.oldpwd.value!=this.f.newpwd.value) {
      this.activeModal.close(false);
      const passwordResponse = await this.auth.updatePassword(this.f.oldpwd.value,this.f.newpwd.value,emailforchangepwd);
      if (passwordResponse.status === 'SUCCESS') {
         
       // localStorage.removeItem('emailforchangepwd');
        this.msg.showMessage('Success', {body: passwordResponse.message});

      } else {
        this.msg.showMessage('Warning', {body: passwordResponse.message});
       // this.showAlert('warning', passwordResponse.message);
      }
    }
    
    //   try {
    //     //this.router.navigateByUrl('/auth/reset-password');
       
    //      const userResponse = await this.auth.getUserProfile(userData).toPromise();
    //      if (userResponse.status === 'SUCCESS') {
    //         this.userFirstname = userResponse.data.User.FirstName; 
    //         //var emailBody = forgotPasswordTemplate(environment.Setting.lmkstgwfurl,this.userFirstname);
    //         this.data = {
    //          AccessToken: environment.Setting.AdminViewAccessToken,
    //          EmailAddress: this.form.value.email,
    //          EmailBody: templates.generateEmailHtml(emailBody),
    //          Subject:'Please Reset Your Password',
    //          FromEmail:'E-Saleyard@landmark.com.au',
    //          SendSMS:false
    //        };    
    //      }
    //    const response = await this.auth.sendCodeForResetPassword(this.data).toPromise()
    //    if (response.status === 'SUCCESS') {
    //      this.activeModal.close(true);
    //     this.msg.showMessage('Success', {header: 'Code sent', body: `Code for reset password sent to ${this.data.EmailAddress}.`})
    //   //this.toastr.success(`Code for reset password sent to ${data.EmailAddress}.`);
    //      this.router.navigateByUrl('/auth/reset-password');
    //     localStorage.setItem('EmailAddressForResetPassword', this.data.EmailAddress);
    //   } else {
    //      if (response.code === '8087') {
    //        this.msg.showMessage("Warning", {body: `Please check your email to activate your account.`})
    //      // this.toastr.error(`Please check your email to activate your account.`);
    //      } else {
    //       this.msg.showMessage('Warning', {body: `Can't complete this request`})
    //   //     // this.toastr.error(`Can't complete this request.`);
    //    }
    //   //   // console.log('response...', response);
    //  }
    // } catch (err) {
    //   console.log(err);
    //   this.msg.showMessage('Warning', {body: `Can't complete this request`})
    //  //this.toastr.error(`Can't complete this request.`);
    // }
  }

}

function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
          // return if another validator has already found an error on the matchingControl
          return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ mustMatch: true });
      } else {
          matchingControl.setErrors(null);
      }
  }};
