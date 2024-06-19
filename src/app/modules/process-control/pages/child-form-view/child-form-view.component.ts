import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@env/environment';
import { FormViewService, DmoControlService, ApplicationService, AuthenticationService, BMConditionService, MessageService, ListviewService } from '@app/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DmoImageControlService } from '@app/core/services/dmo-image-control.service';
import { UserDetail } from '@app/core/models/user-detail';
@Component({
  selector: 'child-form-view',
  templateUrl: './child-form-view.component.html',
  styleUrls: ['./child-form-view.component.scss']
})
export class ChildFormViewComponent implements OnInit {
  BMId: number;
  BMJSON: any = {};
  WFJSON: any = {};
  form: FormGroup;
  dmos = [];
  bmogCondJson = [];
  triggerCondJson = [];
  processName: string;
  processUrlName: string;
  transactionId: string;
  applicationData: any = {};

  topCornerDetails = [];
  triggers: any = [];
  currentStageGuid: string;
  currentStateGuid: string;
  formSubmitted = false;
  formTriggered = false;
  currentUser: any = {};
  isSubprocess: any = false;
  wfosType: string;
  wfosName: string;
  SubProcessNames: string;
  ParentDmoName: string;
  ParentDmoValue: string;
  ChildDmoGuid: any;
  SubProcessChild: any;//Entity related code- Nidhi 
  CanvasType: string = 'AdminView';
  uniqueConstraint:any;  
  IsInserted: boolean;
  IsPermissionSet = false;
  IsChangeLogAllow: any;
  IsNotesAllow: any;
  IsNotificationAllow: any;
  IsActivityLogAllow: any;

