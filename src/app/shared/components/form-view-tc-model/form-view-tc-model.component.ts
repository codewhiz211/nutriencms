import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  FormViewService,
  ApplicationService,
  DmoControlService,
  AuthenticationService,
  NgbDateFRParserFormatter,
  BMConditionService,
  MessageService
} from '@app/core';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';
import { DmoImageControlService } from '@app/core/services/dmo-image-control.service';
import { UserDetail } from '@app/core/models/user-detail';
@Component({
  selector: 'app-form-view-tc-model',
  templateUrl: './form-view-tc-model.component.html',
  styleUrls: ['./form-view-tc-model.component.scss']
})
export class FormViewTcModelComponent implements OnInit {
  BMId: number;
  BMJSON: any = {};
  WFJSON: any = {};
  form: FormGroup;
  dmos = [];
  bmogCondJson = [];
  triggerCondJson = [];
  processName: string;
  uniqueConstraint: string = '';
  currentStageGuid: string;
  currentStateGuid: string;
  triggers: any = [];
  formSubmitted = false;
  formTriggered = false;
  transactionId = '';
  tempTransactionID = '';
  currentUser: any;
  UpdateKeyValueDmoReferencedValues: any;
  constructor(
    private toastr: ToastrService,
    public activeModal: NgbActiveModal,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private dmoControlService: DmoControlService,
    private authenticationService: AuthenticationService,
    private ngbDateFRParserFormatter: NgbDateFRParserFormatter,
    public bmCondition: BMConditionService,
    private msg: MessageService,
    private dmoImage: DmoImageControlService,
    private userDetail: UserDetail) {

    this.tempTransactionID = this.GetTempTransactionID();

  }
  GetTempTransactionID(): string {
    const Today = new Date();
    let TempTranID = this.userDetail.UserName;
    TempTranID += '_' + Today.getFullYear() + '_' + Today.getMonth() + '_' + Today.getDate();
    TempTranID += '_' + Today.getHours() + '_' + Today.getMinutes() + '_' + Today.getSeconds() + '_' + Today.getMilliseconds();
    return TempTranID;

  }

