import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserDetail } from '@app/core/models/user-detail';
import { UserService } from '@app/core';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted = false;
  loading = false;
  accountNumberList = [];
  isEditingAccountNumber = false;
  editingAccountNumberIndex: number;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private userDetail: UserDetail,    
    private userservice: UserService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      accountStatus: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required,
        Validators.pattern('^[+]?[6][1](?:\\s?\\d){9}$|^[(][0][1-9][)](?:\\s?\\d){8}$|^[0][1-9](?:\\s?\\d){8}$')]
      ],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, confirmPassword]],
      newAccountNumber: ['']
    });
    
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.form.invalid) {
      this.loading = false;
      return;
    } else {
      const url = `${environment.Setting.BaseAPIUrlLmk}/user/icewebapi`;
     // const apiEndpoint = 'api/RegisterUser';

      const iceWebhttpOptions = {
        headers: new HttpHeaders({
          accessToken: localStorage.getItem('AccessToken'),
          apiEndpoint: 'api/RegisterUser'
        })
      };

      const data = {
        AccountStatus: this.form.value.accountStatus,
        FirstName: this.form.value.firstName,
        LastName: this.form.value.lastName,
        PhoneNumber: this.form.value.phone,
        EmailAddress: this.form.value.email,
        Password: this.form.value.password,
        AccessToken: this.userDetail.token,
        PolicyBundleId: environment.Setting.PolicyBundleId,
        GroupId: environment.Setting.GroupId,
        RoleIds: environment.Setting.RoleIds,
        EmailBody:
          "<p style='width:500px; height:34px; padding:10px 15px 10px 15px;text-align:center;'>Thank You<br /><strong>C2M Team</strong><br /><br />3010 LBJ Freeway, Suite 1515<br />Dallas, Texas 75234<br /><br /></p>"
      };
      this.http.post(url, data, iceWebhttpOptions).subscribe(
        (response: { status: string }) => {
          if (response.status === 'SUCCESS') {
            // email needed to retrieve and update buyer details
            localStorage.setItem('EmailAddress', data.EmailAddress);
            this.loading = false;
            this.toastr.success('Buyer details successfully added!');
            this.persistLan();
            this.persistStatus();
            this.router.navigateByUrl('e-saleyard/grid');
          } else {
            this.loading = false;
            this.toastr.error('There is an error!');
            console.log(response);
          }
        },
        e => {
          this.loading = false;
          this.toastr.error('There is an error!');
          console.log(e);
        }
      );
    }
  }

  private async persistStatus() {
    const accessToken = localStorage.getItem('AccessToken');
    const apiEndpoint = 'api/SetUserStatus';
    const url = `${environment.Setting.BaseAPIUrlLmk}/user/icewebapi`;
    const httpOptions = {
      headers: new HttpHeaders({
        accesstoken: accessToken,
        // UserEmail: this.form.value.email,
        UserName: this.form.value.email,
        UserStatus: this.form.value.status
      })
    };

    const data = {
      AccessToken: this.userDetail.token,
      UserName: this.form.value.email,
      Status: this.form.value.status
    };
    const result = await this.http.post(url, data, {headers: {apiEndpoint}}).toPromise();
    console.log(result);
  }

  private async persistLan() {
    const url = `${environment.Setting.BaseAPIUrlLmk}/user/addEditAccountNo`;
    const accessToken = localStorage.getItem('AccessToken');
    const dataLmk = {
      UserName: this.form.value.email
    };
    const httpOptions = {
      headers: new HttpHeaders({
        AccessToken: accessToken
        // UserEmail: this.form.value.email,
        // UserName: this.form.value.email,
        // Status: '0'
      })
    };
    // saving landmark account numbers
    for await (const acc of this.accountNumberList) {
      const dataLmkProcessed = { ...dataLmk, LandmarkAccountNumber: acc };
      const n = await this.http.post(url, dataLmkProcessed, httpOptions).toPromise();
      // console.log('LAN saved...', dataLmkProcessed, n);
    }
  }

  addOrSaveEditedAccountNumber() {
    if (!this.form.value.newAccountNumber) {
      return;
    }
    if (this.isEditingAccountNumber) {
      this.saveEditedAccountNumber();
    } else {
      this.addAccountNumber();
    }
  }

  addAccountNumber() {
    if (this.form.value.newAccountNumber != null && this.form.value.newAccountNumber !== '') {
      if (this.accountNumberList.length > 49) {
        this.toastr.error('You can add up to 50 Nutrien Account Numbers');
      } else {
        this.accountNumberList.push(this.form.value.newAccountNumber);
        this.form.controls.newAccountNumber.setValue('');
      }
    }
  }

  editAccountNumber(index: number) {
    this.isEditingAccountNumber = true;
    this.editingAccountNumberIndex = index;
    this.form.controls.newAccountNumber.setValue(this.accountNumberList[index]);
  }

  deleteAccountNumber(index: number) {
    this.accountNumberList.splice(index, 1);
    if (this.isEditingAccountNumber) {
      if (this.editingAccountNumberIndex === index) {
        this.form.controls.newAccountNumber.setValue('');
        this.isEditingAccountNumber = false;
      } else if (this.editingAccountNumberIndex > index) {
        this.editingAccountNumberIndex -= 1;
      }
    }
  }

  saveEditedAccountNumber() {
    this.accountNumberList[this.editingAccountNumberIndex] = this.form.value.newAccountNumber;
    this.isEditingAccountNumber = false;
    this.form.controls.newAccountNumber.setValue('');
  }

  cancelEditingAccountNumber() {
    this.isEditingAccountNumber = false;
    this.form.controls.newAccountNumber.setValue('');
  }

  ngOnDestroy() {}
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
