import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { FormViewService, ApplicationService, DmoControlService, AuthenticationService, NgbDateFRParserFormatter, BMConditionService, MessageService, ApiService } from '@app/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DmoImageControlService } from '@app/core/services/dmo-image-control.service';
import { UserDetail } from '@app/core/models/user-detail';


@Component({
  selector: 'app-process-form-view',
  templateUrl: './process-form-view.component.html',
  styleUrls: ['./process-form-view.component.scss']
})
export class ProcessFormViewComponent implements OnInit {
  BMId: number;
  BMJSON: any = {};
  WFJSON: any = {};
  form: FormGroup;
  dmos = [];
  bmogCondJson = [];
  triggerCondJson = [];
  processName: string;
  processUrlName: string;
  currentStageGuid: string;
  currentStateGuid: string;
  triggers: any = [];
  formSubmitted = false;
  formTriggered = false;
  transactionId = '';
  tempTransactionID = '';
  currentUser: any;
  router: any;
  parentTransactionId: string;
  submitData: any = {};
  uniqueConstraint: any;
  ParentDmoValue: string;
  ChildDmoGuid: any; 
  isInserted: boolean;
  //Entity related code – Nidhi
  SubProcessChild: any;  
  ParentFormDmoValue:any;
  IsAddCopyRecPermissionChildPro: boolean;
  UpdateKeyValueDmoReferencedValues: any;
  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private dmoControlService: DmoControlService,
    private authenticationService: AuthenticationService,
    private ngbDateFRParserFormatter: NgbDateFRParserFormatter,
    public bmCondition: BMConditionService, public location: Location,
    private msg: MessageService,
    public activeModal: NgbActiveModal,
    private api: ApiService,
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
    this.isInserted = false;
    this.currentUser = this.userDetail;
    //this.processName = sessionStorage.getItem('AppName');    
    this.route.paramMap.subscribe(async params => {
      if (this.processName == undefined)
        this.processName = params.get('process_name');
      this.processUrlName = params.get('process_name');
      if (params.get('parenttranctionId') !== undefined)
        this.parentTransactionId = params.get('parenttranctionId');
      this.formViewService.getBmWfJson(this.processName, "Form").subscribe(response => {
        if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
          this.BMId = response.BM.BMId;
          this.UpdateKeyValueDmoReferencedValues = response.BM.UpdateKeyValueDmoReferencedValues;
          this.uniqueConstraint = response.BM.UniqueConstraint;
          this.BMJSON = response.BM.BusinessModelObjectGroup.Form;
          this.WFJSON = response.WF;
          this.currentStageGuid = Object.keys(this.WFJSON.Stages)[0];
          this.currentStateGuid = Object.keys(this.WFJSON.Stages[this.currentStageGuid].States)[0];
          this.getTriggers();
          this.getForm();

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
              objCOLUMN.DataModelObjects[dmoGUID].Guid = dmoGUID;
              objCOLUMN.DataModelObjects[dmoGUID].BmoGuid = bmoGuid;
              objCOLUMN.DataModelObjects[dmoGUID].DmogGuid = dmogGuid;
              this.dmos.push(objCOLUMN.DataModelObjects[dmoGUID]);
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
    this.form = this.dmoControlService.toFormViewGroup(this.dmos);
    this.GetPlasmaId();
    this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
    this.getChildRelation();
  }
  getChildRelation() {   
    
      //Entity related code start– Nidhi          
    if (!!this.SubProcessChild && this.SubProcessChild.length>0 && this.ParentFormDmoValue) {      
      this.SubProcessChild.forEach(element => {
        if(element.length>0){
          for(var el=0;el<element.length;el++){
            if(this.processName === element[el]['ProcessName']){
              const parentdmoName = element[el]['ParentProcessDmoName'];
              const childdmoName = element[el]['ChildProcessDmoName'];
              const parentKeyValue = this.ParentFormDmoValue.get(parentdmoName).value;
              if(!!parentKeyValue){
                this.form.get(childdmoName).patchValue(parentKeyValue);
                this.form.get(childdmoName).disable();
                this.form.get(childdmoName).markAsDirty();
              } 
            }                                
          }                  
        }
      });     
  }  
      //Entity related code end- Nidhi 

    if (this.ParentDmoValue && this.ChildDmoGuid && this.ChildDmoGuid[this.processName] && this.ChildDmoGuid[this.processName].ChildProcessDmoGuid) {
      const childGuid = this.ChildDmoGuid[this.processName].ChildProcessDmoGuid;
      const childKey = this.dmos.find(x => x.Guid === childGuid);
      if (childKey) {
        if (childKey.Type === 'KeyValueSearchBox') {
          const filterData = {
            "ColumnList": childKey.Value,
            "PageNumber": 0,
            "PageSize": 1,
            "SortColumn": childKey.Value,
            "SortOrder": "asc",
            "TimeZone": -330,
            "ProcessName": childKey.ModelBodyProcessId,
            "SeparatorCondition": "or",
            "IsColumnListOnly": true,
            "GridFilters": [
              {
                "GridConditions": [
                  {
                    "Condition": "CONTAINS",
                    "ConditionValue": this.ParentDmoValue
                  }
                ],
                "DataField": childKey.Key,
                "LogicalOperator": "Or",
                "FilterType": "Column_Filter"
              }
            ]
          }
          this.api.post('listview/getprocessdata', filterData, null).subscribe(result => {
            if (result.Data && result.Data.length > 0) {
              let opt: any;
              if (childKey.Value === childKey.Key) {
                const dval = result.Data[0][childKey.Value];
                opt = { 
                  // ddOptionValue: dval.lastIndexOf('(') > -1 ?dval.substr(dval.lastIndexOf('(') + 1).replace(')', '') : dval, 
                  // ddOptionKey: this.ParentDmoValue 
                 // #MDEI-151 - EXT | MDEE-53 | Changes By Biresh
                  ddOptionKey: result.Data[0][childKey.Value  + '_KEY'], 
                  ddOptionValue:result.Data[0][childKey.Value  + '_VAL']
                }
              } else {
                opt = { ddOptionValue: result.Data[0][childKey.Value], ddOptionKey: this.ParentDmoValue }
              }


              this.form.get(childKey.Name).patchValue(opt);
              this.form.get(childKey.Name).disable();
              this.form.get(childKey.Name).markAsDirty();
            }
          })
        } else {
          this.form.get(childKey.Name).setValue(this.ParentDmoValue);
          this.form.get(childKey.Name).disable();
          this.form.get(childKey.Name).markAsDirty();
        }

      }

    }
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
    //Change Validate Uniqueness Process Ticket - #1005
    let formValue = { ...this.form.getRawValue() };
    formValue = this.dmoControlService.sanitizeFormValue(this.dmos, this.form.getRawValue());
    this.submitData = {
      ProcessName: this.processName,
      TriggerName: trigger.Name,
      UserName: this.currentUser.UserName,
      UniqueConstraints: this.uniqueConstraint,
      TempTransactionID: this.tempTransactionID,
      Data: [formValue]
    };
    if (this.parentTransactionId != undefined) {
      this.submitData.ParentTransactionId = this.parentTransactionId;
    }
    debugger
    this.applicationService.insertApplication(this.submitData).subscribe(data => {
      this.updateKeyValue(this.submitData);
      if (data && data.statuscode === 200) {
        this.dmoImage.upload(data.result.transactionId);
      }
      this.toastr.success('Data saved successfully');
      this.isInserted = true;
      this.closeModal();
    });
    // formValue = this.dmoControlService.sanitizeFormValueForValidateUniqueness(this.dmos, formValue);
    // this.submitData = {
    //   ProcessName: this.processName,
    //   TriggerName: trigger.Name,
    //   UserName: this.currentUser.UserName,
    //   UniqueConstraints: this.uniqueConstraint,
    //   TempTransactionID: this.tempTransactionID,
    //   Data: [formValue]
    // };
    // if (this.parentTransactionId != undefined) {
    //   this.submitData.ParentTransactionId = this.parentTransactionId;
    // }

    //   let isvalidateUniqueCons: any = true;
    //   this.applicationService.ValidateUniqueDmoValue(this.submitData).subscribe(
    //     (resultData: any) => {
    //       isvalidateUniqueCons = resultData;        

    //   if (isvalidateUniqueCons) {
    //     formValue = this.dmoControlService.sanitizeFormValue(this.dmos, this.form.getRawValue());
    //     this.submitData = {
    //       ProcessName: this.processName,
    //       TriggerName: trigger.Name,
    //       UserName: this.currentUser.UserName,
    //       UniqueConstraints: this.uniqueConstraint,
    //       TempTransactionID: this.tempTransactionID,
    //       Data: [formValue]
    //     };
    //     if (this.parentTransactionId != undefined) {
    //       this.submitData.ParentTransactionId = this.parentTransactionId;
    //     }
    //     this.applicationService.insertApplication(this.submitData).subscribe(data => {
    //       if(data && data.statuscode === 200) {
    //         this.dmoImage.upload(data.result.transactionId);
    //       }
    //       this.toastr.success('Data saved successfully');
    //       this.isInserted = true;
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
  closeModal() {
    this.activeModal.close(this.isInserted);
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
