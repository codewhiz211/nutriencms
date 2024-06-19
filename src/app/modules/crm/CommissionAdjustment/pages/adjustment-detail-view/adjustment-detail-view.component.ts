import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { ToastrService } from 'ngx-toastr';

import { FormViewService, DmoControlService, ApplicationService, AuthenticationService, BMConditionService, MessageService } from '@app/core';

import { environment } from '@env/environment';
import { Title } from '@angular/platform-browser';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-adjustment-detail-view',
  templateUrl: './adjustment-detail-view.component.html',
  styleUrls: ['./adjustment-detail-view.component.scss']
})
export class AdjustmentDetailViewComponent implements OnInit {


  BMId: number;
  BMJSON: any = {};
  WFJSON: any = {};
  form: FormGroup;
  dmos = [];
  bmogCondJson = [];
  triggerCondJson = [];
  processName: string;
  transactionId: string;
  applicationData: any = {};

  triggers: any = [];
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
  CanvasType = 'AdminView';
  uniqueConstraint: any;

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
    private titleService: Title,
    private userDetail: UserDetail
  ) { }


  ngOnInit() {
    this.currentUser = this.userDetail;
    this.route.paramMap.subscribe(params => {

      if (this.transactionId === undefined) {
        this.transactionId = params.get('id');
      }

      this.processName = sessionStorage.getItem('AppName');

      if (this.processName === null) {
        this.processName = 'LMKCRMCommissionAdjustment';
        sessionStorage.AppName = 'LMKCRMCommissionAdjustment';
        this.applicationService.getDisplayNameByProcessName(this.processName).subscribe(res => {
          if (res != null) {
            sessionStorage.setItem('DisplayName', res[0].DisplayName);
            this.titleService.setTitle('Nutrien | ' + res[0].DisplayName);
          }
        });
      }

      this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId).subscribe(appData => {
        this.applicationData = appData;
        this.formViewService.getBmWfJson(this.processName, this.CanvasType, this.transactionId).subscribe(response => {
          if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
            this.BMId = response.BM.BMId;
            this.uniqueConstraint = response.BM.UniqueConstraint;
            this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;

            this.WFJSON = response.WF;
            this.getForm();
          } else {
            this.msg.showMessage('Warning', {body: environment.Setting.xmlgeneratemsg});
          }
        });

      });

    });
  }

  isDate(value: string) {
    const regex = /([0-9]){1,2}\/([0-9]{2})\/([0-9]){4}/;
    return value.match(regex);
  }

  getForm() {
    this.BMJSON.List.forEach(bmoGuid => {
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'SubProcess') {
        this.SubProcessNames = this.SubProcessNames === undefined ? this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName :
          this.SubProcessNames + ',' + this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
      }
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'ChildProcess') {
        this.ParentDmoName = this.BMJSON.BusinessModelObjects[bmoGuid].ParentProcessDmoName;
        const childProcessName = this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
        if (childProcessName !== undefined) {
          this.ChildDmoGuid[childProcessName] = { ChildProcessDmoGuid: this.BMJSON.BusinessModelObjects[bmoGuid].ChildProcessDmoGuid };
        }
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
            IsVisible: true,
            IsEnable: true,
            IsRequired: null,
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
                  IsVisible: true,
                  IsEnable: true,
                  IsRequired: objCOLUMN.DataModelObjects[dmoGUID].IsRequired,
                  Name: objCOLUMN.DataModelObjects[dmoGUID].Name,
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
    this.form = this.dmoControlService.toAdminViewFormGroup(this.dmos, this.applicationData);

    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
    this.ParentDmoValue = this.form.controls[this.ParentDmoName] === undefined ? undefined : this.form.controls[this.ParentDmoName].value;
    this.cdr.detectChanges();
    this.form.disable();

  }

  getTriggers() {
    this.triggers = [];
  }

  async triggerSubmit(trigger: any) {
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
    }
    console.log(this.form.value);
    let formValue = { ...this.form.value };

    formValue = this.dmoControlService.sanitizeFormValue(this.dmos, formValue);
    console.log(formValue);

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
    //       } else {
    //         this.toastr.warning('Record already exists.');
    //       }
    //     }
    //   );

    // } else {
    //   this.updateRecord(submitData);
    // }
    this.updateRecord(submitData);
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
      this.router.navigate(['crm/commissionadjustment/LMKCRMCommissionAdjustment']);
  }
  updateRecord(submitData: any){
    this.applicationService.updateApplication(submitData).subscribe(res => {
      this.toastr.success('Data saved successfully');
      this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId).subscribe(data => {
        this.applicationData = data;
        this.form.reset();
        this.bmogCondJson = [];
        this.BMJSON.List.forEach(bmoGuid => {
          this.bmogCondJson[bmoGuid] = {
            IsVisible: true,
            IsEnable: true,
            IsRequired: null,
            Name: this.BMJSON.BusinessModelObjects[bmoGuid].Name,
            isHideFromStageState: false
          };
          if (this.BMJSON.BusinessModelObjects[bmoGuid].List != undefined) {

            this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
              this.bmogCondJson[bmoGuid][dmogGuid] = {
                IsVisible: true,
                IsEnable: true,
                IsRequired: null,
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
                      IsVisible: true,
                      IsEnable: true,
                      IsRequired: objCOLUMN.DataModelObjects[dmoGUID].IsRequired,
                      Name: objCOLUMN.DataModelObjects[dmoGUID].Name,
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

        this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
      });
    });
  }
}


