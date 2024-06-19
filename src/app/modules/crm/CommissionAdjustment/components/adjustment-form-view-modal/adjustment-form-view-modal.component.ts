import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormViewService, DmoControlService, ApplicationService, MessageService, NgbDateFRParserFormatter } from '@app/core';
import { Observable } from 'rxjs';
import { AdjustmentService } from '../../services/adjustment.service';
import { NgbActiveModal, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { UserDetail } from '@app/core/models/user-detail';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import { NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-adjustment-form-view-modal',
  templateUrl: './adjustment-form-view-modal.component.html',
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
  styleUrls: ['./adjustment-form-view-modal.component.scss']
})
export class AdjustmentFormViewModalComponent implements OnInit {

  form: FormGroup;
  processName: string;
  customerList = [];
  BMJSON: any = {};
  headerInformationdmos = [];
  headerInformationDmog: any;
  optionListGL = [];
  isDoneLoading = false;
  submitted = false;
  saleDate: any;
  optionList: any = {};
  autoCorrectedDatePipe: any = createAutoCorrectedDatePipe('dd/mm/yyyy');
  formatter = (x: any) => x.dmocrmheaderinfsaleid;
  formattersapno = (x: any) => x.dmoagencyagncsapno;
  formatteragencyname = (x: any) => x.dmoagencyagncsapno_VAL;
  formatteragent = (x: any) => x.NAME;
  formatterbranch = (x: any) => x.dmobranchbrname + ' (' + x.dmobranchbrcode + ')';
  formattercustomersapno = (x: any) => x.dmocustmstrsapno;
  formattercustomername = (x: any) => x.dmocustmstrcustname1;
  ActivityType: string;
  applicationData: any = {};
  isCopy = false;
  WFJSON: any = {};
  transactionId: string
  
  dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
  constructor(
    private dmoControlService: DmoControlService,
    private formViewService: FormViewService,
    private adjustmentService: AdjustmentService,
    public activeModal: NgbActiveModal,
    private applicationService: ApplicationService,
    private datePipe: DatePipe,
    private navigate: Router,
    private modalService: NgbModal,
    private msg: MessageService,
    private userDetail: UserDetail,
    public ngbDateParserFormatter: NgbDateParserFormatter,
  ) { }

