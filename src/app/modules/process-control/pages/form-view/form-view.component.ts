import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormViewService, DmoControlService, ApplicationService, AuthenticationService, BMConditionService, MessageService } from '@app/core';
import { environment } from '@env/environment';
import { UserDetail } from '@app/core/models/user-detail';
@Component({
  selector: 'app-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss']
})
export class FormViewComponent implements OnInit {

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
  ChildDmoGuid = {};
  CanvasType: string = 'AdminView';
  uniqueConstraint:any;
  UpdateKeyValueDmoReferencedValues: any; // update key value referance  process

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private dmoControlService: DmoControlService,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    public location: Location, private bmCondition: BMConditionService, private msg: MessageService,
    private userDetail: UserDetail) { }

  isEContractRecords() {
    return this.processUrlName === 'LMKCRMEContractsRecords';
  }

  ngOnInit() {
    this.currentUser = this.userDetail;
    this.route.paramMap.subscribe(params => {

      if (this.transactionId === undefined) {
        this.transactionId = params.get('id');
      }

      this.processUrlName = params.get('process_name');
      this.processName = sessionStorage.getItem('AppName');
      if (this.processName === 'LMKOpportunities') {
        this.CanvasType = 'View4';
      } else {
        this.CanvasType = 'AdminView';
      }
      this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId).subscribe(appData => {
        this.applicationData = appData;
        this.applicationService.getTopCornerDetail(null, null, this.CanvasType, this.transactionId).subscribe(topDetails => {
          this.topCornerDetails = topDetails;

          this.currentStageGuid = this.applicationData.ApplicationInfo[0].StagGuid;
          this.currentStateGuid = this.applicationData.ApplicationInfo[0].StateGuid;
          if (!this.isEContractRecords()) {
            this.formViewService.getBmWfJson(this.processName, this.CanvasType, this.transactionId).subscribe(response => {
              if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
                this.BMId = response.BM.BMId;
                this.UpdateKeyValueDmoReferencedValues = response.BM.UpdateKeyValueDmoReferencedValues;
                this.uniqueConstraint = response.BM.UniqueConstraint;
                if (this.processName === 'LMKOpportunities') {
                  this.BMJSON = response.BM.BusinessModelObjectGroup.View4;
                } else {
                  this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
                }
                this.BMJSON.List.push('notes');
                this.BMJSON.List.push('notification');
                this.BMJSON.List.push('activitylog');
                this.BMJSON.List.push('history');
                this.BMJSON.BusinessModelObjects.notes = { Type: 'Log', DisplayName: 'Notes' };
                this.BMJSON.BusinessModelObjects.activitylog = { Type: 'Log', DisplayName: 'Activity Log' };
                this.BMJSON.BusinessModelObjects.history = { Type: 'Log', DisplayName: 'Change Log' };
                this.BMJSON.BusinessModelObjects.notification = { Type: 'Log', DisplayName: 'Notification' };
                this.WFJSON = response.WF;
                this.getForm();
              } else {
                this.msg.showMessage('Warning', {body: environment.Setting.xmlgeneratemsg});
                // this.msg.showErrorMessage(environment.Setting.xmlgeneratemsg, 'Message', 'Ok', null, false, true, false, '');
              }
            });
          }
        });
      });

    });
  }

  getForm() {
    this.BMJSON.List.forEach(bmoGuid => {
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'SubProcess') {
        this.SubProcessNames = this.SubProcessNames === undefined ? this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName : this.SubProcessNames + "," + this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
      }
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'ChildProcess') {
        this.ParentDmoName = this.BMJSON.BusinessModelObjects[bmoGuid].ParentProcessDmoName;
        let childProcessName = this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
        if (childProcessName != undefined)
          this.ChildDmoGuid[childProcessName] = { ChildProcessDmoGuid: this.BMJSON.BusinessModelObjects[bmoGuid].ChildProcessDmoGuid };
      }
      this.bmogCondJson[bmoGuid] = {
        IsVisible: true,
        IsEnable: true,
        IsRequired: null,
        Name: this.BMJSON.BusinessModelObjects[bmoGuid].Name,
        isHideFromStageState: false
      };
      if (this.BMJSON.BusinessModelObjects[bmoGuid].List !== undefined) {

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
    this.dmoControlService.CurrentState = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid];
    this.wfosType = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].WfosType;
    this.wfosName = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Name;
    this.form = this.dmoControlService.toAdminViewFormGroup(this.dmos, this.applicationData);
    this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
    this.ParentDmoValue = this.form.controls[this.ParentDmoName] === undefined ? undefined : this.form.controls[this.ParentDmoName].value;
    this.cdr.detectChanges();
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
        if (this.form.controls[controlKey].valid === false) {
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

    let formValue = { ...this.form.value };

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
    this.updateRecord(submitData);

    // check condition if user change any value then validate uniqueness.
    // if (formValue && Object.keys(formValue).length > 0) {
    //   const ValidateValue = this.dmoControlService.sanitizeFormValueForValidateUniqueness(this.dmos, this.form.value)
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
  updateRecord(submitData: any) {
    this.applicationService.updateApplication(submitData).subscribe(res => {
      this.updateKeyValue(submitData);
      this.toastr.success('Data saved successfully');
      this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId).subscribe(data => {
        this.applicationData = data;
        this.currentStageGuid = this.applicationData.ApplicationInfo[0].StagGuid;
        this.currentStateGuid = this.applicationData.ApplicationInfo[0].StateGuid;
        this.form.reset();
        this.bmogCondJson = [];
        this.BMJSON.List.forEach(bmoGuid => {
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
        this.form = this.dmoControlService.toAdminViewFormGroup(this.dmos, this.applicationData);
        this.getTriggers();
        this.dmoControlService.CurrentStage = this.WFJSON.Stages[this.currentStageGuid];
        this.dmoControlService.CurrentState = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid];
        this.wfosType = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].WfosType;
        this.wfosName = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Name;
        this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
        this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
      });
    });
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
