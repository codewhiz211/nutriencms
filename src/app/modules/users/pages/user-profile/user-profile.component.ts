import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { NgbModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { FormGroup, FormBuilder, FormArray, Validators, RequiredValidator } from '@angular/forms';
import { phoneNumberValidator } from '@app/core/validators/phone.validator';
import { ContentManagerService } from '@app/core/services/content-manager.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, RouterEvent, NavigationEnd, Router } from '@angular/router';
import { UserService } from '@app/core/services/user.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from '@app/core/services/ngb-date-fr-parser-formatter';
import { environment } from '@env/environment';
import { MustMatch } from '@app/core/validators/must-match.validator'
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { PasswordStrengthValidator } from '@app/core/validators/password-strength-validator';
import * as CryptoJS from 'crypto-js';
import { MessageService } from '@app/core';
import { ImageCompressorService } from '@app/core/services/image-compressor.service';
import { empty, BehaviorSubject } from 'rxjs';
import { async } from '@angular/core/testing';
import { ChangePwdComponent } from '@app/shared/components/change-pwd/change-pwd.component';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
})
export class UserProfileComponent implements OnInit {
  @ViewChild('trvReportingManger') trvReportingManger: ElementRef;
  @ViewChild('trvCompanyDropdwon') trvCompanyDropdwon: ElementRef;
  @ViewChild('trvRoleDropdwon') trvRoleDropdwon: ElementRef;
  @ViewChild('trvAddCompanyDropdwon') trvAddCompanyDropdwon: ElementRef;
  @ViewChild('trvRegionDropdown') trvRegionDropdown: ElementRef;
  @ViewChild('trvDivisionDropdown') trvDivisionDropdown: ElementRef;
  @ViewChild('trvBranchDropdown') trvBranchDropdown: ElementRef;
  @ViewChild('Alternateusertext') Alternateusertext: ElementRef;
  @ViewChild('trvAgencyDropdown') trvAgencyDropdown: ElementRef;
  isBtnHide = false;  
  isdisableDiv = false;  
  showpwd=false;
  isDisabled = false;
  isShowSpecialRoles = true;  
  IsBranchShow: boolean = true;
  ival: number = 0;
  commaSepData: any;
  IsFileUpload: boolean = false;
  ImgName: string = "";
  TempArray = [];
  CompTempArray = [];
  AddCompTempArray = [];
  validAddCompTempArray = [];
  tempVariable: any;
  getManagerByGroupId = [];
  data = {}
  RoleID = [];
  CompanyID = [];
  AddCompanyID = [];
  UID: any = "";
  croppedImage: any = '';
  transform: ImageTransform = { scale: 1 };
  file: File = null;
  errorMsg: string[5];
  imageChangedEvent: any = '';
  index: number;
  ControlName: any;
  files = [];
  afterCroped: any;
  loadData: any;
  loadEmailPreferences: any;
  loadCompany_List: any;
  AddloadCompany_List: any;
  loadRole_List: any;
  UserDetails: FormGroup;
  UpdateJson: any;
  updateEmailPref: any;
  IsSubmit: boolean = false;
  addEditData = {
    file: []
  };
  tempDataStore: any;
  showToplineddl:boolean=false;
  RegionData: [];
  SAPData: [];
  BranchData: [];
  AgencyData:any [];
  WoolStoreData: [];
  DivisionData = [];
  name = 'Angular 5';
  CompanyDropdownList = [];
  AddCompanyDropdownList = [];
  validAddCompanyDropdownList = [];
  RoleDropdownList = [];
  DropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  dropdownCompanySettings = {};
  isToplineReportingRoles:boolean= false;
  isLSARoles:boolean=false;
  requiredField: boolean = false;
  MinDate: any = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  MaxDate: any = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };

  currentDate: any = (new Date().getMonth() + 1) + "/" + (new Date().getDate()) + "/" + (new Date().getFullYear());

  ProfileLocation: string = environment.Setting.C2M_MediaApp_Url + "/UserResource/Uploaduserprofileimage/";
  dateFormatType: string = environment.Setting.dateFormat;
  bodyData = {
    ProcessName: "",
    PageSize: 1000,
    PageNumber: 0,
    SortColumn: "",
    SortOrder: "",
    TimeZone: "-330",
    ColumnList: "",
    GridFilters: [{
      GridConditions: [
      ],
      DataField: "",
      FilterType: 'Column_Filter',
      LogicalOperator: "OR"
    }],
    ViewName: "View 1"
  };

  pushGridCondition(value) {
    this.bodyData.GridFilters[0].GridConditions.push({
      Condition: "CONTAINS",
      ConditionValue: this.ManageSingleQuotes(value.trim())
    });
  }

  getCascadingDropdownDetails(type, Result) {
    if (Result.Data != undefined) {
      if (Result.Data.length > 0) {
        if (type == "Branch") {
          this.tempVariable = [];
          Result.Data.forEach(({ dmobranchbrcode, dmobranchbrname }) => {
            if (dmobranchbrcode == dmobranchbrname) {
                dmobranchbrname = dmobranchbrname + " ";
            }
            let item = { "item_id": dmobranchbrcode, "item_text": dmobranchbrname };
            if (this.tempVariable.find((item) => item.item_id === dmobranchbrcode) === undefined) {
              this.tempVariable.push(item);
            }
          });
          this.tempVariable.filter(x => x.item_id != 'All' && x.item_id != '' && x.item_text != '');
          this.BranchData = this.tempVariable;
        }
        else if (type == "Division") {
          this.TempArray = [];
          Result.Data.forEach(({ dmodivisondivisoncode, dmodivisondivisondscr }) => {
            if (dmodivisondivisoncode == dmodivisondivisondscr) {
                dmodivisondivisondscr = dmodivisondivisondscr + " ";
            }
            let item = { "item_id": dmodivisondivisoncode, "item_text": dmodivisondivisondscr };
            if (this.TempArray.find((item) => item.item_id === dmodivisondivisoncode) === undefined) {
              this.TempArray.push(item);
            }
          });
          this.TempArray.filter(x => x.item_id != 'All' && x.item_id != '' && x.item_text != '');
          this.DivisionData = this.TempArray;
        }
      }
    } else {
      this.msg.showMessage('Fail', { body: "Something went wrong error!" });
    }
  }


 ManageSingleQuotes(val){
   if (val) {
     return val.replace(/'/g, "'''");
   } else {
     return '';
   }
 } 

 

public openchangepassword()
{
        
  if(this.loadData.Email){
    localStorage.setItem('emailforchangepwd',this.loadData.Email);
    this.modalService.open(ChangePwdComponent, { size: 'lg', backdrop: 'static', windowClass: 'Confirm_popup' });
  }
  
 }


  async getCascadingDropdown(type) {
    if (type == "Branch") {
      this.bodyData.ProcessName = "LMKMSTRBranch";
      this.bodyData.SortColumn = "-1";
      this.bodyData.SortOrder = "-1";
      this.bodyData.ColumnList = "dmobranchbrcode,dmobranchbrname,dmobranchbrdivision,dmobranchbrprmscode,dmobranchbrsitecode,dmobranchbrregion,dmobranchbractlivestock";
      this.bodyData.GridFilters[0].DataField = "dmobranchbrdivision";
    }
    else if (type == "Division") {
      this.bodyData.ProcessName = "LMKMSTRDivision";
      this.bodyData.SortColumn = "dmodivisonregion";
      this.bodyData.SortOrder = "desc";
      this.bodyData.ColumnList = "dmodivisondivisoncode,dmodivisondivisondscr,dmodivisonregion,dmodivisondivisonactfrm,dmodivisondivisonactto";
      this.bodyData.GridFilters[0].DataField = "dmodivisonregion";
    }

    await this.userService.getCascadingDropdown(this.bodyData).then((Result) => {
      if (Result) {
        this.getCascadingDropdownDetails(type, Result);
      }
    }, (error) => {
      this.msg.showMessage('Fail', { body: error });
    });
  }
  
  constructor(
    private compressor: ImageCompressorService,
    private msg: MessageService,
    private rout: Router,
    private ngbDateFRParserFormatter: NgbDateFRParserFormatter,
    private userService: UserService,
    private renderer: Renderer2,
    private router: ActivatedRoute,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private contentManager: ContentManagerService,
    private toastr: ToastrService, calendar: NgbCalendar,
    private userDetail: UserDetail
  ) {

   
    if (this.router.snapshot.queryParamMap.get('uName')) {    
      this.UID = decodeURIComponent(this.router.snapshot.queryParamMap.get('uName'));
    
      if (this.UID == "myprofile=user") {
        this.isDisabled = true;
      } else {
        var decrypted = CryptoJS.AES.decrypt(this.UID, environment.Setting.secretCode);
        this.UID = decrypted.toString(CryptoJS.enc.Utf8);
      }
    }
    this.bindEmptyData();

    this.UserDetails = this.fb.group({
      Access_Permission: ['', [Validators.required]],
      User_Name: ['', [Validators.required]],
      //Password: ['', [Validators.required, PasswordStrengthValidator]],
      //Confirm_Password: ['', [Validators.required]],
       Password: [''],
      Confirm_Password: [''],
      Email: ['', [Validators.required, Validators.email]],
      First_Name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-| ]*$')]],
      Mobile: this.fb.group({
        Mobile_1: [''],// [Validators.required, Validators.pattern('^[0-9]*$')]],
        Mobile_2: [''],// [Validators.required, phoneNumberValidator]]
      }),
      Phone: this.fb.group({
        Phone_1: [''],//[Validators.pattern('^[0-9]*$')]],
        Phone_2: ['']//[phoneNumberValidator]
      }),
      Company: ['', [Validators.required]],
      AddCompany: [''],
      Role: ['', [Validators.required]],
      Region: ['', [Validators.required]],
      Employee_type: ['', [Validators.required]],
      Division: ['', [Validators.required]],
      Branch: ['', [Validators.required]],
      Agency: [''],
      Middle_Initial: ['', [Validators.pattern('^[a-zA-Z0-9| ]*$')]],
      Last_Name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-| ]*$'), Validators.maxLength(50)]],
      Title_of_the_Employee: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9| ]*$')]],
      Name_of_the_Reporting_Manager: ['', [Validators.required]],
     // Wool_Store: ['', [Validators.required]],
      // SAP_Number: ['',[Validators.required]],
      Out_of_Office: [''],
      Role_List: this.fb.array([]),
      Email_Prefer: this.fb.array([]),
      OutFrom: [null, [Validators.required]],
      OutUntil: [null, [Validators.required]],
      Pic_Name: [''],
      //Classified:[false],
      //BidAndOffer:[false]

    }, {
      validator: this.UID == '' ? MustMatch('Password', 'Confirm_Password') : ""
    });

    this.PushEmailPreferencesList();
    this.PushRole_List();
    this.patchValueMethod();
  }

  async GetUserDetails(Result) {
    if (Result.code == "200") 
    {
    
      var data = Result.data.Users;
      this.loadData =
      {
        "UserId": data.USERID,
        "User_Name": data.Username,
        "Last_Name": Object.values(data.LastName)[0],
        "Email": data.EmailAddress,
        "First_Name": Object.values(data.firstName)[0],
        "Middle_Initial": Object.values(data.mName)[0],
        "Mobile": { "Mobile_1": data.MobileCountryCode, "Mobile_2": data.MobileNo },
        "Phone": { "Phone_1": data.PhoneCountryCode, "Phone_2": data.phone },
        "Pic_Name": Object.values(data.photo)[0],
        "Access_Permission": data.IsDirectAccess == "False" ? "Landmark_SSO" : "Direct_Access",
        "Employee_type": Object.values(data.Designation)[0],
        "Password": "",
        "Confirm_Password": "",
        "Title_of_the_Employee": Object.values(data.TitleOfEmployee)[0],
        "Name_of_the_Reporting_Manager": Object.values(data.NameOfReportingManager)[0],
        //"Wool_Store": Object.values(data.WoolStore)[0],
        //"Agency": Object.values(data.Agency)[0],
        "Company": [],
        "AddCompany": [],
        "Role": [],
        "Region": [],
        "Division":[],
        "Branch":[],
        "Agency":[],
        "Out_of_Office": data.InOutStatus == "True" ? "op2" : "op1",
        "OutFrom": this.ngbDateFRParserFormatter.parse(this.changeDateFormatIntoCurrentFormat(data.OutFrom)),
        "OutUntil": this.ngbDateFRParserFormatter.parse(this.changeDateFormatIntoCurrentFormat(data.OutTill)),
      //  "Classified":data.Classified=="True"?true:false,
      //  "BidAndOffer":data.BidAndOffer=="True"?true:false

      };
                
        var dummyCompany: any = [];      
        this.CompTempArray = [];
        if (Object.values(data.Entity)[0] != "" && Object.values(data.Entity)[0] != undefined) {
            dummyCompany = Object.values(data.Entity)[0];
            dummyCompany = dummyCompany.split(',');
            for (let element of this.CompanyDropdownList) {
                if (dummyCompany.indexOf(element.item_id) > -1) {
                    this.CompTempArray.push(element);
                }
            }
        }
        this.loadData.Company = this.CompTempArray;

        this.validAddCompanyDropdownList = this.CompanyDropdownList.filter(x => x.item_id != dummyCompany[0]);
        let validAddCompany: any = [];
        for (let element of this.validAddCompanyDropdownList) {
            validAddCompany.push(element);
        }
        this.AddCompanyDropdownList = [];
        this.AddCompanyDropdownList = validAddCompany;

        var dummyAddCompany: any = [];
        this.AddCompTempArray = [];
        if (Object.values(data.AdditionalCompany)[0] != "" && Object.values(data.AdditionalCompany)[0] != undefined) {
            dummyAddCompany = Object.values(data.AdditionalCompany)[0];
            dummyAddCompany = dummyAddCompany.split(',');
            for (let element of this.AddCompanyDropdownList) {
                if (dummyAddCompany.indexOf(element.item_id) > -1) {
                    this.AddCompTempArray.push(element);
                }
            }
        }
        this.loadData.AddCompany = this.AddCompTempArray;
                
      //role for code
      var roleDa = [];
      if (Result.data.Users.Roles.Role.length == undefined) {
        roleDa = [Result.data.Users.Roles.Role];
      } else {
        roleDa = Result.data.Users.Roles.Role;
      }
      if (roleDa.length > 0) {
        this.TempArray = [];
        roleDa.forEach(({ RoleId, RoleName }) => {

          let data = this.DropdownList.find(ob => ob.item_id ===RoleId);
          if(data){
            this.TempArray.push({ "item_id": RoleId, "item_text": Object.values(RoleName)[0] })
          }          
        });
            
        this.loadData.Role = this.TempArray;
               
        this.cheackToplineReportingRole(this.TempArray);
        //this.ChkLSA(this.TempArray);
        //console.log(this.isToplineReportingRoles);

      }
      if (Result.data.Users.Regions != "" && this.isToplineReportingRoles) {
        if (Result.data.Users.Regions.Region.RegionId != undefined) {
          this.commaSepData = [];
          this.commaSepData=Object.values(Result.data.Users.Regions.Region.RegionId)[0];
           var dataRegio=this.commaSepData.split(',');
          //var dataRegio = Object.values(Result.data.Users.Regions.Region.RegionId)[0];
          //var dataRegio=  dataRegio.split(',');

          var index = 0;
          var dateRegioArray: any = this.RegionData;
          var dateNewObject = [];
          this.bodyData.GridFilters[0].GridConditions = [];
          for (let index = 0; index < dataRegio.length; index++) {
            var j = 0;
            for (let j = 0; j < dateRegioArray.length; j++) {
              if (dateRegioArray[j].item_id == dataRegio[index]) {
                if (dateNewObject.filter(x => x.item_id == dateRegioArray[j].item_id).length == 0) {
                  dateNewObject.push({ "item_id": dateRegioArray[j].item_id, "item_text": dateRegioArray[j].item_text });
                  this.pushGridCondition(dateRegioArray[j].item_text);
                }
              }
            }
          }

          this.loadData.Region = dateNewObject;
          await this.getCascadingDropdown("Division");
          // bind divison
          var dateNewObjectDivision = [];
          if (Object.values(data.Division)[0] != "" && Object.values(data.Division)[0] != undefined) {
            this.commaSepData = [];
            this.commaSepData = Object.values(data.Division)[0];
            this.commaSepData = this.commaSepData.split(',');
            var dateDivisionArray: any = this.DivisionData;
            for (let index = 0; index < this.commaSepData.length; index++) {
              for (let j = 0; j < dateDivisionArray.length; j++) {
                if (dateDivisionArray[j].item_id == this.commaSepData[index]) {
                  if (dateNewObjectDivision.filter(x => x.item_id == dateDivisionArray[j].item_id).length == 0) {
                    dateNewObjectDivision.push({ "item_id": dateDivisionArray[j].item_id, "item_text": dateDivisionArray[j].item_text });
                  }
                }
              }
            }
          }
          this.loadData.Division = dateNewObjectDivision;

          //End Division

          //Start bind branch
          this.bodyData.GridFilters[0].GridConditions = [];
          var dateNewObjectBranch = [];
          if (dateNewObjectDivision.length > 0) {
            dateNewObjectDivision.forEach(({ item_text }) => {
              this.pushGridCondition(item_text);
            });
            await this.getCascadingDropdown("Branch");

            if (Object.values(data.Branch)[0] != "" && Object.values(data.Branch)[0] != undefined) {
              this.commaSepData = [];
              this.commaSepData = Object.values(data.Branch)[0];
              this.commaSepData = this.commaSepData.split(',');
              var dateBranchArray: any = this.BranchData;
              //Resolved Raygun Error
              if (this.commaSepData && this.commaSepData.length > 0) {
                for (let index = 0; index < this.commaSepData.length; index++) {
                  if (dateBranchArray && dateBranchArray.length > 0) {
                    for (let j = 0; j < dateBranchArray.length; j++) {
                      if (dateBranchArray[j].item_id == this.commaSepData[index]) {
                        if (dateNewObjectBranch.filter(x => x.item_id == dateBranchArray[j].item_id).length == 0) {
                          dateNewObjectBranch.push({ "item_id": dateBranchArray[j].item_id, "item_text": dateBranchArray[j].item_text });
                        }
                      }
                    }
                  }
                }
              }             
            }
          }
          this.loadData.Branch = dateNewObjectBranch;
          // End Branch
          
           
          //start bind agency by nihal
              let dummyAgency:any=[]; 
              let patchAgency:any=[];
              if(Object.values(data.Agency)[0] != "" && Object.values(data.Agency)[0] != undefined)
              {
              dummyAgency = Object.values(data.Agency)[0];
              dummyAgency = dummyAgency.split(',');                                                     
              for(let element of this.AgencyData ){
              if(dummyAgency.indexOf(element.item_id)>-1){
                patchAgency.push(element);
              }
            }
          }
          //nihal
        this.loadData.Agency=patchAgency;
                           
          //end binding agency
        }
      }

      this.renderer.setAttribute(this.trvReportingManger.nativeElement, "datavalue", (Object.values(data.NameOfReportingManager)[0]).toString());



      var EmailP = [];
      if (Result.data.Users.EmailPreferences.EmailPreference.length == undefined) {
        EmailP = [Result.data.Users.EmailPreferences.EmailPreference];
      } else {
        EmailP = Result.data.Users.EmailPreferences.EmailPreference;
      }
      if (EmailP.length > 0) {
        this.TempArray = [];
        EmailP.forEach(({ ProcessTypeId, ProcessName, RoleId, RoleName, ProcessEmail, OBEEmail }) => {
          let data = this.DropdownList.find(ob => ob.item_id ===RoleId);
          if(data){
            this.TempArray.push({ "ProcessTypeId": ProcessTypeId, "RoleId": RoleId, "Process_Name": Object.values(ProcessName)[0], "Role_Name": Object.values(RoleName)[0], "Process_Email": Object.values(ProcessEmail)[0] == "checked" ? true : false, "OBE_Email": OBEEmail == "checked" ? true : false })
          }            
        });
        this.loadEmailPreferences.EmailPreferences = this.TempArray;
        this.UpdateEmailPreferences();
      }

      var altUs = [];
      if (Result.data.Users.AlternateUsers.AltUser.length == undefined) {
        altUs = [Result.data.Users.AlternateUsers.AltUser];
      } else {
        altUs = Result.data.Users.AlternateUsers.AltUser;
      }

      if (altUs.length > 0) {
        this.TempArray = [];
        altUs.forEach(({ RoleId, RoleName, AlternatUserId, AlternatUserName, email }) => {
          this.TempArray.push({ "email": email, "AlternatUserId": AlternatUserId, "MyRole": Object.values(RoleName)[0], "User_Name": AlternatUserName, "Role_Id": RoleId, "Edit": false })
        });
        this.loadRole_List.Role_List = this.TempArray;
        this.UpdateRole_List();
      }

      if (this.isDisabled) {
        // this.UserDetails.get('Wool_Store').disable();
        // this.UserDetails.get('Agency').disable();
        this.UserDetails.get('Access_Permission').disable();
        this.UserDetails.get('Title_of_the_Employee').disable();
        this.UserDetails.get('Name_of_the_Reporting_Manager').disable();
        this.UserDetails.get('Employee_type').disable();
        // if(this.isLSARoles){
        // this.UserDetails.get('Classified').disable();
        // this.UserDetails.get('BidAndOffer').disable();
        // }
        if(this.isToplineReportingRoles) {
          const divisionElement: HTMLElement = document.getElementById('Division') as HTMLElement;
          if (divisionElement) {
            divisionElement.click();
          }
        }
      }

      this.patchValueMethod();
      let element: HTMLElement = document.getElementById('Title_of_the_Employee') as HTMLElement;
      element.click();
    } else if (Result.message == "" || Result.message == null) {
      this.msg.showMessage('Fail', { body: "GetUserDetails failed due to an internal server error." });
    }
    else {
      this.msg.showMessage('Fail', { body: Result.message });
    }
  }



 
  
  async EditData() {
    if (this.UID == "myprofile=user") {
      this.data = {
          "UserName": Encryption(this.userDetail.UserName)
         //"UserName": Encryption(JSON.parse(localStorage.currentUser).UserName)
      }
    }
    else {
      this.data = {
       //"UserName": this.UID
        "UserName": Encryption(this.UID)
      }
    }
    // get edit data 
    await this.userService.GetUserDetails('user/GetUserDetails', this.data).then((Result) => {
      if (Result) {
        this.GetUserDetails(Result);
      }
    }, error => {
      this.msg.showMessage('Fail', { body: error.message });
    });
  }


  patchValueMethod() {
    this.UserDetails.patchValue({
      Access_Permission: this.loadData.Access_Permission,
      User_Name: this.loadData.User_Name,
      Password: this.loadData.Password,
      Confirm_Password: this.loadData.Confirm_Password,
      Email: this.loadData.Email,
      First_Name: this.loadData.First_Name,
      Middle_Initial: this.loadData.Middle_Initial,
      Last_Name: this.loadData.Last_Name,
      Title_of_the_Employee: this.loadData.Title_of_the_Employee,
      //Branch: this.loadData.Branch,
      //Agency: this.loadData.Agency,
      //Agency: '70000070,70000767,70000777',
      Name_of_the_Reporting_Manager: this.loadData.Name_of_the_Reporting_Manager,
     // Wool_Store: this.loadData.Wool_Store,
      // SAP_Number: this.loadData.SAP_Number,
        Role: this.loadData.Role,
        Company: this.loadData.Company,
        AddCompany: this.loadData.AddCompany,
     // Region: this.loadData.Region,
      Mobile: {
        Mobile_1: this.loadData.Mobile.Mobile_1,
        Mobile_2: this.loadData.Mobile.Mobile_2,
      },
      Phone: {
        Phone_1: this.loadData.Phone.Phone_1,
        Phone_2: this.loadData.Phone.Phone_2
      },
      Employee_type: this.loadData.Employee_type,
     // Division: this.loadData.Division,
      Out_of_Office: this.loadData.Out_of_Office,
      OutFrom: this.loadData.OutFrom,
      OutUntil: this.loadData.OutUntil,
      Pic_Name: this.loadData.Pic_Name,
      //Classified:this.loadData.Classified,
     // BidAndOffer:this.loadData.BidAndOffer
    });

    if(this.isToplineReportingRoles){
   // if (this.IsBranchShow ) {
      this.UserDetails.patchValue({ Branch: this.loadData.Branch });
   // }
  //  if(!this.IsBranchShow ){
      this.UserDetails.patchValue({ Agency: this.loadData.Agency });
   // }
  }
    if(this.isToplineReportingRoles)
    {
      this.UserDetails.patchValue({  Region: this.loadData.Region }); 
      this.UserDetails.patchValue({  Division:this.loadData.Division });   
    }   
  }


  // this function bind blank data for new user 
  bindEmptyData() {
    // Bind data for add new users
    this.loadData =
    {
      "UserId": "0",
      "Access_Permission": "Landmark_SSO",
      "User_Name": "",
      "Password": "",
      "Confirm_Password": "",
      "Email": "",
      "First_Name": "",
      "Mobile": { "Mobile_1": "", "Mobile_2": "" },
      "Middle_Initial": "",
      "Phone": { "Phone_1": "", "Phone_2": "" },
      "Employee_type": "",
      "Division": "",
      "Branch": "",
      "Agency": "",
      "Company": [],
      "AddCompany": [],
      "Role": [],
      "Region": [],
      "Last_Name": "",
      "Title_of_the_Employee": "",
      // "SAP_Number": "",
     // "Wool_Store": "",
      "Name_of_the_Reporting_Manager": "",
      "Out_of_Office": "",
      "OutFrom": "",
      "OutUntil": "",
      "Pic_Name": "",
      //"Classified":false,
      //"BidAndOffer":false
    };

    this.loadEmailPreferences =
    {
      "EmailPreferences": [

      ]
    };

    this.loadRole_List = {
      "Role_List": [
      ]
      }
      this.loadCompany_List = {
          "Company_List": [
          ]
      }
      this.AddloadCompany_List = {
          "AddCompany_List": [
          ]
      }
  }

  GetRoleList(Result: any) {
    if (Result) {
      
      if (Result.code == "200") {
        var vRoleTemp = [];
        if (Result.data.UserRoleInfo.PolicyInfo.length == undefined) {
          vRoleTemp = [Result.data.UserRoleInfo.PolicyInfo];
        }
        else {
          vRoleTemp = Result.data.UserRoleInfo.PolicyInfo;
        }
        if (vRoleTemp.length > 0) {
          vRoleTemp.forEach(({ item_id, item_text }) => {
            this.DropdownList.push({ "item_id": item_id, "item_text": Object.values(item_text)[0] });
          });
        }
      }
      else if (Result.message == "" || Result.message == null) {
        this.msg.showMessage('Fail', { body: "GetRoleList failed due to an internal server error." });
      }
      else if (Result.code != "3035") {
        this.msg.showMessage('Fail', { body: Result.message });
      }
    }
  }
  GetDropdownDetails(Result: any) {
    if (Result) {
      if (Result.code == "200") {
        // this.DivisionData = Result.data.DataInfo.List.filter(x => x.TYPE == "846")//Division
        //this.SAPData = Result.data.DataInfo.List.filter(x => x.TYPE == "865")//SAP
        //this.BranchData = Result.data.DataInfo.List.filter(x => x.TYPE == "854")//branch

        //nihal
        this.AgencyData = this.addSpaceInDropText(Result.data.DataInfo.List.filter(x => x.TYPE == "855"))//Agency
        this.CompanyDropdownList = this.addSpaceInDropText(Result.data.DataInfo.List.filter(x => x.TYPE == "934"))//Company       
        this.AddCompanyDropdownList = this.addSpaceInDropText(Result.data.DataInfo.List.filter(x => x.TYPE == "934"))//Additional Company       
        //this.WoolStoreData = Result.data.DataInfo.List.filter(x => x.TYPE == "913")//wool store
        this.RegionData = this.addSpaceInDropText(Result.data.DataInfo.List.filter(x => x.TYPE == "845" && x.item_id != 'All'))//region data
      } else if (Result.message == "" || Result.message == null) {
        this.msg.showMessage('Fail', { body: "GetDropdownDetails failed due to an internal server error." });
      }
      else if (Result.code != "3035") {
        this.msg.showMessage('Fail', { body: Result.message });
      }
    }
  }

  // Add space in text where item_id and item_text are same
    addSpaceInDropText(data: any) {        
        if (data.length && data.length > 0) {
            data.forEach((currentValue, index) => {
                if (currentValue.item_id == currentValue.item_text) {
                    data[index] = { item_id: currentValue.item_id, item_text: currentValue.item_text + " " }
                }
            });
            return data;
        }
    }

  async PageLoadMethod() {       
      if (this.UID == "myprofile=user") {
          this.UserDetails.get('Email').disable();
          this.UserDetails.get('Mobile').disable();
          this.UserDetails.get('First_Name').disable();
          this.UserDetails.get('Phone').disable();
          this.UserDetails.get('Middle_Initial').disable();
          this.UserDetails.get('Last_Name').disable();
          this.UserDetails.get('OutFrom').disable();
          this.UserDetails.get('OutUntil').disable();
          this.UserDetails.get('Out_of_Office').disable();
          this.isdisableDiv = true;
          this.isBtnHide = true;
      }

    // Bind Role Dropdown    
    this.data = {
      "UserId": this.userDetail.UserID,
      "AccessToken": this.userDetail.token,
      "PolicyBundleId": environment.Setting.PolicyBundleId1,
    }

    await this.userService.GetRoleList('GetRoleList', this.data).then((Result) => {
      this.GetRoleList(Result);
    }, error => {
      this.msg.showMessage('Fail', { body: error });
    });
      //Bind Dropdown for region and division and SAP and branch and agency      
      this.data = {
          "CompanyIDs": this.CompanyID.toString()
      }
      await this.userService.GetDropdownDetails('user/GetDropdownDetailsWithCompany', this.data).then((Result) => {          
        this.GetDropdownDetails(Result)
    },
      error => {
        this.msg.showMessage('Fail', { body: error.message });
      });

  }

  ngAfterViewInit() {

  }
  restricateChar(event):boolean{
    const charCode = (event.which) ? event.which : event.keyCode;
    if(charCode==39){
    return false;
  }
    return true;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

    restricateUserNameChar(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode == 39 || charCode == 45) {
            return false;
        }
        return true;
    }

  ResetForm() {
    this.IsSubmit = false;
    if (this.UID == "") {
      this.bindEmptyData();
    }
    if (this.UID != "myprofile=user") {
      this.trvRoleDropdwon.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
    }
    if (this.UID != "") {
      this.renderer.setAttribute(this.trvReportingManger.nativeElement, "datavalue", this.loadData.Name_of_the_Reporting_Manager);
      this.UpdateEmailPreferences();
    }

    if(this.isToplineReportingRoles){
    this.trvRegionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
    this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
    this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
    //this.trvAgencyDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";

    }
    this.afterCroped = undefined;
    this.patchValueMethod();
  }

  // convenience getter for easy access to form fields
  get f() { return this.UserDetails.controls; }


  getUploadFile(Result: any) {
    if (Result != "") {
      if (Result.code == "200") {
        this.ImgName = Result.message;
        this.IsFileUpload = true;
      }
      else if (Result.message == "" || Result.message == null) {
        this.msg.showMessage('Fail', { body: "UploadUserProfileImage failed due to an internal server error." });
      }
      else {
        this.msg.showMessage('Fail', { body: Result.message });
      }
    }
  }



  async UploadFile() {
    this.ImgName = "";
    const formData = new FormData();
    formData.append('uploadFile', this.afterCroped.file, this.imageChangedEvent.target.files[0].name);
    formData.append('oldImg', this.UserDetails.get('Pic_Name').value);
    //formData.append('accesstoken', localStorage.getItem('AccessToken'));
    formData.append('accesstoken', this.userDetail.token);
    await this.userService.UploadFile('/v1/fileUploader/UploadUserProfileImage', formData).then(Result => {
      this.transform.scale = 1;
      return this.getUploadFile(Result);
    }, error => {
      this.msg.showMessage('Fail', { body: error });
    });
  }

  async submit() {
    this.IsSubmit = true;
    if(this.UID=='')
    {
      if(!this.showpwd){
        this.UserDetails.get('Password').patchValue('Plasma@123');
        this.UserDetails.get('Password').updateValueAndValidity();
        this.UserDetails.get('Confirm_Password').patchValue('Plasma@123');
        this.UserDetails.get('Confirm_Password').updateValueAndValidity();
      }
    }
    
    if(!this.isToplineReportingRoles){
      this.UserDetails.get('Agency').clearValidators();
      this.UserDetails.get('Branch').clearValidators();
      this.UserDetails.get('Region').clearValidators();
      this.UserDetails.get('Division').clearValidators();
      this.UserDetails.get('Region').updateValueAndValidity;
      this.UserDetails.get('Division').updateValueAndValidity();
      this.UserDetails.get('Agency').updateValueAndValidity();
      this.UserDetails.get('Branch').updateValueAndValidity();     
     // this.UserDetails.updateValueAndValidity();
    }
    var AlternateUser = "";
    if (this.UID != '' && this.f.Out_of_Office.value == 'op2') {
      this.UserDetails.get('Role_List').value.forEach(({ AlternatUserId, User_Name, Role_Id, email, MyRole }) => {
        if (Role_Id != undefined && (AlternatUserId != '0' && AlternatUserId != '' && User_Name != '')) {
          AlternateUser += (Role_Id + ',' + AlternatUserId + ',' + (User_Name).trim() + ',' + email + ',' + MyRole + ';');
        }
      });
      if (AlternateUser == "") {
        this.msg.showMessage('Fail', { body: 'Please enter valid alternative user for at least one role' });
        // this.showErrorMessage("Please enter valid alternative user for at least one role.", 'Oops!', 'Ok', null, false);
        return;
      }
    }
    if (this.f.Out_of_Office.value == 'op2' && this.UID != '') {
      var fromdate = this.UserDetails.get('OutFrom').value;
      var todate = this.UserDetails.get('OutUntil').value;
      if (this.UserDetails.get('OutUntil').value != "" && this.UserDetails.get('OutFrom').value != "") {

        if ((fromdate.day >= this.MaxDate.day && fromdate.month >= this.MaxDate.month && fromdate.year >= this.MaxDate.year)) {
          if (!(todate.day >= fromdate.day && todate.month >= fromdate.month && todate.year >= fromdate.year)) {
            this.UserDetails.get('OutUntil').setValidators(f => <any>{ notValid: true });
            this.UserDetails.patchValue({ OutUntil: this.UserDetails.get('OutUntil').value })
            this.UserDetails.updateValueAndValidity();
          } else {
            this.UserDetails.get('OutUntil').clearValidators();
            this.UserDetails.get('OutUntil').updateValueAndValidity();
            this.UserDetails.get('OutFrom').clearValidators();
            this.UserDetails.get('OutFrom').updateValueAndValidity();
          }
        } else {
          this.UserDetails.get('OutFrom').setValidators(f => <any>{ notValid: true });
          this.UserDetails.patchValue({ OutFrom: this.UserDetails.get('OutFrom').value })
          this.UserDetails.updateValueAndValidity();
        }
      }
    }
    if (this.trvReportingManger.nativeElement.attributes.datavalue.value == "" && this.UserDetails.get('Name_of_the_Reporting_Manager').value != "") {
      this.UserDetails.get('Name_of_the_Reporting_Manager').setValidators(f => <any>{ notValid: true });
      this.UserDetails.patchValue({ Name_of_the_Reporting_Manager: this.UserDetails.get('Name_of_the_Reporting_Manager').value })
      this.UserDetails.updateValueAndValidity();
    } else
      if (this.trvReportingManger.nativeElement.attributes.datavalue.value != "") {
        this.UserDetails.get('Name_of_the_Reporting_Manager').clearValidators();
        this.UserDetails.get('Name_of_the_Reporting_Manager').updateValueAndValidity();
      }

    if (this.UserDetails.get('Name_of_the_Reporting_Manager').value == "") {
      this.UserDetails.get('Name_of_the_Reporting_Manager').setValidators([Validators.required]);
      this.UserDetails.patchValue({ Name_of_the_Reporting_Manager: '' })
      this.UserDetails.updateValueAndValidity();
    }

    if (this.UID != "myprofile=user") {
      if (this.UserDetails.get('Role').value.length == 0) {
        this.trvRoleDropdwon.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
      } else {
        this.trvRoleDropdwon.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
      }
    }
    if(this.isToplineReportingRoles){
    if (this.UserDetails.get('Region').value.length == 0)
  {
      this.trvRegionDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
    } else {
      this.trvRegionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
    }
  }
  if(this.isToplineReportingRoles){
    if (this.UserDetails.get('Division').value != null) {
      if (this.UserDetails.get('Division').value.length == 0) {
        this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
      } else {
        this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
      }
    } else {
      this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
    }
  }

    if (this.isToplineReportingRoles) {
      if (this.UserDetails.get('Branch').value != null) {
        if (this.UserDetails.get('Branch').value.length == 0) {
          this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
        } else {
          this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
        }
      } else {
        this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
      }
    }
    if (this.isToplineReportingRoles) {
      // if (this.UserDetails.get('Agency').value != null) {
      //   if (this.UserDetails.get('Agency').value.length == 0) {
      //     this.trvAgencyDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
      //   } else {
      //     this.trvAgencyDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
      //   }
      // } else {
      //   this.trvAgencyDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
      // }
    }  

   //if(this.isToplineReportingRoles){

    // if (this.f.Employee_type.value == 'Landmark_Employee') {
    //   this.UserDetails.get('Agency').clearValidators();
    //   this.UserDetails.get('Agency').updateValueAndValidity();
    // } else if (this.f.Employee_type.value == 'Agent') {
    //   this.tempDataStore = [];
    //   this.tempDataStore = this.UserDetails.get('Branch').value;
    //   this.UserDetails.patchValue({ Branch: null });
    //   this.UserDetails.get('Branch').clearValidators();
    //   this.UserDetails.get('Branch').updateValueAndValidity();
    // }
  // }

    if (this.f.Out_of_Office.value == 'op1' || this.UID == '') {
      this.UserDetails.get('OutUntil').clearValidators();
      this.UserDetails.get('OutUntil').updateValueAndValidity();
      this.UserDetails.get('OutFrom').clearValidators();
      this.UserDetails.get('OutFrom').updateValueAndValidity();
    }

    if (this.UID != '') {
      this.UserDetails.get('Password').clearValidators();
      this.UserDetails.get('Password').updateValueAndValidity();
      this.UserDetails.get('Confirm_Password').clearValidators();
      this.UserDetails.get('Confirm_Password').updateValueAndValidity();
    }

    
    if (this.UserDetails.valid) {
      if (this.afterCroped !== undefined) {
        await this.UploadFile();
      } else {
        this.ImgName = this.UserDetails.get('Pic_Name').value;
      }

      this.RoleID = [];
      this.UserDetails.get('Role').value.forEach(({ item_id }) => {
        this.RoleID.push(item_id);
      });
                
        this.CompanyID = [];
        this.UserDetails.get('Company').value.forEach(({ item_id }) => {
            this.CompanyID.push(item_id);
        });

        if (this.CompanyID.length > 1) {
            const LMK_LiveStockSalesAgent_RoleID: any[] = (environment.Setting.LMK_LiveStockSalesAgent_RoleID).split(',');
            for (var role of this.RoleID) {
                if (LMK_LiveStockSalesAgent_RoleID.indexOf(role) > -1) {
                    this.msg.showMessage('Fail', { body: 'A Livestock Sales Agent can only be associated with one company' });
                    return;
                }
            }
        }

        this.AddCompanyID = [];
        this.UserDetails.get('AddCompany').value.forEach(({ item_id }) => {
            this.AddCompanyID.push(item_id);
        });

      if(this.isToplineReportingRoles)
      {
      var RegionID = [];
      this.UserDetails.get('Region').value.forEach(({ item_id }) => {
        RegionID.push(item_id);
      });
    }
   if(this.isToplineReportingRoles)
   {
      var divisionID = [];
      this.UserDetails.get('Division').value.forEach(({ item_id }) => {
        divisionID.push(item_id);
      });
    }
    
    if(this.isToplineReportingRoles)
    {
      var branchID = [];
      //if (this.IsBranchShow) {
        this.UserDetails.get('Branch').value.forEach(({ item_id }) => {
          branchID.push(item_id);
        });
     // }
    }
    if(this.isToplineReportingRoles)
   {
      var agencyID = [];
    //  if (!this.IsBranchShow) {
      if(this.UserDetails.get('Agency').value){
        this.UserDetails.get('Agency').value.forEach(({ item_id }) => {
          agencyID.push(item_id);
        });
      }
     // }
    }
     

      var Email_Pref = "";
      this.UserDetails.get('Email_Prefer').value.forEach(({ ProcessTypeId, RoleId, Process_Email, OBE_Email }) => {
        if (RoleId != undefined && (Process_Email == true || OBE_Email == true)) {
          Email_Pref += (ProcessTypeId + ',' + RoleId + ',' + Process_Email + ',' + OBE_Email) + ';'
        }
      });
    
      this.UpdateJson =
      {
        "UserId": this.loadData.UserId,
        "PolicyBundleId": environment.Setting.PolicyBundleId1,
        "GroupId": environment.Setting.GroupId1,
        "FirstName": (this.UserDetails.get('First_Name').value).trim(),
        "MiddleName": (this.UserDetails.get('Middle_Initial').value).trim(),
        "LastName": (this.UserDetails.get('Last_Name').value).trim(),
        "UserName": (this.UserDetails.get('User_Name').value).trim(),
        "EmailAddress": (this.UserDetails.get('Email').value).trim(),
        "Password": (this.UserDetails.get('Password').value).trim(),
        "IsDirectAccess": (this.UserDetails.get('Access_Permission').value).trim() == "Landmark_SSO" ? false : true,
        "TitleOfEmployee": (this.UserDetails.get('Title_of_the_Employee').value).trim(),
        "NameOfReportingManager": (this.UserDetails.get('Name_of_the_Reporting_Manager').value).trim(),
        //"WoolStore": (this.UserDetails.get('Wool_Store').value).trim(),
        "WoolStore": "",
        "SapNumber": "00000",
        "Designation": (this.UserDetails.get('Employee_type').value).trim(),
        "Region": this.isToplineReportingRoles?RegionID.join(','):"",
        "Division": this.isToplineReportingRoles?divisionID.join(','):"",
        //"Branch":(this.IsBranchShow && this.isToplineReportingRoles) == true ? branchID.join(','): "",
        //"Branch":this.isToplineReportingRoles?(this.IsBranchShow?(branchID.join(',')):""):"",
         "Branch":this.isToplineReportingRoles?(branchID.join(',')):"",
       // "Agency": this.IsBranchShow == false ? (this.UserDetails.get('Agency').value).trim() : "",
        //"Agency": (!this.IsBranchShow && this.isToplineReportingRoles) == false ? (agencyID.join(',')) : "",
        "Agency": this.isToplineReportingRoles ? (agencyID.join(',')) : "",
        "CompanyIDs": this.CompanyID.join(','),
        "AddCompanyIDs": this.AddCompanyID.join(','),
        "RoleIDs": Encryption(this.RoleID.join(',')),//this.RoleID.join(','),
        "MobileCountryCode": (this.UserDetails.get('Mobile.Mobile_1').value).trim(),
        "MobileNumber": (this.UserDetails.get('Mobile.Mobile_2').value).trim(),
        "PhoneCountryCode": (this.UserDetails.get('Phone.Phone_1').value).trim(),
        "PhoneNumber": (this.UserDetails.get('Phone.Phone_2').value).trim(),
        "Photo": this.ImgName,
        "EmailPref": Email_Pref,
        "InOutStatus": (this.UserDetails.get('Out_of_Office').value).trim() == "op2" ? true : false,
        "OutFrom": this.UserDetails.get('OutFrom').value != "" ? this.dateFormatForAPI(this.UserDetails.get('OutFrom').value) : null,
        "OutTill": this.UserDetails.get('OutUntil').value != "" ? this.dateFormatForAPI(this.UserDetails.get('OutUntil').value) : null,
        "AlternateUser": AlternateUser,
        "CreatedBy": this.userDetail.UserID,
        "ModifiedBy": this.userDetail.UserID,
      //  "Classified":this.isLSARoles?this.UserDetails.get('Classified').value:false,
     //   "BidAndOffer":this.isLSARoles?this.UserDetails.get('BidAndOffer').value:false
      };
      if (this.UID == "") {
         this.userService.AddUpdateUser('user/AddUser', this.UpdateJson).subscribe((Result) => {
         this.afterSucess(Result);
         }, (error) => {
           this.msg.showMessage('Fail', { body: error.message });
         });
      }
      else {
        this.userService.AddUpdateUser('user/UpdateUser', this.UpdateJson).subscribe((Result) => {
          if (Result) {
            if (Result.status == "SUCCESS") {
              this.IsSubmit = false;
              let element: HTMLElement = document.getElementById('Title_of_the_Employee') as HTMLElement;
              element.click();
              this.toastr.success('Update successfully.');
             }
             else if (Result.message == "" || Result.message == null) {
              this.msg.showMessage('Fail', { body: "UpdateUser failed due to an internal server error." });
            } else {
              this.msg.showMessage('Fail', { body: Result.message });
             }
           }
         }, error => {
           this.msg.showMessage('Fail', { body: error.message });
         });
      }
    }
  }