  ngOnInit() {
    this.isDoneLoading = false;
    this.adjustmentService.agencySapNo = '';
  //  this.currentUser = this.authenticationService.currentUserValue;
    this.processName = sessionStorage.getItem('AppName');

    this.formViewService.getBmWfJson(this.processName, 'Form').subscribe(async response => {
      this.BMJSON = response.BM.BusinessModelObjectGroup.Form;
      this.BMJSON.List.forEach(bmoGuid => {
        this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
          if (this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].DisplayName === 'Commission Adjustment') {
            this.headerInformationDmog = this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid];
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
              this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
                objCOLUMN.List.forEach(dmoGUID => {
                  objCOLUMN.DataModelObjects[dmoGUID].DMOGuid = dmoGUID;
                  this.headerInformationdmos.push(objCOLUMN.DataModelObjects[dmoGUID]);
                });
              });
            });
          }
        });
      });
      const dmos = [...this.headerInformationdmos];
      this.form = this.dmoControlService.toFormViewGroup(dmos);
      //this.populateDDLOptions();
      this.GetPlasmaId();
      this.form.get('DMOCommAdj_ActivityType').valueChanges.subscribe(val=>{
        this.ActivityType = val;
        this.adjustmentService.ActivityType = val;
        this.form.get('DMOCommAdj_SateID').patchValue('');
        const agent = this.form.get('DMOCommAdj_AgentName').value;
        if (agent && agent.dmoagentagntactlivestock && agent.dmoagentagntactinsurance && agent.dmoagentagntactwool) {
          if (agent.dmoagentagntactlivestock == 'No' && val == 'Livestock') {
            this.form.get('DMOCommAdj_AgentName').patchValue('');
          }
          if (agent.dmoagentagntactinsurance == 'No' && val == 'Insurance') {
            this.form.get('DMOCommAdj_AgentName').patchValue('');
          }
          if (agent.dmoagentagntactwool == 'No' && val == 'Wool') {
            this.form.get('DMOCommAdj_AgentName').patchValue('');
          }
        }

        const agency = this.form.get('DMOCommAdj_AgencyName').value;
        if (agency && agency.dmoagencyagncactlivestok && agency.dmoagencyagncactinsur && agency.dmoagencyagncactwool) {
          if (agency.dmoagencyagncactlivestok == 'No' && val == 'Livestock') {
            this.form.get('DMOCommAdj_AgencyName').patchValue('');
            this.form.get('DMOCommAdj_AgencySapNo').patchValue('');
          }
          if (agency.dmoagencyagncactinsur == 'No' && val == 'Insurance') {
            this.form.get('DMOCommAdj_AgencyName').patchValue('');
            this.form.get('DMOCommAdj_AgencySapNo').patchValue('');
          }
          if (agency.dmoagencyagncactwool == 'No' && val == 'Wool') {
            this.form.get('DMOCommAdj_AgencyName').patchValue('');
            this.form.get('DMOCommAdj_AgencySapNo').patchValue('');
          }
        }
        const customer = this.form.get('DMOCommAdj_CustomerID').value;
        if (customer && customer.dmocustmstracttype) {
          if (customer.dmocustmstracttype.split('|').includes(val) == false) {
            this.form.get('DMOCommAdj_CustomerID').patchValue('');
            this.form.get('DMOCommAdj_CustomerName').patchValue('');
          }
        }
      })
      this.form.get('DMOCommAdj_CompCode').valueChanges.subscribe(val=>{
        this.adjustmentService.companyCode = val;
      })
      if(this.isCopy) {
        this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).subscribe(data => {
          this.applicationData = data;
          this.form = this.dmoControlService.toAdminViewFormGroup(dmos, this.applicationData);
          if (this.applicationData && this.applicationData.DataInformation) {
            if (this.applicationData.DataInformation.dmocommadjactivitytype
              && this.applicationData.DataInformation.dmocommadjactivitytype.DMOVAL) {
              this.ActivityType = this.applicationData.DataInformation.dmocommadjactivitytype.DMOVAL;
              this.adjustmentService.ActivityType = this.ActivityType;
            }
            if (this.applicationData.DataInformation.dmocommadjsaledate
              && this.applicationData.DataInformation.dmocommadjsaledate.DMOVAL) {
              this.saleDate = this.applicationData.DataInformation.dmocommadjsaledate.DMOVAL;
              const ddMMyyyy = this.datePipe.transform(new Date(this.saleDate), 'dd/MM/yyyy');
              this.form.get('DMOCommAdj_SaleDate').setValue(ddMMyyyy);
            }
            if (this.applicationData.DataInformation.dmocommadjsateid
              && this.applicationData.DataInformation.dmocommadjsateid.DMOVAL) {
              if (this.ActivityType == 'Livestock') {
                const sl = {dmocrmheaderinfsaleid: this.applicationData.DataInformation.dmocommadjsateid.DMOVAL}
                this.form.get('DMOCommAdj_SateID').setValue(sl);
                
              } else {
                this.form.get('DMOCommAdj_SateID').setValue(this.applicationData.DataInformation.dmocommadjsateid.DMOVAL);
              }
            }
            if (this.applicationData.DataInformation.dmocommadjagencysapno
              && this.applicationData.DataInformation.dmocommadjagencysapno.DMOVAL) {
                const ag= {dmoagencyagncsapno :this.applicationData.DataInformation.dmocommadjagencysapno.DMOVAL }
              this.form.get('DMOCommAdj_AgencySapNo').setValue(ag);
            }
            if (this.applicationData.DataInformation.dmocommadjagencyname
              && this.applicationData.DataInformation.dmocommadjagencyname.DMOVAL) {
                const ag= {dmoagencyagncsapno_VAL : this.applicationData.DataInformation.dmocommadjagencyname.DMOVAL }
              this.form.get('DMOCommAdj_AgencyName').setValue(ag);
            }
            if (this.applicationData.DataInformation.dmocommadjagentname
              && this.applicationData.DataInformation.dmocommadjagentname.DMOVAL
              && this.applicationData.DataInformation.dmocommadjagentname.DMOVAL.indexOf('~~~')> -1) {
                const ag= {CODE:this.applicationData.DataInformation.dmocommadjagentname.DMOVAL.split('~~~')[0], NAME : this.applicationData.DataInformation.dmocommadjagentname.DMOVAL.split('~~~')[1] }
              this.form.get('DMOCommAdj_AgentName').setValue(ag);
            }
            if (this.applicationData.DataInformation.dmocommadjcustomerid
              && this.applicationData.DataInformation.dmocommadjcustomerid.DMOVAL) {
                const ag= {dmocustmstrsapno :this.applicationData.DataInformation.dmocommadjcustomerid.DMOVAL }
              this.form.get('DMOCommAdj_CustomerID').setValue(ag);
            }
            if (this.applicationData.DataInformation.dmocommadjcustomername
              && this.applicationData.DataInformation.dmocommadjcustomername.DMOVAL) {
                const ag= {dmocustmstrcustname1 :this.applicationData.DataInformation.dmocommadjcustomername.DMOVAL }
              this.form.get('DMOCommAdj_CustomerName').setValue(ag);
            }
            if (this.applicationData.DataInformation.dmocommadjbranch
              && this.applicationData.DataInformation.dmocommadjbranch.DMOVAL
              && this.applicationData.DataInformation.dmocommadjbranch.DMOVAL.indexOf('~~~')> -1) {
              const branch = {
                dmobranchbrcode: this.applicationData.DataInformation.dmocommadjbranch.DMOVAL.split('~~~')[0],
                dmobranchbrname : this.applicationData.DataInformation.dmocommadjbranch.DMOVAL.split('~~~')[1]
              }
              this.form.get('DMOCommAdj_Branch').setValue(branch);
            }
          }
       
        });
      }
      this.adjustmentService.getCompany('').subscribe(result=>{
        if(result && result.Data && result.Data.length > 0) {
          const rs = {ddOptionKey: result.Data[0].dmocmcompcode, ddOptionValue:result.Data[0].dmocmcompname};
          this.form.get('DMOCommAdj_CompCode').patchValue(rs);
        }
        
      })
      this.isDoneLoading = true;
    });
  }
  GetPlasmaId() {
    this.headerInformationdmos.forEach((dmo: any) => {
      if (dmo.Type === 'ID') {
        this.dmoControlService.GetPlasmaId(dmo.Name).subscribe(value => {
          const chldCtrl = this.form.get(dmo.Name);
          chldCtrl.reset(value.PlasmaID);
          chldCtrl.updateValueAndValidity();
        });
      }
    });
    return;
  } 
  // Auto Complete ---------
  saleIdSearch = (text$: Observable<string>) => {
    return this.adjustmentService.saleIdSearch(text$);
  }
  agencySearch = (text$: Observable<string>) => {
    return this.adjustmentService.agencySearch(text$);
  }
  CustomerSearchById = (text$: Observable<string>) => {
    return this.adjustmentService.CustomerSearchById(text$);
  }
  CustomerSearchByName = (text$: Observable<string>) => {
    return this.adjustmentService.CustomerSearchByName(text$);
  }
 
  agentSearch = (text$: Observable<string>) => {
    return this.adjustmentService.agentSearch(text$);
  }
  branchSearch = (text$: Observable<string>) => {
    return this.adjustmentService.branchSearch(text$);
  }
  selectitem(event: any, dmo: string) {
    if (dmo === 'dmocommadjsateid') {
      if (event.item && event.item.dmocrmheaderinfsaledate !== null
        && event.item.dmocrmheaderinfsaledate !== '') {
        this.saleDate = event.item.dmocrmheaderinfsaledate;
        const ddMMyyyy = this.datePipe.transform(new Date(event.item.dmocrmheaderinfsaledate), 'dd/MM/yyyy');
        this.form.get('DMOCommAdj_SaleDate').setValue(ddMMyyyy);
      }
    } else if (dmo === 'dmocommadjagencysapno') {
      this.form.get('DMOCommAdj_AgencyName').patchValue(event.item);
      this.adjustmentService.agencySapNo = event.item.dmoagencyagncsapno.indexOf('(') > -1 ? event.item.dmoagencyagncsapno.split('(')[1].replace(')', '') : event.item.dmoagencyagncsapno;
      //this.adjustmentService.agencySapNo = event.item.dmoagencyagncsapno.split('('); dev ops
    } else if (dmo === 'dmocommadjagentname') {
      if(this.form.get('DMOCommAdj_AgencyName').value == null){
        this.form.get('DMOCommAdj_AgencyName').patchValue(event.item);
      }
      if(this.form.get('DMOCommAdj_AgencySapNo').value == null){
        this.form.get('DMOCommAdj_AgencySapNo').patchValue(event.item);
      }
    } else if (dmo === 'dmocommadjagencyname') {
      this.form.get('DMOCommAdj_AgencySapNo').patchValue(event.item);
      this.adjustmentService.agencySapNo = event.item.dmoagencyagncsapno.indexOf('(') > -1 ? event.item.dmoagencyagncsapno.split('(')[1].replace(')', '') : event.item.dmoagencyagncsapno;
      //this.adjustmentService.agencySapNo = event.item.dmoagencyagncsapno;
    } else if (dmo === 'dmocommadjcustomerid') {
      this.form.get('DMOCommAdj_CustomerName').patchValue(event.item);
    } else if (dmo === 'dmocommadjcustomername') {
      this.form.get('DMOCommAdj_CustomerID').patchValue(event.item);
    }
  }
  populateDDLOptions() {
    this.adjustmentService.getGLAccount().subscribe(result => {
      this.optionListGL = result.Data;
    });
    this.adjustmentService.getGLAccount().subscribe(result => {
      this.optionListGL = result.Data;
    });
  }
  get f() { return this.form.controls; }
  onSubmit() {
    const loginUser = this.userDetail;
    this.submitted = true;
    if (this.form.valid) {
      let formValue: any = {};
      formValue = this.form.value;
      if (Object.keys(formValue).includes('DMOCommAdj_SateID')) {
        formValue.DMOCommAdj_SateID = formValue.DMOCommAdj_SateID.dmocrmheaderinfsaleid ? formValue.DMOCommAdj_SateID.dmocrmheaderinfsaleid : formValue.DMOCommAdj_SateID;
      }
      if (Object.keys(formValue).includes('DMOCommAdj_AgencySapNo')) {
        let sapNo: any;
        if (formValue.DMOCommAdj_AgencySapNo.dmoagencyagncsapno.lastIndexOf('(') > -1) {
          sapNo = formValue.DMOCommAdj_AgencySapNo.dmoagencyagncsapno.split('(');
          sapNo = sapNo[sapNo.length - 1].replace(')', '');
        } else {
          sapNo = formValue.DMOCommAdj_AgencySapNo.dmoagencyagncsapno;
        }
        formValue.DMOCommAdj_AgencySapNo = sapNo;
      }
      if (Object.keys(formValue).includes('DMOCommAdj_AgentName')) {
        formValue.DMOCommAdj_AgentName = formValue.DMOCommAdj_AgentName.NAME + ' (' + formValue.DMOCommAdj_AgentName.CODE + ')';
      }
      if (Object.keys(formValue).includes('DMOCommAdj_Branch')) {
        formValue.DMOCommAdj_Branch = formValue.DMOCommAdj_Branch.dmobranchbrname + ' (' + formValue.DMOCommAdj_Branch.dmobranchbrcode + ')';
      }
      if (Object.keys(formValue).includes('DMOCommAdj_AgencyName')) {
        formValue.DMOCommAdj_AgencyName = formValue.DMOCommAdj_AgencyName.dmoagencyagncsapno_VAL;
      }
      if (Object.keys(formValue).includes('DMOCommAdj_CustomerID')) {
        formValue.DMOCommAdj_CustomerID = formValue.DMOCommAdj_CustomerID.dmocustmstrsapno;
      }
      if (Object.keys(formValue).includes('DMOCommAdj_CustomerName')) {
        formValue.DMOCommAdj_CustomerName = formValue.DMOCommAdj_CustomerName.dmocustmstrcustname1;
      }
      if (Object.keys(formValue).includes('DMOCommAdj_CompCode')) {
        formValue.DMOCommAdj_CompCode = formValue.DMOCommAdj_CompCode.ddOptionValue + ' (' + formValue.DMOCommAdj_CompCode.ddOptionKey + ')';
      }
      
      if (this.ActivityType == 'Livestock') {
        formValue.DMOCommAdj_SaleDate = this.saleDate;
      } else {
        const date = this.parseToYYMMDD(formValue.DMOCommAdj_SaleDate);
        if (environment.Setting.dateTimeFormat24 == true) {
          formValue.DMOCommAdj_SaleDate = this.getUserDateTime(date, 'MM/dd/yyyy HH:mm:ss', loginUser.TimeZone);
        } else {
          formValue.DMOCommAdj_SaleDate = this.getUserDateTime(date, 'MM/dd/yyyy h:mm:ss a', loginUser.TimeZone);
        }
      }
      delete formValue.DMOCommAdj_BlnkLbl;
      const submitData: any = {
        ProcessName: sessionStorage.AppName,
        UserName: this.userDetail.UserName,
        TriggerName: 'TRG_CommAdj_Submit',
        Data: [formValue]
      };
      this.adjustmentService.insertCommissionAdjustment(submitData).subscribe(async response => {
        this.activeModal.close(true);
        this.navigate.navigate(['/crm/commissionadjustment/LMKCRMCommissionAdjustment']);
      });

    } else {
      return ;
    }
  }
  clearData(event) {
    if (event.target.value === '') {
      this.form.get('DMOCommAdj_AgencyName').patchValue('');
      this.form.get('DMOCommAdj_AgentName').patchValue('');
      this.form.get('DMOCommAdj_CustomerID').patchValue('');
      this.form.get('DMOCommAdj_CustomerName').patchValue('');
    }
    
  }
  closeModal() {
    let isFormChange = 0;
    Object.keys(this.form.controls)
      .forEach(key => {
        const currentControl = this.form.controls[key];
        if (currentControl.dirty) {
          isFormChange++;
        }
      });
    if (isFormChange > 0) {
      this.msg.showMessage('Warning', {
        body: 'Are you sure to close this form?',
        btnText: 'Yes',
        checkboxText: 'Would you like to proceed?',
        isConfirmation: true,
        isDelete: false,
        callback: this.redirectionCloseConfirmation,
        caller: this,
      })
      // this.showErrorMessage('Are you sure to close this Form?', 'Warrning', 'Yes',
      //   this.redirectionCloseConfirmation, false, true, true, 'would you like to proceed?');
    } else {
      this.activeModal.close(0);
    }
  }
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsDelete: boolean, IsDefaultView: boolean,
  //   IsConfirmation: boolean, confirmationText: string) {
  //   const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
  //   const modalInstance: MessageComponent = modalMsgRef.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.ButtonText = buttonText;
  //   modalInstance.MessageHeader = HeaderMsg;
  //   modalInstance.MessagePopup = modalMsgRef;
  //   modalInstance.IsConfirmation = IsConfirmation;
  //   modalInstance.CallBackMethod = callback;
  //   modalInstance.Caller = this;
  //   modalInstance.IsDelete = IsDelete;
  //   modalInstance.IsDefaultView = IsDefaultView;
  //   modalInstance.ConfirmationText = confirmationText;
  // }

  redirectionCloseConfirmation(modelRef: NgbModalRef, Caller: AdjustmentFormViewModalComponent) {
    Caller.activeModal.close(0);
  }
  getUserDateTime(value, format, zone) {
    try {
      const d = new Date(value); // val is in UTC
      const localOffset = zone * 60000;
      const localTime = d.getTime() - localOffset;
      d.setTime(localTime);
      return formatDate(d, format, 'en-US');
    } catch (error) {

      return '';
    }
  }
  parseToYYMMDD(value: any): string | null {
    if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
      const str = value.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]);
      const date = Number(str[0]);
      return year +'-'+ month +'-'+ date;
    }
  }
}