  ngOnInit() {
    this.currentUser = this.userDetail;
    this.formViewService.getBmWfJson(this.processName, "Form").subscribe(response => {
      if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
        this.BMId = response.BM.BMId;
        this.UpdateKeyValueDmoReferencedValues = response.BM.UpdateKeyValueDmoReferencedValues;
        this.BMJSON = response.BM.BusinessModelObjectGroup.Form;
        this.WFJSON = response.WF;
        this.uniqueConstraint = response.BM.UniqueConstraint;
        this.currentStageGuid = Object.keys(this.WFJSON.Stages)[0];
        this.currentStateGuid = Object.keys(this.WFJSON.Stages[this.currentStageGuid].States)[0];
        var userRole = this.currentUser.ListRole;
        Object.keys(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers).forEach(triggerID => {
          //trigger access associated to user role
          var ActionRoles = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerID].ActionRoles;
          let isShowHideTrigger = false;
          Object.keys(ActionRoles).forEach(roleguid => {
            if (isShowHideTrigger == false)
              isShowHideTrigger = userRole.indexOf(roleguid) > -1 ? true : false;
          });
          if (isShowHideTrigger) {
            this.triggers.push(this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerID]);
            const trigger = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Triggers[triggerID];
            this.triggerCondJson[triggerID] = {
              IsVisible: true, IsEnable: true, Guid: trigger.Guid
            };
          }
        });
        this.getForm();
      } else {
        this.msg.showMessage('Warning', { body: environment.Setting.xmlgeneratemsg });
        // this.msg.showErrorMessage(environment.Setting.xmlgeneratemsg, 'Message', 'Ok', null, false, true, false, '');
        this.activeModal.dismiss();
      }
    });

  }

  getForm() {
    this.BMJSON.List.forEach(bmoGuid => {
      this.bmogCondJson[bmoGuid] = {
        IsVisible: true,
        IsEnable: true,
        isRequired: null,
        Name: this.BMJSON.BusinessModelObjects[bmoGuid].Name,
        isHideFromStageState: false
      };
      this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
        const isDMOGHiddenType = this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].IsHidden === undefined ? false
          : this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].IsHidden;
        this.bmogCondJson[bmoGuid][dmogGuid] = {
          IsVisible: isDMOGHiddenType === true ? false : true,
          IsEnable: true,
          isRequired: null,
          Name: this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Name,
          isHideFromStageState: false
        };
        this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
          this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
            objCOLUMN.List.forEach(dmoGUID => {
              objCOLUMN.DataModelObjects[dmoGUID].Guid = dmoGUID;
              objCOLUMN.DataModelObjects[dmoGUID].BmoGuid = bmoGuid;
              objCOLUMN.DataModelObjects[dmoGUID].DmogGuid = dmogGuid;
              this.dmos.push(objCOLUMN.DataModelObjects[dmoGUID]);
              this.bmogCondJson[bmoGuid][dmogGuid][dmoGUID] = {
                IsVisible: true,
                IsEnable: true,
                IsRequired: isDMOGHiddenType === true ? false : objCOLUMN.DataModelObjects[dmoGUID].IsRequired,
                Name: objCOLUMN.DataModelObjects[dmoGUID].Name,
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
    this.form = this.dmoControlService.toFormViewGroup(this.dmos);
    this.GetPlasmaId();
    this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);

  }

  triggerSubmit(trigger: any) {
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

    //let formValue = {...this.form.value}
    let formValue = this.form.getRawValue();//For getting Disabled formcontrol value
    //Change Validate Uniqueness Process Ticket - #1005
    formValue = this.dmoControlService.sanitizeFormValue(this.dmos, this.form.getRawValue());

    const submitData: any = {
      ProcessName: this.processName,
      TriggerName: trigger.Name,
      UserName: this.currentUser.UserName,
      UniqueConstraints: this.uniqueConstraint,
      Data: [formValue],
      ParentTransactionID: '-1',
      TempTransactionID: this.tempTransactionID,
      IsBulkUpload: 'true'

    };
    this.applicationService.insertApplication(submitData).subscribe(data => {
      if (data && data.statuscode === 200) {
        this.updateKeyValue(submitData);
        this.dmoImage.upload(data.result.transactionId);
      }
      this.activeModal.close(true);
    });

    // formValue = this.dmoControlService.sanitizeFormValueForValidateUniqueness(this.dmos, formValue);

    // const ValidateData: any = {
    //   ProcessName: this.processName,
    //   TriggerName: trigger.Name,
    //   UserName: this.currentUser.UserName,
    //   UniqueConstraints: this.uniqueConstraint,
    //   Data: [formValue],
    //   ParentTransactionID: '-1',
    //   TempTransactionID: this.tempTransactionID,
    //   IsBulkUpload: 'true'

    // };
    // this.applicationService.ValidateUniqueDmoValue(ValidateData).subscribe(
    //   (resultData: any) => {
    //     if (resultData == true) {
    //       formValue = this.dmoControlService.sanitizeFormValue(this.dmos, this.form.getRawValue());

    //       const submitData: any = {
    //         ProcessName: this.processName,
    //         TriggerName: trigger.Name,
    //         UserName: this.currentUser.UserName,
    //         UniqueConstraints: this.uniqueConstraint,
    //         Data: [formValue],
    //         ParentTransactionID: '-1',
    //         TempTransactionID: this.tempTransactionID,
    //         IsBulkUpload: 'true'

    //       };
    //       this.applicationService.insertApplication(submitData).subscribe(data => {
    //         if(data && data.statuscode === 200) {
    //           this.dmoImage.upload(data.result.transactionId);
    //         }
    //         this.activeModal.close(true);
    //       });
    //     }
    //     else {
    //       this.toastr.warning('Record already exists.');
    //     }
    //   }
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

  GetPlasmaId() {
    this.dmos.forEach((dmo: any) => {
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