afterSucess(Result: any) {
    if (Result) {
      if (Result.status == "SUCCESS") {
        this.IsSubmit = false;
        this.bindEmptyData();
        this.renderer.setAttribute(this.trvReportingManger.nativeElement, "datavalue", "");
        if(this.isToplineReportingRoles){
        this.trvRegionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
        this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
       // if (this.IsBranchShow) {
          if (this.UserDetails.get('Branch').value != null) {
            this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
          }
       // } 
        }
        this.trvRoleDropdwon.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
        this.afterCroped = undefined;
        this.patchValueMethod();
        let element: HTMLElement = document.getElementById('Title_of_the_Employee') as HTMLElement;
        element.click();
        this.toastr.success('Save successfully.');
      }
      else if (Result.message == "" || Result.message == null) {
        this.msg.showMessage('Fail', { body: "AddUser failed due to an internal server error." });
      }
      else {
        this.msg.showMessage('Fail', { body: Result.message });
      }
    }
  }



  changeDateFormatIntoCurrentFormat(dateobj) {
    if (dateobj == "") {
      dateobj = this.currentDate;
    }
    if (dateobj != "") {
      const dateParts = dateobj.trim().split('/');
      if (environment.Setting.dateFormat == 'dd/MM/yyyy') {
        return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];
      } else if (environment.Setting.dateFormat == 'MM/dd/yyyy') {
        return dateParts[0] + '/' + dateParts[1] + '/' + dateParts[2];
      }
    }
  }


  getStartDate(dateobj) {
    if (dateobj != undefined) {
      this.UserDetails.patchValue({
        OutFrom: this.ngbDateFRParserFormatter.parse(this.getDateFormat(dateobj))
      });
    }
  }

  getendDate(dateobj) {
    if (dateobj != undefined) {
      this.UserDetails.patchValue({
        OutUntil: this.ngbDateFRParserFormatter.parse(this.getDateFormat(dateobj))
      });
    }
  }

  getDateFormat(dateobj): any {
    if (environment.Setting.dateFormat == 'dd/MM/yyyy') {
      const sDay = dateobj.day;
      const sMonth = dateobj.month;
      const sYear = dateobj.year;
      return sDay + '/' + sMonth + '/' + sYear;
    } else if (environment.Setting.dateFormat == 'MM/dd/yyyy') {
      const sDay = dateobj.day;
      const sMonth = dateobj.month;
      const sYear = dateobj.year;
      return sMonth + '/' + sDay + '/' + sYear;
    }
  }



  dateFormatForAPI(dateobj): any {
    const sDay = dateobj.day;
    const sMonth = dateobj.month;
    const sYear = dateobj.year;
    return sMonth + '/' + sDay + '/' + sYear;
  }


  radio(value) {
    if (value === 'op2') { this.UserDetails.controls["OutFrom"].setValidators([Validators.required]); }
    if (value === 'op2') { this.UserDetails.controls["OutUntil"].setValidators([Validators.required]); }
    this.UserDetails.patchValue({ OutFrom: this.UserDetails.controls["OutFrom"].value })
    this.UserDetails.patchValue({ OutUntil: this.UserDetails.controls["OutUntil"].value })
    this.UserDetails.updateValueAndValidity();
  }

  async Employee_typeRadio(value) {
    if(this.isToplineReportingRoles){
     // if (value === 'Landmark_Employee') {
     //   if (this.IsBranchShow == false) {
         // this.IsBranchShow = true;
          var selectedBranch;
  
          if (this.tempDataStore != undefined && this.tempDataStore != null && this.tempDataStore != "" && this.IsSubmit) {
            selectedBranch = this.tempDataStore;
          } else {
            selectedBranch = this.UserDetails.get('Branch').value;
          }
  
          this.bodyData.GridFilters[0].GridConditions = [];
          if (this.UserDetails.get('Division').value != null) {
            if (this.UserDetails.get('Division').value.length > 0) {
              this.UserDetails.get('Division').value.forEach(({ item_text }) => {
                this.pushGridCondition(item_text);
              });
              await this.getCascadingDropdown("Branch");
            }
          }
          this.UserDetails.patchValue({ Branch: this.getSelectedValues(selectedBranch, this.BranchData) });
      //  }
  
        this.UserDetails.controls["Branch"].setValidators([Validators.required]);
        this.UserDetails.patchValue({ Branch: this.UserDetails.controls["Branch"].value });
        this.UserDetails.updateValueAndValidity();
    //  } else {
        //this.IsBranchShow = false;
        //this.UserDetails.controls["Agency"].setValidators([Validators.required]);
        this.UserDetails.patchValue({ Agency: this.UserDetails.controls["Agency"].value });
        this.UserDetails.updateValueAndValidity();
     // }
    }
    else{
      this.UserDetails.controls["Branch"].clearValidators();
      this.UserDetails.controls["Agency"].clearValidators();
      this.UserDetails.controls["Branch"].updateValueAndValidity();
      this.UserDetails.controls["Agency"].updateValueAndValidity();
      //this.UserDetails.updateValueAndValidity();
    }
    
  }

  async ngOnInit(): Promise<void> {
    
    await this.PageLoadMethod();
    this.RoleDropdownList = this.DropdownList;
    if(!this.isDisabled){
    this.UserDetails.get('Role').valueChanges.subscribe((value) => this.cheackToplineReportingRole(value))
    //this.UserDetails.get('Role').valueChanges.subscribe((value) => this.ChkLSA(value))
    }
    if (this.UID != "") {
      this.EditData();
    }   
    this.UserDetails.get('Access_Permission').valueChanges.subscribe((val)=>{
     if(this.UID==''){
      if(val=='Landmark_SSO')
      {
        this.showpwd=false;
          this.UserDetails.get('Password').clearValidators();
         //this.UserDetails.get('Password').patchValue('Plasma@123');
         this.UserDetails.get('Password').updateValueAndValidity();
       
         this.UserDetails.get('Confirm_Password').clearValidators();
         this.UserDetails.get('Confirm_Password').updateValueAndValidity();
      }
      else{
        this.showpwd=true;
         this.UserDetails.controls["Password"].setValidators([Validators.required,PasswordStrengthValidator]);
         this.UserDetails.controls["Confirm_Password"].setValidators([Validators.required]);
         this.UserDetails.get('Confirm_Password').updateValueAndValidity();
         this.UserDetails.get('Password').updateValueAndValidity();
      }
     }
     
    })

    this.UserDetails.get('Out_of_Office').valueChanges.subscribe((value) => this.radio(value));

    this.UserDetails.get('Employee_type').valueChanges.subscribe((value) => this.Employee_typeRadio(value));



    this.UserDetails.get('Name_of_the_Reporting_Manager').valueChanges.pipe(debounceTime(600), distinctUntilChanged()).subscribe(searchText => {
      if (searchText != undefined) {
        if (this.trvReportingManger.nativeElement.attributes.datavalue.value != searchText) {
          if (searchText != "") {
            this.renderer.setAttribute(this.trvReportingManger.nativeElement, "datavalue", "")
            this.GetUserByGroupID(searchText);
            this.UserDetails.get('Name_of_the_Reporting_Manager').setValidators(f => <any>{ notValid: true });
            this.UserDetails.patchValue({ Name_of_the_Reporting_Manager: this.UserDetails.get('Name_of_the_Reporting_Manager').value })
            this.UserDetails.updateValueAndValidity();
          }
        }
      }
    });

    if (this.UID != 'myprofile=user') {
      this.UserDetails.get('Role').valueChanges.subscribe((value) => {
        if (value.length == 0 && this.IsSubmit) {
          this.trvRoleDropdwon.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
        } else {
          this.trvRoleDropdwon.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
        }
      });
    }


      this.UserDetails.get('Region').valueChanges.subscribe((value) => {
          if (this.isToplineReportingRoles) {
              if (value) {
                  if (value.length == 0 && this.IsSubmit) {
                      this.trvRegionDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
                  } else {
                      this.trvRegionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
                  }
              }
          }
      });

    this.UserDetails.get('Division').valueChanges.subscribe((value) => {
      if (value != undefined && this.isToplineReportingRoles) {
        if (value.length == 0 && this.IsSubmit) {
          this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
        } else {
          this.trvDivisionDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
        }
      }
    });

   // if (this.IsBranchShow) {
      this.UserDetails.get('Branch').valueChanges.subscribe((value) => {
        if (value != undefined && this.isToplineReportingRoles) {
          if (value.length == 0 && this.IsSubmit) {
            this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
          } else {
            this.trvBranchDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
          }
        }
      });
   // }

   // if (!this.IsBranchShow) {
      this.UserDetails.get('Agency').valueChanges.subscribe((value) => {
        if (value != undefined && this.isToplineReportingRoles) {
          if (value.length == 0 && this.IsSubmit) {
            //this.trvAgencyDropdown.nativeElement.children[1].children[0].classList = "is-invalid multiselect-dropdown";
          } else {
           // this.trvAgencyDropdown.nativeElement.children[1].children[0].classList = "multiselect-dropdown";
          }
        }
      });
   // }


    // this.UserDetails.get('Phone.Phone_2').valueChanges.subscribe((value) => {
    //  if (value == "" && this.IsSubmit) {
    //  this.UserDetails.get('Phone.Phone_1').clearValidators();
    // this.UserDetails.get('Phone.Phone_1').updateValueAndValidity();
    //   } else {
    // this.UserDetails.get('Phone.Phone_1').setValidators([Validators.required]);
    //this.UserDetails.patchValue({ Phone: { Phone_1: '' } })
    // this.UserDetails.updateValueAndValidity();
    //   }
    //  });

      this.dropdownCompanySettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.setStatus();
   //add by  nihal
    
  }


  /* Load Email Preferences on change of role*/
  UpdateEmailPreferences() {
    this.UserDetails.removeControl('Email_Prefer');
    this.UserDetails.addControl('Email_Prefer', this.fb.array([]));
    this.PushEmailPreferencesList();

  }

  UpdateRole_List() {

    this.UserDetails.removeControl('Role_List');
    this.UserDetails.addControl('Role_List', this.fb.array([]));
    this.PushRole_List();
  }
  UpdateCompany_List() {
      this.UserDetails.removeControl('Company_List');
      this.UserDetails.addControl('Company_List', this.fb.array([]));
      this.PushCompany_List();
    }

   UpdateAddCompany_List() {
        this.UserDetails.removeControl('AddCompany_List');
        this.UserDetails.addControl('AddCompany_List', this.fb.array([]));
        this.PushAddCompany_List();
    }

  /* Push Email preferences into form array*/
  PushEmailPreferencesList() {
    this.loadEmailPreferences.EmailPreferences.forEach(element => {
      const _Row = this.UserDetails.controls.Email_Prefer as FormArray;
      _Row.push(this.fb.group({
        Process_Name: element.Process_Name,
        Role_Name: element.Role_Name,
        Process_Email: element.Process_Email,
        OBE_Email: element.OBE_Email,
        ProcessTypeId: element.ProcessTypeId,
        RoleId: element.RoleId,
      }));
    });
  }

  /* Push Role List into form array*/
  PushRole_List() {
    if (this.loadRole_List.Role_List.length > 0) {
      this.loadRole_List.Role_List.forEach(element => {
        const _Row = this.UserDetails.controls.Role_List as FormArray;
        _Row.push(this.fb.group({
          MyRole: element.MyRole,
          User_Name: element.User_Name,
          Role_Id: element.Role_Id,
          Edit: element.Edit,
          email: element.email,
          AlternatUserId: element.AlternatUserId,
        }));
      });
    }
  }

    /* Push Company List into form array*/
    PushCompany_List() {
        if (this.loadCompany_List.Company_List.length > 0) {           
            this.loadCompany_List.Company_List.forEach(element => {
                const _Row = this.UserDetails.controls.Company_List as FormArray;
                _Row.push(this.fb.group({
                    MyCompany: element.MyCompany,                   
                    Company_Id: element.Company_Id,                 
                }));
            });
        }
    }

    /* Push Additional Company List into form array*/
    PushAddCompany_List() {
        if (this.AddloadCompany_List.AddCompany_List.length > 0) {
            this.AddloadCompany_List.AddCompany_List.forEach(element => {
                const _Row = this.UserDetails.controls.AddCompany_List as FormArray;
                _Row.push(this.fb.group({
                    MyAddCompany: element.MyAddCompany,
                    AddCompany_Id: element.AddCompany_Id,
                }));
            });
        }
    }

  getPosts(text) {
    if(this.trvReportingManger && this.trvReportingManger.nativeElement !== undefined){
      if (text != undefined) {
        this.renderer.setAttribute(this.trvReportingManger.nativeElement, "datavalue", text)
        this.UserDetails.get('Name_of_the_Reporting_Manager').clearValidators();
        this.UserDetails.get('Name_of_the_Reporting_Manager').updateValueAndValidity();
      } else {
        this.renderer.setAttribute(this.trvReportingManger.nativeElement, "datavalue", "");
      }
    }
  }

  GetUserByGroupID(searchText) {
    if (searchText != "") {
      this.data = {
        "GroupId": this.userDetail.GroupId.toString(),
        "AccessToken": this.userDetail.token,
        "Sptype": "1",
        "SearchName": searchText
      }
      this.userService.getDataByBody('v1/GetUserByGroupID', this.data).subscribe((Result) => {
        if (Result) {
          if (Result.code == "200") {
            if (Result.data.DataInfo.ManageUsers.length == undefined) {
              this.getManagerByGroupId = [Result.data.DataInfo.ManageUsers];
            } else {
              this.getManagerByGroupId = Result.data.DataInfo.ManageUsers;
            }
          }
          else if (Result.code == "3035") {
            this.getManagerByGroupId = [];
          } else if (Result.message == "" || Result.message == null) {
            this.msg.showMessage('Fail', { body: "GetUserByGroupID failed due to an internal server error." });
          }
          else {
            this.msg.showMessage('Fail', { body: Result.message });
          }
        }
      }, error => {
        this.msg.showMessage('Fail', { body: error });
      });
    }
  }

  EditRole(Role_Id, FormType) {
    if (FormType == "Edit") {
      this.UpdateRowByRoleId(Role_Id, true, "")
    }
    else {
      this.data = {
        "GroupId": this.userDetail.GroupId.toString(),
        "AccessToken": this.userDetail.token,
        "Sptype": "2",
        "SearchName": this.Alternateusertext.nativeElement.value
      }
      this.userService.getDataByBody('v1/GetUserByGroupID', this.data).subscribe((Result) => {
        if (Result) {
          if (Result.code == "200") {
            if (Result.data.DataInfo.ManageUsers.UserID != "") {
              let myList = this.UserDetails.controls.Role_List.value;
              myList.find(item => item.Role_Id == Role_Id).email = Result.data.DataInfo.ManageUsers.UserEmail;
              myList.find(item => item.Role_Id == Role_Id).AlternatUserId = Result.data.DataInfo.ManageUsers.UserID;
              this.UserDetails.patchValue({
                Role_List: myList
              });
              this.UpdateRowByRoleId(Role_Id, false, "");
            } else {
              this.msg.showMessage('Fail', { body: 'User doesn\'t exist' });
            }
          }
          else if (Result.code == "3035") {
            this.msg.showMessage('Fail', { body: `User doesn't exist` });
          } else if (Result.message == "" || Result.message == null) {
            this.msg.showMessage('Fail', { body: "GetUserByGroupID failed due to an internal server error." });
          }
          else {
            this.msg.showMessage('Fail', { body: Result.message });
          }
        }
      }, error => {
        this.msg.showMessage('Fail', { body: error });
      });
    }
  }

  CancelRow(Role_Id) {
    this.UpdateRowByRoleId(Role_Id, false, "Cancel")
  }

  UpdateRowByRoleId(Role_Id, Status, Type) {
    let PreList = this.loadRole_List.Role_List;
    PreList = PreList.find(x => x.Role_Id == Role_Id)

    let myList = this.UserDetails.controls.Role_List.value;
    myList.find(item => item.Role_Id == Role_Id).Edit = Status;

    if (Type == "Cancel") {
      myList.find(item => item.Role_Id == Role_Id).User_Name = PreList.User_Name;
    } else {
      PreList.User_Name = myList.find(item => item.Role_Id == Role_Id).User_Name;
    }
    this.UserDetails.patchValue({
      Role_List: myList
    });
  }

  getEmailPref(RoleIDs: string) {
    this.data = {
      "UserId": this.loadData.UserId,//JSON.parse(localStorage.currentUser).UserId,
      "AccessToken": this.userDetail.token,
      "RoleIDs": RoleIDs,
    }
    this.userService.getDataByBody('v1/GetEmailPreferences', this.data).subscribe((Result) => {
      if (Result) {
        if (Result.code == "200") {
          if (Result.data.root.UserEmailPref.EmailPreference.length == undefined) {
            this.loadEmailPreferences = [Result.data.root.UserEmailPref.EmailPreference];
          } else {
            this.loadEmailPreferences = Result.data.root.UserEmailPref.EmailPreference;
          }
          this.TempArray = [];
          this.loadEmailPreferences.forEach(({ ProcessTypeId, ProcessName, RoleId, RoleName, IsProcessChecked, IsOBEChecked }) => {
            if (this.UID == '') {
              this.TempArray.push({ "ProcessTypeId": ProcessTypeId, "RoleId": RoleId, "Process_Name": Object.values(ProcessName)[0], "Role_Name": Object.values(RoleName)[0], "Process_Email": true, "OBE_Email": true })
            } else {
              this.TempArray.push({ "ProcessTypeId": ProcessTypeId, "RoleId": RoleId, "Process_Name": Object.values(ProcessName)[0], "Role_Name": Object.values(RoleName)[0], "Process_Email": IsProcessChecked == "True" ? true : false, "OBE_Email": IsOBEChecked == "True" ? true : false })
            }
          })
          this.loadEmailPreferences =
          {
            "EmailPreferences": this.TempArray
          };
          this.UpdateEmailPreferences();
        }
        else if (Result.code == "300") {
          this.loadEmailPreferences =
          {
            "EmailPreferences": []
          };
          this.UpdateEmailPreferences();
          //this.msg.showMessage('Fail', {body: Result.message});
        }
        else if (Result.message == "" || Result.message == null) {
          this.msg.showMessage('Fail', { body: "GetEmailPreferences failed due to an internal server error." });
        }
        else {
          this.msg.showMessage('Fail', { body: Result.message });
        }
      }
    }, error => {
      this.msg.showMessage('Fail', { body: error });
    });
  }


  GetAlternateUserOutOfficeList(RoleIDs: string) {
    this.data = {
      "UserId": this.userDetail.UserID,
      "AccessToken": this.userDetail.token,
      "RoleIDs": RoleIDs,
    }
    this.userService.getDataByBody('v1/GetAlternateUserOutOfficeList', this.data).subscribe((Result) => {
      if (Result) {
        if (Result.code == "200") {
          if (Result.data.root.AlternateUsers.AltUser.length == undefined) {
            this.loadRole_List = [Result.data.root.AlternateUsers.AltUser];
          } else {
            this.loadRole_List = Result.data.root.AlternateUsers.AltUser;
          }
          this.TempArray = [];
          this.loadRole_List.forEach(({ RoleId, RoleName, AlternatUserId, AlternatUserName, email }) => {
            this.TempArray.push({ "email": Object.values(email)[0], "AlternatUserId": AlternatUserId, "MyRole": Object.values(RoleName)[0], "User_Name": Object.values(AlternatUserName)[0], "Role_Id": RoleId, "Edit": false })
          })
          this.loadRole_List = {
            "Role_List": this.TempArray
          }
          this.UpdateRole_List();
        }
        else if (Result.code == "300") {
          this.loadRole_List = {
            "Role_List": []
          }
          this.UpdateRole_List();
          //this.msg.showMessage('Fail', {body: Result.message});
        }
        else if (Result.message == "" || Result.message == null) {
          this.msg.showMessage('Fail', { body: "GetAlternateUserOutOfficeList failed due to an internal server error." });
        }
        else {
          this.msg.showMessage('Fail', { body: Result.message });
        }
      }
    }, error => {
      this.msg.showMessage('Fail', { body: error });
    });
  }

  setStatus() {
    (this.selectedItems.length > 0) ? this.requiredField = true : this.requiredField = false;
  }

  getSelectedValues(SelectedValue, DataSource) {
    if (SelectedValue != null && SelectedValue != undefined && SelectedValue != "") {
      if (DataSource != null && DataSource != undefined && DataSource != "") {
        var newSelectedValues = [];
        SelectedValue.forEach(({ item_id, item_text }) => {
          if (DataSource.filter(x => x.item_id == item_id).length > 0) {
            newSelectedValues.push({ "item_id": item_id, "item_text": item_text });
          }
        });
        return newSelectedValues;
      }
    }
  }

  async onItemDeSelect(type: string, item: any) {
    if (type == "Role") {
      this.loadEmailPreferences =
      {
        "EmailPreferences": this.loadEmailPreferences.EmailPreferences.filter(x => x.RoleId != item.item_id)
      };
      this.UpdateEmailPreferences();
      this.loadRole_List = {
        "Role_List": this.loadRole_List.Role_List.filter(x => x.Role_Id != item.item_id)
      }
      this.UpdateRole_List()
    }
    else if (type == "Company") {        
        this.loadCompany_List = {
            "Company_List": this.loadCompany_List.Company_List.filter(x => x.Company_Id != item.item_id)
        }
        this.UpdateCompany_List()

        this.AddCompanyDropdownList = this.CompanyDropdownList;
        
        await this.bindRegionWithCompanyCode("");
    }
    else if (type == "AddCompany") {
        this.AddloadCompany_List = {
            "AddCompany_List": this.AddloadCompany_List.AddCompany_List.filter(x => x.AddCompany_Id != item.item_id)
        }
        this.UpdateAddCompany_List()
    }
    else if (type == "Region") {
      var selectedBranch = this.UserDetails.get('Branch').value;
      var selectedDivision = this.UserDetails.get('Division').value;
      this.BranchData = [];
      this.DivisionData = [];
      this.UserDetails.patchValue({ Division: null });
      this.UserDetails.patchValue({ Branch: null });
      this.UserDetails.updateValueAndValidity();
      this.bodyData.GridFilters[0].GridConditions = [];
      if (this.UserDetails.get('Region').value != null) {
        if (this.UserDetails.get('Region').value.length > 0) {
          this.UserDetails.get('Region').value.forEach(({ item_text }) => {
            this.pushGridCondition(item_text);
          });
          await this.getCascadingDropdown("Division");
          this.UserDetails.patchValue({ Division: this.getSelectedValues(selectedDivision, this.DivisionData) });
        }
      }
      this.bodyData.GridFilters[0].GridConditions = [];
      if (this.UserDetails.get('Division').value != null) {
        if (this.UserDetails.get('Division').value.length > 0) {
          this.UserDetails.get('Division').value.forEach(({ item_text }) => {
            this.pushGridCondition(item_text);
          });
          await this.getCascadingDropdown("Branch");
          this.UserDetails.patchValue({ Branch: this.getSelectedValues(selectedBranch, this.BranchData) });
        }
      }
    }
    else if (type == "Division") {
     // if (this.IsBranchShow) {
        var selectedBranch = this.UserDetails.get('Branch').value;
        this.BranchData = [];
        this.UserDetails.patchValue({ Branch: null })
        this.UserDetails.updateValueAndValidity();
        this.bodyData.GridFilters[0].GridConditions = [];
        if (this.UserDetails.get('Division').value != null) {
          if (this.UserDetails.get('Division').value.length > 0) {
            this.UserDetails.get('Division').value.forEach(({ item_text }) => {
              this.pushGridCondition(item_text);
            });
            await this.getCascadingDropdown("Branch");
            this.UserDetails.patchValue({ Branch: this.getSelectedValues(selectedBranch, this.BranchData) });
          }
        }
     // }
    }

    this.setClass();
  }

    async bindRegionWithCompanyCode(CompanyIDs: string) {        
        this.data = {
            "CompanyIDs": CompanyIDs
        }
        await this.userService.GetDropdownDetails('user/GetDropdownDetailsWithCompany', this.data).then((Result) => {
            this.GetDropdownDetails(Result)
        },
            error => {
                this.msg.showMessage('Fail', { body: error.message });
            });
    }

  async onItemSelect(type: string, item: any) {
    
    if (type == "Role") {
          
      this.RoleID = [];
      this.UserDetails.get('Role').value.forEach(({ item_id }) => {
        this.RoleID.push(item_id);
      });
      this.getEmailPref(this.RoleID.join(','));
      this.loadRole_List.Role_List.push({ "email": "", "AlternatUserId": "0", "MyRole": item.item_text, "User_Name": "", "Role_Id": item.item_id, "Edit": false })
      this.UpdateRole_List()
    }
    else if (type == "Company") {
        this.UserDetails.get('Region').reset();
        this.UserDetails.get('Division').reset();
        this.UserDetails.get('Branch').reset();
        this.UserDetails.get('Agency').reset();
        this.UserDetails.updateValueAndValidity();

        this.CompanyID = [];
        this.UserDetails.get('Company').value.forEach(({ item_id }) => {
            this.CompanyID.push(item_id);
        });
        
        await this.bindRegionWithCompanyCode(this.CompanyID.toString());
        
        this.loadCompany_List.Company_List.push({"MyCompany": item.item_text, "Company_Id": item.item_id})
        this.UpdateCompany_List()

        this.validAddCompanyDropdownList = this.CompanyDropdownList.filter(x => x.item_id != item.item_id);
        let validAddCompany: any = [];
        for (let element of this.validAddCompanyDropdownList) {
            validAddCompany.push(element);
        }
        this.AddCompanyDropdownList = [];
        this.AddCompanyDropdownList = validAddCompany;
        this.validAddCompTempArray = this.AddCompTempArray.filter(x => x.item_id != item.item_id);       
        this.loadData.AddCompany = this.validAddCompTempArray;        
        this.UserDetails.get("AddCompany").patchValue(this.validAddCompTempArray);
        this.UserDetails.updateValueAndValidity();
    }
    else if (type == "AddCompany") {
        this.AddCompanyID = [];
        this.UserDetails.get('AddCompany').value.forEach(({ item_id }) => {
            this.AddCompanyID.push(item_id);
        });
        this.AddloadCompany_List.AddCompany_List.push({ "MyAddCompany": item.item_text, "AddCompany_Id": item.item_id })
        this.UpdateAddCompany_List()
    }
    else if (type == "Region") {
      this.DivisionData = [];
      this.bodyData.GridFilters[0].GridConditions = [];
      this.UserDetails.get('Region').value.forEach(({ item_text }) => {
        this.pushGridCondition(item_text);
      });
      await this.getCascadingDropdown("Division");
    }
    else if (type == "Division") {
      //if (this.IsBranchShow) {
        this.bodyData.GridFilters[0].GridConditions = [];
        this.UserDetails.get('Division').value.forEach(({ item_text }) => {
          this.pushGridCondition(item_text);
        });
        await this.getCascadingDropdown("Branch");
      }
    //}
    this.setClass();
  }

  onDeSelectAll(type: string, items: any) {
    if (type == "Role") {
      this.loadEmailPreferences =
      {
        "EmailPreferences": []
      };
      this.UpdateEmailPreferences();
      this.loadRole_List = {
        "Role_List": []
      }
      this.UpdateRole_List()
    }
    else if (type == "Company") {        
        this.loadCompany_List = {
            "Company_List": []
        }
        this.UpdateCompany_List()
    }
    else if (type == "AddCompany") {
        this.AddloadCompany_List = {
            "AddCompany_List": []
        }
        this.UpdateAddCompany_List()
    }
    else if (type == "Region") {
      this.DivisionData = [];
      this.BranchData = [];
      this.UserDetails.patchValue({ Branch: null });
      this.UserDetails.patchValue({ Division: null });
      this.UserDetails.updateValueAndValidity();
    } else if (type == "Division") {
      this.BranchData = [];
      this.UserDetails.patchValue({ Branch: null });
      this.UserDetails.updateValueAndValidity();
    }
    this.setClass();
  }
  async onSelectAll(type: string, items: any) {
    if (type == "Role") {
      this.RoleID = [];
      this.RoleDropdownList.forEach(({ item_id }) => {
        this.RoleID.push(item_id);
      });
      this.getEmailPref(this.RoleID.join(','));
      this.GetAlternateUserOutOfficeList(this.RoleID.join(','));
    } else if (type == "Company") {
        this.CompanyID = [];
        this.CompanyDropdownList.forEach(({ item_id }) => {
            this.CompanyID.push(item_id);
        });        
    } else if (type == "AddCompany") {
        this.AddCompanyID = [];
        this.AddCompanyDropdownList.forEach(({ item_id }) => {
            this.AddCompanyID.push(item_id);
        });
    }
    else if (type == "Region") {
      //this.BranchData = [];
      this.DivisionData = [];
      this.bodyData.GridFilters[0].GridConditions = [];
      this.RegionData.forEach(({ item_text }) => {
        this.pushGridCondition(item_text);
      });
      await this.getCascadingDropdown("Division");
    }
    else if (type == "Division") {
     // if (this.IsBranchShow) {
        this.bodyData.GridFilters[0].GridConditions = [];
        this.DivisionData.forEach(({ item_text }) => {
          this.pushGridCondition(item_text);
        });
        await this.getCascadingDropdown("Branch");
    //  }
    }
    this.setClass();
  }

  setClass() {
    this.setStatus();
    if (this.selectedItems.length > 0) { return 'validField' }
    else { return 'invalidField' }
  }

  fileChangeEvent(event: any, id): void {
    const file = event.target.files.item(0);
    if (file != null) {
      const ext = file.name.split('.').pop();
      if (ext === 'jpg' || ext === 'png') {
        this.errorMsg = '';
        // this.fileName[ControlName] = file.name;
        this.imageChangedEvent = event;
        // this.index = index;
        // this.ControlName = ControlName;
        this.modalService.open(id, { ariaLabelledBy: 'modal-basic-title' });
      } else {
        this.msg.showMessage('Warning', { body: 'Not a valid file' });
      }
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
    //  console.log(event);
  }
  imageLoaded() {
    //console.log('load');
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  Cropped() {
    if (164 >= this.croppedImage.height && 146 >= this.croppedImage.width) {
      this.compressor
        .compress(this.croppedImage, this.imageChangedEvent.target.files.item(0).name)
        .pipe(tap(file => {
          this.afterCroped = { ...this.croppedImage, file };
          this.modalService.dismissAll();
        }))
        .toPromise();
    } else
      this.msg.showMessage('Warning', { body: 'Image size is not correct' });
  }

  // onZoomChange(event: Event) {
  //   const scale = 1 + (event.target['valueAsNumber'] - 50) / 50;
  //   this.transform = {...this.transform, scale};
  // }

  onZoomIn() {
    const scale = this.transform.scale + 0.1;
    this.transform = { ...this.transform, scale };
  }

  onZoomOut() {
    const scale = this.transform.scale - 0.1;
    this.transform = { ...this.transform, scale };
  }
  ChkLSA(roleData:any[])
  {
    this.isLSARoles=false;
    const LSARoles:any[]=(environment.Setting.lsaroles).split(',');
    for(var role of roleData)
    {
      if(LSARoles.indexOf(role.item_id)>-1)
      {
        this.isLSARoles=true;
        break;
      }
    }

  }
// code by nihal 
  cheackToplineReportingRole(roleData:any[])
  {
   // this.ChkLSA(roleData);
    this.UserDetails.get('Region').clearValidators();
    this.UserDetails.get('Division').clearValidators();
    this.UserDetails.get('Branch').clearValidators();
    this.UserDetails.get('Agency').clearValidators();
    this.isToplineReportingRoles=false;
    const topLineReprtingRoles:any[]=(environment.Setting.topLineReprtingRoles).split(','); 
    const LSARoles: any[] = (environment.Setting.topLineReprtingRoles).split(',');  
    const LMK_LiveStockSalesAgent_RoleID: any[] = (environment.Setting.LMK_LiveStockSalesAgent_RoleID).split(','); 
    const LMK_SpecialRoles: any[] = (environment.Setting.LMK_SpecialRoles).split(',');
    this.isShowSpecialRoles = true;
    for (var role of roleData) {
        if (LMK_SpecialRoles.indexOf(role.item_id) > -1) {
            this.isShowSpecialRoles = false;
        }
    }
    for(var role of roleData)
    {
        //if (LMK_SpecialRoles.indexOf(role.item_id) > -1) {
        //    this.isShowSpecialRoles = false;
        //}

        if (LMK_LiveStockSalesAgent_RoleID.indexOf(role.item_id) > -1) {
            this.CompTempArray = [];
            for (let element of this.CompanyDropdownList) {
                this.CompTempArray.push(element);
                break;
            }
            this.CompanyID = [];
            this.UserDetails.get('Company').value.forEach(({ item_id }) => {
                this.CompanyID.push(item_id);
            });
            if (this.CompanyID.length > 1) {
                this.UserDetails.get("Company").patchValue(this.CompTempArray);
                this.UserDetails.updateValueAndValidity();
            }
        }  
        
    if(topLineReprtingRoles.indexOf(role.item_id)>-1)
    {
        this.isToplineReportingRoles=true;
        this.UserDetails.get('Region').setValidators([Validators.required]);
        this.UserDetails.get('Division').setValidators([Validators.required]);
        this.UserDetails.get('Branch').setValidators([Validators.required]);
        //this.UserDetails.get('Agency').setValidators([Validators.required]);
        this.UserDetails.updateValueAndValidity(); 
      
        break;                                                          
    }

  } }   
  

  

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


