import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { FormViewService, ApplicationService, DmoControlService, AuthenticationService, NgbDateFRParserFormatter, BMConditionService, MessageService, ApiService } from '@app/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@env/environment';
import { DmoImageControlService } from '@app/core/services/dmo-image-control.service';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'sub-app-copy-record',
  templateUrl: './sub-process-copy-record.component.html',
  styleUrls: ['./sub-process-copy-record.component.scss']
})
export class SubProcessCopyRecordComponent implements OnInit {
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
  tempTransactionID = '';
  currentUser: any;
  parentTransactionId: string;
  uniqueConstraint: any;
  ParentDmoValue: string;
  ChildDmoGuid: any;
  SubProcessChild: any;//Entity related code Nidhi 
  IsInserted: boolean;
  UpdateKeyValueDmoReferencedValues: any;
  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private dmoControlService: DmoControlService,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    private ngbDateFRParserFormatter: NgbDateFRParserFormatter,
    public bmCondition: BMConditionService, public location: Location,
    private msg: MessageService,
    public activeModal: NgbActiveModal,
    private dmoImage: DmoImageControlService,
    private userDetail: UserDetail) { }

  ngOnInit() {
    this.IsInserted = false;
    this.currentUser = this.userDetail;
    if (!this.processName) {
      this.processName = sessionStorage.getItem('AppName');
    }
    this.route.paramMap.subscribe(async params => {
      if (!this.transactionId) {
        this.transactionId = params.get('id');
      }
      if (!this.processUrlName) {
        this.processUrlName = params.get('process_name');
      }
      if (!this.parentTransactionId) {
        this.parentTransactionId = params.get('parenttranctionId');
      }
      this.formViewService.getBmWfJson(this.processName, 'Form', this.transactionId).subscribe(response => {
        if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
          this.BMId = response.BM.BMId;
          this.UpdateKeyValueDmoReferencedValues = response.BM.UpdateKeyValueDmoReferencedValues;
          this.uniqueConstraint = response.BM.UniqueConstraint;
          this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).subscribe(appData => {
            this.applicationData = appData;
            this.BMJSON = response.BM.BusinessModelObjectGroup.Form;
            this.WFJSON = response.WF;
            this.currentStageGuid = Object.keys(this.WFJSON.Stages)[0];
            this.currentStateGuid = Object.keys(this.WFJSON.Stages[this.currentStageGuid].States)[0];
            Object.keys(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers).forEach(triggerID => {
              this.triggers.push(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerID]);
              const trigger = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerID];
              this.triggerCondJson[triggerID] = {
                IsVisible: true, IsEnable: true, Guid: trigger.Guid
              };
            });
            this.getForm();
            this.getTriggers();
          });
        } else {
          this.msg.showMessage('Warning', { body: environment.Setting.xmlgeneratemsg });
          // this.msg.showErrorMessage(environment.Setting.xmlgeneratemsg, 'Message', 'Ok', null, false, true, false, '');
        }
      });
    });
  }

  getForm() {
    this.BMJSON.List.forEach(bmoGuid => {
      this.bmogCondJson[bmoGuid] = { IsVisible: true, IsEnable: true, isRequired: null, Name: this.BMJSON.BusinessModelObjects[bmoGuid].Name, isHideFromStageState: false };
      this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
        const isDMOGHiddenType = this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].IsHidden === undefined ? false
          : this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].IsHidden;
        this.bmogCondJson[bmoGuid][dmogGuid] = {
          IsVisible: isDMOGHiddenType === true ? false : true, IsEnable: true, isRequired: null,
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
                IsRequired: isDMOGHiddenType === true ? false : objCOLUMN.DataModelObjects[dmoGUID].IsRequired, Name: objCOLUMN.DataModelObjects[dmoGUID].Name,
                Type: objCOLUMN.DataModelObjects[dmoGUID].Type,
                dmoOption: objCOLUMN.DataModelObjects[dmoGUID].Options,
                isHideFromStageState: false
              };
            });
          });
        });
      });
    });
    this.dmoControlService.CurrentStage = this.WFJSON.Stages[this.currentStageGuid];
    this.dmoControlService.CurrentState = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid];
    this.form = this.dmoControlService.toAdminViewFormGroup(this.dmos, this.applicationData);
    console.log(this.form);
    this.GetPlasmaId();
    this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);

    this.cdr.detectChanges();
    this.getChildRelation();
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
  GetPlasmaId() {
    this.dmos.forEach((dmo: any) => {
      if (dmo.Type === 'ID') {
        this.dmoControlService.GetPlasmaId(dmo.Name).subscribe(value => {
          console.log(value);
          const chldCtrl = this.form.get(dmo.Name);
          chldCtrl.reset(value.PlasmaID);
          chldCtrl.updateValueAndValidity();
        });
      }
    });
    return;
  }

  async triggerSubmit(trigger: any) {
    if (trigger.ActionName === 'Submit') {
      this.formSubmitted = true;
      this.formTriggered = false;

      if (!this.form.valid) {
        return;
      }
    } else {
      this.formSubmitted = false;
      this.formTriggered = true;

      let isFormInValid = false;
      Object.keys(this.form.controls).forEach(controlKey => {
        if (this.form.controls[controlKey].valid === false) {
          if (this.form.controls[controlKey].errors != null) {
            Object.keys(this.form.controls[controlKey].errors).forEach(errorKey => {
              if (errorKey !== 'required') {
                isFormInValid = true;
              }
            });
          }
        }
      });
      if (isFormInValid) {
        return;
      }
    }

    let formValue = { ...this.form.getRawValue() };
    //Change Validate Uniqueness Process Ticket - #1005
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
      Data: [formValue],
      ParentTransactionID: this.parentTransactionId,
      TempTransactionID: this.tempTransactionID
    };
    this.applicationService.insertApplication(submitData).subscribe(value => {
      this.IsInserted = true;
      this.updateKeyValue(submitData);
      if (value && value.statuscode === 200) {
        this.dmoImage.upload(value.result.transactionId);
      }
      this.closeModal();
    });
    // let formValue = { ...this.form.getRawValue() };
    //   formValue = this.dmoControlService.sanitizeFormValueForValidateUniqueness(this.dmos, formValue);

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
    //     Data: [formValue],
    //     ParentTransactionID: this.parentTransactionId,
    //     TempTransactionID: this.tempTransactionID
    //   };

    //   let isvalidateUniqueCons = true;
    //   /*if (submitData.UniqueConstraints != '') {
    //     isvalidateUniqueCons = await this.applicationService.ValidateUniqueDmoValue(submitData).toPromise();
    //   }*/

    //   this.applicationService.ValidateUniqueDmoValue(ValidateData).subscribe(
    //     (resultData: any) => {
    //       isvalidateUniqueCons = resultData;        

    //   if (isvalidateUniqueCons) {
    //     let formValue = { ...this.form.getRawValue() };
    //     formValue = this.dmoControlService.sanitizeFormValue(this.dmos, formValue);

    //     const submitData: any = {
    //       Identifier: {
    //         Name: null,
    //         Value: null,
    //         TrnsctnID: this.transactionId
    //       },
    //       ProcessName: this.processName,
    //       TriggerName: trigger.Name,
    //       UserName: this.currentUser.UserName,
    //       UniqueConstraints: this.uniqueConstraint,
    //       Data: [formValue],
    //       ParentTransactionID: this.parentTransactionId,
    //       TempTransactionID: this.tempTransactionID
    //     };
    //     this.applicationService.insertApplication(submitData).subscribe(value => {
    //       this.IsInserted = true;
    //       if(value && value.statuscode === 200) {
    //         this.dmoImage.upload(value.result.transactionId);
    //       }
    //       this.closeModal();
    //     });
    //   }else {
    //     this.toastr.warning('Record already exists.');
    //   }
    // }
    // );
    //End - #1005
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
  getChildRelation() {
    if (this.ChildDmoGuid && this.ChildDmoGuid[this.processName] && this.ChildDmoGuid[this.processName].ChildProcessDmoGuid) {
      const childGuid = this.ChildDmoGuid[this.processName].ChildProcessDmoGuid;
      const childKey = this.dmos.find(x => x.DMOGuid === childGuid);
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
                this.form.get(childdmoName).disable({onlySelf : true,emitEvent : false});
                this.form.get(childdmoName).markAsDirty();
              } 
            }                                
          }                  
        }
      }); 
    }
      //Entity related code end- Nidhi 
  }
  closeModal() {
    this.activeModal.close(this.IsInserted);
  }
  updateKeyValue(data: any){
    if (data.Data.length > 0 && !!this.UpdateKeyValueDmoReferencedValues) {
      let IsUpdateKeyValCont = false;
      let formUpdateData = [];
      this.UpdateKeyValueDmoReferencedValues.split(',').forEach(element => {
        IsUpdateKeyValCont = true;
        formUpdateData.push({[element] : data.Data.find(x=>x.element=== element[element])[element]});
      });
      const DmoReferencedValues: any = {
        processName: this.processName,
        transactionId: this.transactionId,
        dmoData: formUpdateData
      };
      if (IsUpdateKeyValCont) {
        this.applicationService.UpdateKeyValueDmoReferencedValues(DmoReferencedValues).subscribe();
      }
    } 
  }
}
