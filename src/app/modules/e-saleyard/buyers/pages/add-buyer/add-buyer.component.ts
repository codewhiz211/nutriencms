import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { getTemplate } from './custom-template';
import { MustMatch } from '@app/core/validators/must-match.validator';
import * as templates from '@app/core/templates';
import { UserManagementService } from '@app/core/services/user-management.service';
import { UserDetail } from '@app/core/models/user-detail';
import { ApiESaleyardService } from '@app/core';

@Component({
  selector: 'app-add-buyer',
  templateUrl: './add-buyer.component.html',
  styleUrls: ['./add-buyer.component.scss']
})
export class AddBuyerComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted = false;
  loading = false;
  accountNumberList = [];
  isEditingAccountNumber = false;
  editingAccountNumberIndex: number;
  fieldTextType:boolean=false;
  fieldTextTypeCPass: boolean=false;
  isBuyerAccess:boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    public usermanagement: UserManagementService,
    private userDetail: UserDetail,
    private esaleyardservice : ApiESaleyardService
  ) {}

  ngOnInit() {    
  this.isBuyerAccess = this.esaleyardservice.hasBuyerFullAccess;
    this.form = this.formBuilder.group({
      accountStatus: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z]{1}[a-zA-Z0-9.\-_]*@[a-zA-Z]{1}[a-zA-Z.-]*[a-zA-Z]{1}[.][a-zA-Z]{2,}$')]],
      phone: [
        '',
        [Validators.required,
        Validators.pattern('^[+]?[6][1](?:\\s?\\d){9}$|^[(][0][1-9][)](?:\\s?\\d){8}$|^[0][1-9](?:\\s?\\d){8}$')]
      ],
      password: ['', [Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      confirmPassword: ['', [Validators.required]],
      newAccountNumber: ['']
    }, {validators: MustMatch('password', 'confirmPassword')});
    const url = (this.router.url).split('/');
    if (url[1] === 'e-saleyard' && url[2] === 'add-buyer') {
      this.usermanagement.checkBuyerRole('buyermgmt').subscribe();
    }
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

      //var emailTemplate = getTemplate(environment.Setting.webUrlRoot, this.form.value.firstName);//Added for get Email Template
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
        RoleIds: environment.Setting.LMK_Buyer_RoleID,
        EmailBody: '',//templates.generateEmailHtml(emailTemplate),//Added for get Email body from base template 
        Subject:'',//'Welcome to Nutrien E-Saleyard',
        FromEmail:'',//'e-saleyard@landmark.com.au' 
        MailKey:'Account_Created'      
      };
      this.http.post(url, data, iceWebhttpOptions).subscribe(
        (response: { status: string,message:string}) => {          
          if (response.status === 'SUCCESS') {
            // email needed to retrieve and update buyer details
            localStorage.setItem('EmailAddress', data.EmailAddress);
            this.loading = false;
            this.toastr.success('Buyer details successfully added!');
             this.persistLan();
            this.persistStatus();            
          } else {
            this.loading = false;
            if(response.message === 'User already exist with this email address'){
              this.toastr.error('Unable to create account, buyer already exists.');
            }   else{
              this.toastr.error('There is an error!');
            }         
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
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     accessToken: accessToken,
    //     UserEmail: this.form.value.email,
    //     UserName: this.form.value.email,
    //     UserStatus: this.form.value.status,
    //     apiEndpoint: 'api/SetUserStatus',
    //   })
    // };
    const httpOptions = {
      headers: new HttpHeaders({
        accessToken: accessToken,
        apiEndpoint: apiEndpoint
      })
    };

    const data = {
      AccessToken: this.userDetail.token,
      UserName: this.form.value.email,
      Status: this.form.value.accountStatus
    };
    const result = await this.http.post(url, data, httpOptions).toPromise();
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
      const dataLmkProcessed = { ...dataLmk, LandmarkAccountNumber: acc.trim() };
      const n = await this.http.post(url, dataLmkProcessed, httpOptions).toPromise();
      // console.log('LAN saved...', dataLmkProcessed, n);
    }
    this.router.navigateByUrl('e-saleyard/grid');
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
        this.accountNumberList.push(this.form.value.newAccountNumber.trim());
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
    this.accountNumberList[this.editingAccountNumberIndex] = this.form.value.newAccountNumber.trim();
    this.isEditingAccountNumber = false;
    this.form.controls.newAccountNumber.setValue('');
  }

  cancelEditingAccountNumber() {
    this.isEditingAccountNumber = false;
    this.form.controls.newAccountNumber.setValue('');
  }

  // Switching method 
toggleFieldTextType() {
  this.fieldTextType = !this.fieldTextType;
}
toggleFieldTextTypeCPass(){
  this.fieldTextTypeCPass = !this.fieldTextTypeCPass;
}

  ngOnDestroy() {}
}