  dateFormat: string = environment.Setting.dateFormat; //MD Changes - #445 & CRM #961

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private dmoControlService: DmoControlService,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    public location: Location, 
    private bmCondition: BMConditionService, 
    private msg: MessageService,
    public activeModal: NgbActiveModal,
    private listviewService: ListviewService,
    private dmoImage: DmoImageControlService,
    private userDetail: UserDetail) { }

  ngOnInit() {
    this.IsInserted = false;
    this.currentUser = this.userDetail;
    this.route.paramMap.subscribe(params => {
      if (!this.transactionId) {
        this.transactionId = params.get('id');
      }
      if (!this.processName) {
        this.processName = params.get('process_name');
      }
      if (!this.processUrlName) {
        this.processUrlName = params.get('process_name');
      }
     this.getBMWFJson();
    });
  }

   //MD Changes - #445 & CRM #961
  public isDate(value: string) {
    const regex = /([0-9]){1,2}\/([0-9]{2})\/([0-9]){4}/;
    return value.match(regex);
  }

  getForm() {    
    this.BMJSON.List.forEach(bmoGuid => {
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'SubProcess') {
        this.SubProcessNames = this.SubProcessNames === undefined ? this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName : this.SubProcessNames + "," + this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
      }
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'ChildProcess') {
        this.ParentDmoName = this.BMJSON.BusinessModelObjects[bmoGuid].ParentProcessDmoName;
      }
      this.bmogCondJson[bmoGuid] = {
        IsVisible: true, IsEnable: true, IsRequired: null, Name: this.BMJSON.BusinessModelObjects[bmoGuid].Name
        , isHideFromStageState: false
      };
      if (this.BMJSON.BusinessModelObjects[bmoGuid].List != undefined) {

        this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
          this.bmogCondJson[bmoGuid][dmogGuid] = {
            IsVisible: true, IsEnable: true, IsRequired: null,
            Name: this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Name,
            isHideFromStageState: false
          };
          this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
              objCOLUMN.List.forEach(dmoGUID => {
                const dmoData = { ...objCOLUMN.DataModelObjects[dmoGUID] };
                dmoData.DMOGuid = dmoGUID;
                dmoData.BmoGuid = bmoGuid;
                dmoData.DmogGuid = dmogGuid;
                this.dmos.push(dmoData);
                this.bmogCondJson[bmoGuid][dmogGuid][dmoGUID] = {
                  IsVisible: true, IsEnable: true,
                  IsRequired: objCOLUMN.DataModelObjects[dmoGUID].IsRequired, Name: objCOLUMN.DataModelObjects[dmoGUID].Name,
                  dmoOption: objCOLUMN.DataModelObjects[dmoGUID].Options,
                  isHideFromStageState: false
                };
              });
            });
          });
        });
      }
    });
    this.getTriggers();
    this.dmoControlService.CurrentStage = this.WFJSON.Stages[this.currentStageGuid];
    if (this.WFJSON.Stages[this.currentStageGuid] &&
      this.WFJSON.Stages[this.currentStageGuid].States &&
      this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid]) {
        this.dmoControlService.CurrentState = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid];
        this.wfosType = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].WfosType;
        this.wfosName = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Name;
    } else {
      this.dmoControlService.CurrentState = null;
    }

    this.form = this.dmoControlService.toAdminViewFormGroup(this.dmos, this.applicationData);
    this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
    this.ParentDmoValue = this.form.controls[this.ParentDmoName] === undefined ? undefined : this.form.controls[this.ParentDmoName].value;
    this.cdr.reattach();
    this.cdr.detectChanges();
     //this.getChildRelation();// Code Commnet for reset Child detailview page to blank child control values and changes to reset key value search box. - Biresh - Entity - 15 feb 2021
  }

  getTriggers() {
    this.triggers = [];
    var userRole = this.currentUser.ListRole;
    if (this.WFJSON.Stages[this.currentStageGuid] &&
      this.WFJSON.Stages[this.currentStageGuid].States &&
      this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid]) {
      Object.keys(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers).forEach(triggerId => {
        //trigger access associated to user role
        var ActionRoles = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerId].ActionRoles;
        let isShowHideTrigger = false;
        Object.keys(ActionRoles).forEach(roleguid => {
          if (isShowHideTrigger == false)
            isShowHideTrigger = userRole.indexOf(roleguid) > -1 ? true : false;
        });
        if (isShowHideTrigger) {
          this.triggers.push(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerId]);
          const trigger = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerId];
          this.triggerCondJson[triggerId] = {
            IsVisible: true,
            IsEnable: true,
            Guid: trigger.Guid
          };
        };
      });
    }
  }

  triggerSubmit(trigger: any) {
    if (trigger.ActionName === 'Submit') {
      this.formSubmitted = true;
      this.formTriggered = false;
      this.applicationService.checkValidations();
      if (!this.form.valid) {
        return;
      }
    } else {
      this.formSubmitted = false;
      this.formTriggered = true;

      let isFormInValid = false;
      Object.keys(this.form.controls).forEach(controlKey => {
        if (this.form.controls[controlKey].valid === false && this.form.controls[controlKey].errors !== null) {
          Object.keys(this.form.controls[controlKey].errors).forEach(errorKey => {
            if (errorKey !== 'required') {
              isFormInValid = true;
            }
          });
        }
      });
      if (isFormInValid) {
        return;
      }
    }

    let formValue = { ...this.form.getRawValue() };

    formValue = this.dmoControlService.sanitizeFormValue(this.dmos, formValue);

    const submitData: any = {
      Identifier: {
        Name: null,
        Value: null,
        TrnsctnID: this.transactionId
      },
      ProcessName: this.processName,
      TriggerName: trigger.Name,
      UserName: this.currentUser.UserName,
      UniqueConstraints: this.uniqueConstraint,
      Data: [formValue]
    };
    //Change Validate Uniqueness Process Ticket - #1005
    // check condition if user change any value then validate uniqueness.
    // if (formValue && Object.keys(formValue).length > 0) {
    //   const ValidateValue = this.dmoControlService.sanitizeFormValueForValidateUniqueness(this.dmos, this.form.getRawValue())
    //   const ValidateData: any = {
    //     Identifier: {
    //       Name: null,
    //       Value: null,
    //       TrnsctnID: this.transactionId
    //     },
    //     ProcessName: this.processName,
    //     TriggerName: trigger.Name,
    //     UserName: this.currentUser.UserName,
    //     UniqueConstraints: this.uniqueConstraint,
    //     TransactionID: this.transactionId,
    //     Data: [ValidateValue]
    //   };
    //   let isvalidateUniqueCons: any = true;
    //   this.applicationService.ValidateUniqueDmoValue(ValidateData).subscribe(
    //     (resultData: any) => {
    //       isvalidateUniqueCons = resultData;
    //       if (isvalidateUniqueCons) {
    //         this.updateRecord(submitData);
    //       }
    //       else {
    //         this.toastr.warning('Record already exists.');
    //       }
    //     }
    //   );
    // } else {
    //   this.updateRecord(submitData);
    // }
    this.applicationService.getTriggerConfirmMsg(this.processName, trigger.Guid).subscribe(Data=>{
      //this.updateRecord(submitData);
      if (Data && Data.length > 0) {
        let isConfirmMsgExists = false;
        const fVal = { ...this.form.value };
        for (var i = 0, len = Data.length; i < len; i++) {
          const dmoDetail = this.dmos.find(x=> x.DMOGuid == Data[i].DmoGuid);
          if (dmoDetail) {
            if(this.validateConfirmMsg(Data[i].Operator, fVal[dmoDetail.Name], dmoDetail.Type)){
              isConfirmMsgExists = true;
              const bodymsg = Data[i].ConfirmMsg || 'Record with future Active To date cannot be expired, Please change it and try again.';
              this.msg.showMessage('Warning',{body: bodymsg, isConfirmation: false, btnText: 'Ok' }).result.then(result=>{
                if(result){
                  this.updateRecord(submitData);
                }
              });
              break;
            } else {
              isConfirmMsgExists = false;
            }
          }
        }
        if(!isConfirmMsgExists) {
          this.updateRecord(submitData);
        }
      } else {
        this.updateRecord(submitData);
      }
    });
    //End - #1005
  }
  validateConfirmMsg(Operator: string, dmoValue: any,dmoType: string){
    let dmoDate;
    switch (dmoType) {
      case 'DateWithCalendar':
      case 'StaticDateBox':
        if (dmoValue != null &&
          dmoValue !== '' &&
          dmoValue.hasOwnProperty('year') &&
          dmoValue.hasOwnProperty('month') &&
          dmoValue.hasOwnProperty('day')) {
          const { year, month, day } = dmoValue;
          dmoDate = `${year}/${month}/${day}`;
        }
        break;
    }
    if (dmoDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      switch (Operator) {
        case 'EQ':
          dmoDate = new Date(dmoDate);
          dmoDate.setHours(0, 0, 0, 0);
          if (dmoDate == today) {
            return true;
          }
          break;
        case 'GE':
          dmoDate = new Date(dmoDate);
          dmoDate.setHours(0, 0, 0, 0);
          if (dmoDate >= today) {
            return true;
          }
          break;
        case 'GT':
          dmoDate = new Date(dmoDate);
          dmoDate.setHours(0, 0, 0, 0);
          if (dmoDate > today) {
            return true;
          }
          break;
        case 'LT':
          dmoDate = new Date(dmoDate);
          dmoDate.setHours(0, 0, 0, 0);
          if (dmoDate < today) {
            return true;
          }
          break;
        case 'LE':
          dmoDate = new Date(dmoDate);
          dmoDate.setHours(0, 0, 0, 0);
          if (dmoDate <= today) {
            return true;
          }
          break;
        case 'NE':
          dmoDate = new Date(dmoDate);
          dmoDate.setHours(0, 0, 0, 0);
          if (dmoDate != today) {
            return true;
          }
          break;
      }
    } else{
      return false;
    }
  }
  isTriggerVisible(trigger: any) {
    let isShowHideTrigger = false;
    Object.keys(trigger.ActionRoles).forEach(roleguid => {
      if (isShowHideTrigger == false)
        isShowHideTrigger = this.currentUser.ListRole.indexOf(roleguid) > -1 ? true : false;
    });
    if (isShowHideTrigger)
      isShowHideTrigger = this.triggerCondJson[trigger.Guid].IsVisible;
    return isShowHideTrigger;
  }

  isTriggerEnable(trigger: any) {
    return this.triggerCondJson[trigger.Guid].IsEnable;
  }

  getDMOFileData(dmoGUID: string) {
    if (this.applicationData.FileInformation[dmoGUID] === undefined) {
      return [];
    } else {
      return this.applicationData.FileInformation[dmoGUID];
    }
  }

  checkSubProcessRecord(trigger: any) {
    let result: any = '';
    if (this.wfosType === 'SubProcess') {
      if (this.SubProcessNames !== undefined) {
        if (this.SubProcessNames.indexOf(',') > -1) {

        } else {
          const processrecord = {
            ParentTransactionID: this.transactionId,
            ProcessName: this.SubProcessNames,
            StateName: this.wfosName
          };
          this.applicationService.checkSubProcessRecordCount(processrecord).subscribe(
            (resultData: any) => {
              result = resultData;
              if (result === 0) {
                this.triggerSubmit(trigger);
              } else {
                this.toastr.error('All Sub Process records are not on end state.');
              }
            }
          );
        }
      }
    } else {
      this.triggerSubmit(trigger);
    }
  }

  go_back() {
    this.router.navigate(['process_control', this.processUrlName]);
  }
  // Create a method for update record
  updateRecord(submitData: any) {
    this.IsInserted = true;
      this.dmoImage.upload(this.transactionId);
    this.applicationService.updateApplication(submitData).subscribe(res => {
      this.toastr.success('Data saved successfully');
      // Reload form 
      this.cdr.detach();
      this.getBMWFJson();
    });
  }
  getChildRelation(){
    if(this.ChildDmoGuid && this.ChildDmoGuid[this.processName] && this.ChildDmoGuid[this.processName].ChildProcessDmoGuid) {
      const childGuid = this.ChildDmoGuid[this.processName].ChildProcessDmoGuid;
      const childKey = this.dmos.find(x=> x.DMOGuid === childGuid);
      if (childKey) {
        this.form.get(childKey.Name).disable();
        this.form.get(childKey.Name).markAsDirty();
      }
    }
    
      //Entity related code start– Nidhi       
    if (!!this.SubProcessChild && this.SubProcessChild.length>0) { 
      this.SubProcessChild.forEach(element => {
        if(element.length>0){
          for(var el=0;el<element.length;el++){
            if(this.processName === element[el]['ProcessName']){
              const childdmoName = element[el]['ChildProcessDmoName'];
              if(!!childdmoName){
                this.form.get(childdmoName).disable();
                this.form.get(childdmoName).markAsDirty();
              } 
            }                                
          }                  
        }
      });
    }     
      //Entity related code end Nidhi 
  }
  closeModal(){
    this.activeModal.close(this.IsInserted);
  }
  private getBMWFJson() {
    this.formViewService.getBmWfJson(this.processName, this.CanvasType, this.transactionId).subscribe(response => {
      this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId).subscribe(appData => {
          this.applicationData = appData;

        this.applicationService.getTopCornerDetail(null, null, this.CanvasType, this.transactionId).subscribe(async topDetails => {
            this.topCornerDetails = topDetails;

            this.currentStageGuid = this.applicationData.ApplicationInfo[0].StagGuid;
            this.currentStateGuid = this.applicationData.ApplicationInfo[0].StateGuid;
            if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null)  {
              this.BMId = response.BM.BMId;
              this.uniqueConstraint = response.BM.UniqueConstraint;
              this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
                //Get Permission For BMOG (Notes, Notification, Activity Log & Change Log)
              var data = await this.listviewService.userActionPermission(this.processName).toPromise();
              if (data) {
                this.IsNotesAllow = data.IsNotesAllow;
                this.IsNotificationAllow = data.IsNotificationAllow;
                this.IsActivityLogAllow = data.IsActivityLogAllow;
                this.IsChangeLogAllow = data.IsChangeLogAllow;
                if (this.IsNotesAllow === true) {
                  this.BMJSON.List.push('notes');
                  this.BMJSON.BusinessModelObjects.notes = { Type: 'Log', DisplayName: 'Notes' };
                }
                if (this.IsNotificationAllow === true) {
                  this.BMJSON.List.push('notification');
                  this.BMJSON.BusinessModelObjects.notification = { Type: 'Log', DisplayName: 'Notification' };
                }
                if (this.IsActivityLogAllow === true) {
                  this.BMJSON.List.push('activitylog');
                  this.BMJSON.BusinessModelObjects.activitylog = { Type: 'Log', DisplayName: 'Activity Log' };
                }
                if (this.IsChangeLogAllow === true) {
                  this.BMJSON.List.push('history');
                  this.BMJSON.BusinessModelObjects.history = { Type: 'Log', DisplayName: 'Change Log' };
                }
              }
              // this.BMJSON.List.push('notes');
              // this.BMJSON.List.push('notification');
              // this.BMJSON.List.push('activitylog');
              // this.BMJSON.List.push('history');
              // this.BMJSON.BusinessModelObjects.notes = { Type: 'Log', DisplayName: 'Notes' };
              // this.BMJSON.BusinessModelObjects.activitylog = { Type: 'Log', DisplayName: 'Activity Log' };
              // this.BMJSON.BusinessModelObjects.history = { Type: 'Log', DisplayName: 'Change Log' };
              // this.BMJSON.BusinessModelObjects.notification = { Type: 'Log', DisplayName: 'Notification' };
              this.WFJSON = response.WF;
              this.getForm();
            } else {
              this.msg.showMessage('Warning', {body: environment.Setting.xmlgeneratemsg});
              // this.msg.showErrorMessage(environment.Setting.xmlgeneratemsg, 'Message', 'Ok', null, false, true, false, '');
            }
          });
        });
      });
  }
  getUserLocalDate(item) {
    let userDate = this.dmoControlService.getUserDateTime(item.Value, this.dateFormat, this.currentUser.TimeZone, item.DmoType ? item.DmoType != 'StaticDateBox' : true);
    const value = userDate.split(' ')[0];
    return value;
  }
}
