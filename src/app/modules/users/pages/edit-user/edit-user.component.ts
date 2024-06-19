import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, take } from 'rxjs/operators';

import { environment } from '@env/environment';
import { ApiESaleyardService } from '@app/core/services/api-e-saleyard.service';
import { UserDetail } from '@app/core/models/user-detail';



@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  APIKey: string;
  email: string;
  form: FormGroup;
  submitted = false;
  loading = false;
  accountNumberList = [];
  initialAccountNumberList = [];
  isEditingAccountNumber = false;
  editingAccountNumberIndex: number;
  UserEmail: string;
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiESaleyardService,
    private modalService: NgbModal,
    private userDetail: UserDetail
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      accountStatus: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[+]?[6][1](?:\\s?\\d){9}$|^[(][0][1-9][)](?:\\s?\\d){8}$|^[0][1-9](?:\\s?\\d){8}$')
        ]
      ],
      // password: ['', [Validators.required]],
      // confirmPassword: ['', [Validators.required, confirmPassword]],
      newAccountNumber: ['']
    });
    if (this.route.snapshot.params.id) {
      this.UserEmail = this.route.snapshot.params.id;
      this.getUserProfile(this.route.snapshot.params.id);
    }
  }

  get f() {
    return this.form.controls;
  }

  async getUserProfile(email) {
    const accessToken = localStorage.getItem('AccessToken');
    const apiEndpoint = 'api/getuserprofile_lmkcrm';

    // const email = localStorage.getItem('EmailAddress');
    // retrieve landmark account numbers
    const httpOptions = {
      headers: new HttpHeaders({
        accesstoken: accessToken
      })
    };
    const urlLmk = `${environment.Setting.BaseAPIUrlLmk}/user/getAccountNoByUser`;
    this.accountNumberList = (await this.http
      .get(urlLmk, { params: { userName: email }, ...httpOptions })
      .toPromise()) as Array<any>;

    this.initialAccountNumberList = this.accountNumberList.slice();
    console.log('initialAccountNumberList...', this.initialAccountNumberList);
    
    const url = `${environment.Setting.BaseAPIUrlLmk}/user/icewebapi`;
    const data = {
      EmailAddress: email,
      AccessToken: accessToken
    };
    this.http
      .post(url, data, {headers: {apiEndpoint}})
      .pipe(
        take(1),
        map((response: { data: any }) => response.data.User)
      )
      .subscribe(buyer => {
        console.log('buyer..', buyer);
        this.APIKey = buyer.APIKey;
        this.form.get('firstName').setValue(buyer.FirstName);
        this.form.get('lastName').setValue(buyer.LastName);
        this.form.get('email').setValue(buyer.EmailAddress);
        this.form.get('phone').setValue(buyer.PhoneNumber);
        this.form.get('accountStatus').setValue(buyer.UserStatus);
        this.email = buyer.EmailAddress;
      });
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.form.invalid) {
      this.loading = false;
      return;
    } else {
      const url = `${environment.Setting.BaseAPIUrlLmk}/user/icewebapi`;
      const apiEndpoint = 'api/UpdateUserProfile';
      const data = {
        APIKey: this.APIKey,
        AccessToken: localStorage.getItem('AccessToken'),
        FirstName: this.form.value.firstName,
        LastName: this.form.value.lastName,
        PhoneNumber: this.form.value.phone,
        // EmailAddress: this.form.value.email,
        EmailAddress: this.email,
        Country: '0'
        // Password: this.form.value.password,
      };
      this.http
        .post(url, data, {headers: {apiEndpoint}})
        .pipe(take(1))
        .subscribe(
          (response: { status: string }) => {
            if (response.status === 'SUCCESS') {
              // email needed to retrieve and update buyer details
              // localStorage.setItem('EmailAddress', data.EmailAddress);
              this.loading = false;
              this.toastr.success('Buyer details successfully added!');
              this.updateLan();
              this.persistStatus();
              // this.router.navigateByUrl('e-saleyard/grid');
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
        UserStatus: this.form.value.accountStatus
      })
    };

    const data = {
      AccessToken: this.userDetail.token,
      // UserName: this.form.value.email,
      UserName: this.email,
      Status: this.form.value.accountStatus
    };
    const result = await this.http.post(url, data, {headers: {apiEndpoint}}).toPromise();
    console.log('User status result...', data, result);
  }

  private async updateLan() {
    // const email = //localStorage.getItem('EmailAddress');
    const urlPost = `${environment.Setting.BaseAPIUrlLmk}/user/addEditAccountNo`;
    const urlDelete = `${environment.Setting.BaseAPIUrlLmk}/user/deleteAccountNo`;
    const accessToken = localStorage.getItem('AccessToken');

    const httpOptions = {
      headers: new HttpHeaders({
        accesstoken: accessToken
      })
    };

    // delete all landmark account numbers
    // for await (const acc of this.initialAccountNumberList) {
    //   const result = await this.http
    //     .delete(urlDelete, { params: { AccountNumbers: acc.AccountNumber }, ...httpOptions })
    //     .toPromise();
    //   // console.log('deleted...', acc.AccountNumber, result);
    // }
    console.log('this.accnulist...', this.accountNumberList);
    // persist the updated landmark account numbers
    // if (this.isEditingAccountNumber) {
    // for await (const acc of this.accountNumberList) {
    //   const dataLmkProcessed = {
    //     // ...acc,
    //     UserName: this.UserEmail,
    //     // AccountNo: Number(acc.AccountNumber),
    //     AccountNumber: Number(acc.AccountNumber),
    //     // LandmarkAccountNo: acc.LandmarkAccountNumber,
    //     LandmarkAccountNumber: acc.LandmarkAccountNumber,
    //     TradingName: acc.TradingName,
    //     Status: acc.Status
    //   };
    //   const n = await this.http.post(urlPost, dataLmkProcessed, httpOptions).toPromise();
    // }
    // }
  }

  private async approveAccNo(acc: {
    AccountNumber: number;
    TradingName: string;
    LandmarkAccountNumber: number;
    Status: string;
  }) {
    if (acc.Status === 'Approved') {
      return;
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
        // const data = {
        //   AccountNumber: 0,
        //   LandmarkAccountNumber: this.form.value.newAccountNumber,
        //   TradingName: '',
        //   Status: 'Pending'
        // };

        // for (const acc of this.accountNumberList) {
        const dataLmkProcessed = {
          // ...acc,
          UserName: this.UserEmail,
          // AccountNo: Number(acc.AccountNumber),
          AccountNumber: 0,
          // LandmarkAccountNo: acc.LandmarkAccountNumber,
          LandmarkAccountNumber: this.form.value.newAccountNumber,
          TradingName: '',
          Status: 'Pending'
        };
        const urlPost = `${environment.Setting.BaseAPIUrlLmk}/user/addEditAccountNo`;
        const accessToken = localStorage.getItem('AccessToken');
        const httpOptions = {
          headers: new HttpHeaders({
            accesstoken: accessToken
          })
        };
        // this.http.post(urlPost, dataLmkProcessed, httpOptions).toPromise();
        this.http.post(urlPost, dataLmkProcessed, httpOptions)
          .subscribe(
            data => {
              this.getUserProfile(this.route.snapshot.params.id);
              console.log('add account number', data);
            }
          );
        // }




        // this.accountNumberList.push(data);
        this.form.controls.newAccountNumber.setValue('');
      }
    }
  }

  editAccountNumber(index: number) {
    this.isEditingAccountNumber = true;
    this.editingAccountNumberIndex = index;
    this.form.controls.newAccountNumber.setValue(
      this.accountNumberList[index].LandmarkAccountNumber
    );
  }

  deleteAccountNumber(event, index: number) {
    const urlDelete = `${environment.Setting.BaseAPIUrlLmk}/user/deleteAccountNo`;
    const accessToken = localStorage.getItem('AccessToken');

    const httpOptions = {
      headers: new HttpHeaders({
        accesstoken: accessToken
      })
    };
    const result = this.http
      .delete(urlDelete, { params: { AccountNumbers: event.AccountNumber }, ...httpOptions })
      .toPromise();
    console.log('deleted...', event.AccountNumber, result);
    this.accountNumberList.splice(index, 1);

    // delete all landmark account numbers
    // for (const acc of this.initialAccountNumberList) {
    //   const result = this.http
    //     .delete(urlDelete, { params: { AccountNumbers: acc.AccountNumber }, ...httpOptions })
    //     .toPromise();
    //   console.log('deleted...', acc.AccountNumber, result);
    //   this.accountNumberList.splice(index, 1);
    // }
    // console.log('this.accnulist...', this.accountNumberList);
    // if (this.isEditingAccountNumber) {
    //   this.accountNumberList.splice(index, 1);
    //   if (this.editingAccountNumberIndex === index) {
    //     this.form.controls.newAccountNumber.setValue('');
    //     this.isEditingAccountNumber = false;
    //   } else if (this.editingAccountNumberIndex > index) {
    //     this.editingAccountNumberIndex -= 1;
    //   }
    // }
  }

  saveEditedAccountNumber() {
    const data = {
      ...this.accountNumberList[this.editingAccountNumberIndex],
      LandmarkAccountNumber: this.form.value.newAccountNumber,
      UserName: this.UserEmail,
    };
    this.accountNumberList[this.editingAccountNumberIndex] = data;

    const urlPost = `${environment.Setting.BaseAPIUrlLmk}/user/addEditAccountNo`;
    const accessToken = localStorage.getItem('AccessToken');
    const httpOptions = {
      headers: new HttpHeaders({
        accesstoken: accessToken
      })
    };

    this.http.post(urlPost, data, httpOptions)
          .subscribe(
            editdata => {
              this.getUserProfile(this.route.snapshot.params.id);
              this.isEditingAccountNumber = false;
              this.form.controls.newAccountNumber.setValue('');
              console.log('add account number', editdata);
            }
          );
  }

  cancelEditingAccountNumber() {
    this.isEditingAccountNumber = false;
    this.form.controls.newAccountNumber.setValue('');
  }
}
