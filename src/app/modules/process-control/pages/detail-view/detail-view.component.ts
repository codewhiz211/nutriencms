import { Component, OnInit, ChangeDetectorRef, Input, ElementRef, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { first } from 'rxjs/operators';
import { environment } from '@env/environment';

import {
  FormViewService,
  DmoControlService,
  ApplicationService,
  BMConditionService,
  MessageService,
  ListviewService,
  DocumentViewService,
  DmoImageControlService,
  LMService,
  AuthenticationService
} from '@app/core';
import { LotSearchService } from '@app/modules/crm/lots/services/lot-search.service';

import { TabComponent } from '@app/shared';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent implements OnInit, OnDestroy {

  @Input() transactionId: string;
  @Input() processUrlName: string;

  @ViewChildren(TabComponent) tabs !: QueryList<TabComponent>;

  dateFormat: string = environment.Setting.dateTimeFormat;
  vendorPICList: any;

  BMId: number;
  BMJSON: any = {};
  WFJSON: any = {};
  form: FormGroup;
  dmos = [];
  bmogCondJson = [];
  triggerCondJson = [];
  processName: string;
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
  SubProcessChild = []; //Entity related code – Nidhi
  CanvasType = 'AdminView';
  uniqueConstraint: any;
  isCrop = true;
  UseAsMedia = true;
  IsPermissionSet = false;
  IsChangeLogAllow: any;
  IsNotesAllow: any;
  IsNotificationAllow: any;
  IsActivityLogAllow: any;
  processNameInternal: string;
  currentListingType: any;
  ChildProcessPageLoad = false;
  ProcessType: any;
  IsAddCopyRecPermissionChildPro = true;
  UpdateKeyValueDmoReferencedValues: any; // update key value referance  process
  private bmosWithHiddenTriggers = ['lmkcustadddetails', 'lmkcustpic', 'lmkvendorcommission', 'lmkvendorpayterm', 'lmkcustomeragent', 'lmkesalebmoavattachbmo', 'bids', 'notes', 'notification', 'activitylog', 'history'];

  constructor(
    private spinner: SpinnerVisibilityService,
    private lm: LMService,
    private el: ElementRef,
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
    private documentServie: DocumentViewService,
    private lotSearchService: LotSearchService,
    private titleService: Title,
    private listviewService: ListviewService,
    private dmoImage: DmoImageControlService,
    private userDetail: UserDetail,
    private datePipe: DatePipe) { }

  isEContractRecords() {
    return this.processUrlName === 'LMKCRMEContractsRecords';
  }


  get listingPublished() {
    return (
      (this.currentStageGuid === 'lmkeslyrdbidnoffer' && this.currentStateGuid !== 'lmkeslyrdbireview') ||
      (this.currentStageGuid === 'lmkeslyrdclassified' && this.currentStateGuid !== 'lmkeslyrdcllive')
    );
  }

  ngOnInit() {
    this.documentServie.clearPendingFileList();
    this.currentUser = this.userDetail;
    this.route.paramMap.subscribe(params => {
      if (this.transactionId == null) {
        this.transactionId = params.get('id');
      }

      if (this.processUrlName == null) {
        this.processUrlName = params.get('process_name');
      }

      this.processName = sessionStorage.getItem('AppName');
      this.processNameInternal = sessionStorage.getItem('AppName');
      if (this.processName === '' || this.processName == null) {
        this.getProcessName();
      }
      if (this.processName === 'LMKOpportunities') {
        this.documentServie.isAttachmentGridView = true;
        this.CanvasType = 'View4';
      } else {
        this.CanvasType = 'AdminView';
      }
      this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId)
        .pipe(first())
        .subscribe(appData => {
          this.applicationData = appData;
          this.applicationService.getTopCornerDetail(null, null, this.CanvasType, this.transactionId)
            .pipe(first())
            .subscribe(topDetails => {
              this.topCornerDetails = topDetails;
              if (this.applicationData.ApplicationInfo[0]) {
                this.currentStageGuid = this.applicationData.ApplicationInfo[0].StagGuid;
                this.currentStateGuid = this.applicationData.ApplicationInfo[0].StateGuid;
              }
              if (this.applicationData.DataInformation['lmkopesdmololistingtype'] !== undefined) {
                this.currentListingType = this.applicationData.DataInformation['lmkopesdmololistingtype'].DMOVAL;
              }

          if (!this.isEContractRecords()) {
            this.getBMWFJson();
          }
        });
      });

    });
    this.lm.isTriggerClick = false;
    this.lm.lmActive = true;
  }

  private getBMWFJson() {
    this.formViewService.getBmWfJson(this.processName, this.CanvasType, this.transactionId)
      .pipe(first())
      .subscribe(async response => {
      if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
          this.spinner.hide();
          this.BMId = response.BM.BMId;
          this.uniqueConstraint = response.BM.UniqueConstraint;
          this.UpdateKeyValueDmoReferencedValues = response.BM.UpdateKeyValueDmoReferencedValues;
          if (this.processName === 'LMKOpportunities') {
            this.BMJSON = response.BM.BusinessModelObjectGroup.View4;
          } else {
            this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
          }
          //Get Permission For BMOG (Notes, Notification, Activity Log & Change Log)
          const data = await this.listviewService.userActionPermission(this.processName).toPromise();
          if (data) {
            this.IsNotesAllow = data.IsNotesAllow;
            this.IsNotificationAllow = data.IsNotificationAllow;
            this.IsActivityLogAllow = data.IsActivityLogAllow;
            this.IsChangeLogAllow = data.IsChangeLogAllow;
            if (this.IsNotesAllow === true) {
              this.BMJSON.List.push('notes');
              this.BMJSON.BusinessModelObjects.notes = {
                Type: 'Log',
                DisplayName: 'Notes'
              };
            }
            if (this.IsNotificationAllow === true) {
              this.BMJSON.List.push('notification');
              this.BMJSON.BusinessModelObjects.notification = {
                Type: 'Log',
                DisplayName: 'Notification'
              };
            }
            if (this.IsActivityLogAllow === true) {
              this.BMJSON.List.push('activitylog');
              this.BMJSON.BusinessModelObjects.activitylog = {
                Type: 'Log',
                DisplayName: 'Activity Log'
              };
            }
            if (this.IsChangeLogAllow === true) {
              this.BMJSON.List.push('history');
              this.BMJSON.BusinessModelObjects.history = {
                Type: 'Log',
                DisplayName: 'Change Log'
              };
            }
          }

          if (this.processUrlName === 'LMKESaleyardListings' && this.currentListingType === 'Bid & Offer') {
            this.BMJSON.List.push('bids');
            this.BMJSON.BusinessModelObjects.bids = {
              Type: 'Log',
              DisplayName: 'Bids'
            };
            const bids = this.BMJSON.List.pop();
            const [vendor, listingDetails, ...rest] = this.BMJSON.List.slice(0, this.BMJSON.List.length);
            this.BMJSON.List = [vendor, listingDetails, bids, ...rest];
          }

          this.WFJSON = response.WF;
          this.getForm();
          if (this.processUrlName === 'LMKESaleyardListings') {
            if (this.form.get('LMKESaleDMO_SAPAcctNumber').value != null) {
              if (this.form.get('LMKESaleDMO_Address') !== undefined && this.form.get('LMKESaleDMO_VendorTown') !== undefined &&
                this.form.get('LMKESaleDMO_VendrPostcode') !== undefined && this.form.get('LMKESale_VendrDomBrch') !== undefined) {
                this.form.get('LMKESaleDMO_Address').markAsDirty();
                this.form.get('LMKESaleDMO_VendorTown').markAsDirty();
                this.form.get('LMKESaleDMO_VendrPostcode').markAsDirty();
                this.form.get('LMKESale_VendrDomBrch').markAsDirty();
              }
              const vendorSapNo = this.form.controls.LMKESaleDMO_SAPAcctNumber.value;
              if (vendorSapNo != null && vendorSapNo !== '' && vendorSapNo !== undefined) {
                this.lotSearchService.getVendorPIC(vendorSapNo)
                  .pipe(first())
                  .subscribe(res => {
                    this.vendorPICList = res;
                    if (this.vendorPICList.length === 1) {
                      this.form.get('LMKESaleDMO_VendorPIC').patchValue(res[0].dmocuspiccustpic);
                      this.form.get('LMKESaleDMO_VendorPIC').markAsDirty();
                    }
                  });
              }
            }
          }
          if (this.processName === 'LMKConfigFeeNCharges') {
            if (this.form.get('DMOFEECONF_CalcType') !== undefined) {
              this.form.get('DMOFEECONF_CalcType').markAsDirty();
            }
          }
        } else {
          this.msg.showMessage('Warning', {
            body: environment.Setting.xmlgeneratemsg
          });
        }
      });
  }

  public isDate(value: string) {
    const regex = /([0-9]){1,2}\/([0-9]{2})\/([0-9]){4}/;
    return value && value.match(regex);
  }

  public onGridDataChange(event: any) {
    this.lm.retrieveGridData(event);
  }

  getForm() {    
    this.dmos = [];
    this.BMJSON.List.forEach(bmoGuid => {
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'SubProcess') {
        this.SubProcessNames = this.SubProcessNames === undefined ? this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName : this.SubProcessNames + "," + this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
      }
      if (this.BMJSON.BusinessModelObjects[bmoGuid].Type === 'ChildProcess') {        
        this.ParentDmoName = this.BMJSON.BusinessModelObjects[bmoGuid].ParentProcessDmoName;
        let childProcessName = this.BMJSON.BusinessModelObjects[bmoGuid].ProcessName;
        if (childProcessName != undefined) {
          this.ChildDmoGuid[childProcessName] = {
            ChildProcessDmoGuid: this.BMJSON.BusinessModelObjects[bmoGuid].ChildProcessDmoGuid
          };
          localStorage.setItem(childProcessName + '~~~DownloadBulkTemp', this.BMJSON.BusinessModelObjects[bmoGuid].DisplayName);
          this.ProcessType = 'ChildProcess';
        }
        //Entity related code – Nidhi        
        if(!!this.BMJSON.BusinessModelObjects[bmoGuid].SubProcessChildDMO){
          this.SubProcessChild.push(this.BMJSON.BusinessModelObjects[bmoGuid].SubProcessChildDMO);
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
          const isDMOGHiddenType = this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].IsHidden === undefined ? false :
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].IsHidden;
          this.bmogCondJson[bmoGuid][dmogGuid] = {
            IsVisible: isDMOGHiddenType === true ? false : true,
            IsEnable: true,
            IsRequired: null,
            Name: this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Name,
            isHideFromStageState: false
          };
          if (this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Type !== 'Grid') {
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
              this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
                objCOLUMN.List.forEach(dmoGUID => {
                  const dmoData = {
                    ...objCOLUMN.DataModelObjects[dmoGUID]
                  };
                  dmoData.DMOGuid = dmoGUID;
                  dmoData.BmoGuid = bmoGuid;
                  dmoData.DmogGuid = dmogGuid;
                  this.dmos.push(dmoData);
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
          }
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
    this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
    this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
    this.ParentDmoValue = this.form.controls[this.ParentDmoName] === undefined ? undefined :
      this.form.controls[this.ParentDmoName].value.ddOptionKey == undefined ? this.form.controls[this.ParentDmoName].value : this.form.controls[this.ParentDmoName].value.ddOptionKey;
    this.cdr.reattach();
    this.cdr.detectChanges();



    if (this.processName === 'LMKCRMCommissionAdjustment' && this.dmoControlService.CurrentState.DisplayName === 'Complete') {
      this.form.disable();
    }
    if (this.processName === 'LMKOpportunities') {
      if (this.listingPublished) {
        // this.form.disable(); Git Demo
        // make disabled dropdowns of the same color as the rest of the form fields
        //const dropdowns = document.querySelectorAll('.ng-select-container');
        //dropdowns.forEach(dropdown => (dropdown as HTMLElement).style.background = '#E9ECEF');
      }
      this.lm.reactToListingTypeChange(this.form);
      this.lm.reactToProductCategoryChange(this.form);
      this.lm.reactToProductChange(this.form);
      this.lm.populatePICField(this.form).toPromise()
        .then(numbers => this.vendorPICList = numbers)

      // const ageDmoClass = document.getElementById('DmgTablelmkopeshiddendmog');
      // if (ageDmoClass) {
      //   ageDmoClass.className = 'ageDmoClass';
      // }
      // const saleInfo = document.getElementById('DmgTablelmkoppdmgrvsaleinfo');
      // if (saleInfo) {
      //   saleInfo.className = 'ageDmoClass';
      //   this.form.get('LMKOPESDMO_Title').clearValidators();
      //   this.form.get('LMKOPESDMO_Title').updateValueAndValidity();
      //   this.form.get('LMKOPECDMO_SaleType').clearValidators();
      //   this.form.get('LMKOPECDMO_SaleType').updateValueAndValidity();
      // }
    }
  }

  hideTriggersForBMO(bmoGUID: string) {
    if (this.processName === 'LMKOpportunities') {
      this.bmosWithHiddenTriggers = this.bmosWithHiddenTriggers.filter(guid => guid !== 'lmkesalebmoavattachbmo')
    }
    return !!this.bmosWithHiddenTriggers.find(guid => guid === bmoGUID)
  }


  getTriggers() {
    this.triggers = [];
    var userRole = this.currentUser.ListRole;;
    if (this.WFJSON.Stages[this.currentStageGuid] &&
      this.WFJSON.Stages[this.currentStageGuid].States &&
      this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid]) {
        // End State Check for child process add & Copy record permissions
        if(this.applicationData.ApplicationInfo[0]?.StateFriendlyName === this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].EndState){
          this.IsAddCopyRecPermissionChildPro =  false;
        }

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

  isFormValid(): boolean {
    return this.form.disabled ? true : this.form.valid;
  }

  private allowedToUploadAttachmentsFiles(triggerName: string) {
    const allowedTriggers = [
      'TRGR_CL_LIVE_Save', // Publish Updates for Classified
      'TRGR_BI_Review_Save', // Save for Bid & Offer
      'TRGR_BI_REVIEW_SUBMIT', // Publish for Bid & Offer
    ];
    return allowedTriggers.some(name => name === triggerName);
  }


  async triggerSubmit(trigger: any) {      
    if (trigger.ActionName === 'Submit') {
      this.formSubmitted = true;
      this.formTriggered = false;
      this.applicationService.checkValidations();
      if (!this.isFormValid()) {
        setTimeout(() => {
          const activateTab = this.tabs.filter(tab => tab.active)[0];
          const allInvalidElements = activateTab.el.nativeElement.querySelectorAll('.accordion-item--isInvalidForm');
          if (allInvalidElements.length) {
            allInvalidElements[0].scrollIntoView({
              behavior: 'smooth'
            });
          } else {
            const tabsElement = this.el.nativeElement.querySelector('app-tabs');
            tabsElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
        });
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

    if (trigger.Guid === 'trgrbireviewsubmit') {
      if (!this.lm.weightAndBreedGridsVerified(this.form)) {
        this.msg.showMessage('Warning', {
          body: 'At least one entry is required under Breeding Details and Liveweight tables.'
        });
        return;
      }
    }

    if (this.processName === 'LMKOpportunities') {
      if (trigger.Guid === 'trgrbireviewsubmit') {
        const pendingFilesLength = this.documentServie.pendingFilesLength;
        if (pendingFilesLength === 0) {
          const response = await this.documentServie.hasActiveAndFeaturedImage(this.transactionId);
          if (!response.featured && response.active) {
            this.msg.showMessage('Fail', {
              header: 'Select a Featured Image',
              body: 'Listing must have at least one active featured image',
            });
            return;
          } else if (response.featured && !response.active) {
            this.msg.showMessage('Fail', {
              header: 'Featured Image Is Not Active',
              body: 'Listing must have at least one active featured image',
            });
            return;
          } else if (!response.featured && !response.active) {
            this.msg.showMessage('Fail', {
              header: 'Image Not Found',
              body: 'Listing must have at least one active featured image',
            });
            return;
          }
        }
        //Check Validation for StartDateTime it should not be less then to publish datetime.        
        let minadd = new Date();
        const current_date = this.datePipe.transform(formatDate(minadd, 'yyyy-MM-dd HH:mm:ss', 'en-US'), 'yyyy-MM-dd HH:mm:ss');
        if(!!this.form.get('LMKOPESDMO_BidStartDT') && !!this.form.get('LMKOPESDMO_BidStartDT').value){
          const val = this.form.get('LMKOPESDMO_BidStartDT').value.split('/');
          const comp_dates = val[1] + '/' + val[0] + '/' + val[2];
          const startDateTime = this.datePipe.transform(comp_dates, 'yyyy-MM-dd HH:mm:ss');
          if (current_date > startDateTime) {
            this.toastr.error('Unable to publish. Bidding Start Date/Time has passed.');
            return;
          } 
        }              
      }
      if (trigger.ActionName === 'Submit') {
        this.lm.enableLMControlsOnSubmit(this.form);
      }
    }
    let formValue = this.form.getRawValue();
    //let formValue = { ...this.form.value };
    formValue = this.dmoControlService.getDirtyValues(this.form);
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
    //Changes For Update Key Value
    let updateKeyValueFormValue = this.form.getRawValue();
    const updateKeyValuesubmitData: any = {
      Identifier: {
        Name: null,
        Value: null,
        TrnsctnID: this.transactionId
      },
      ProcessName: this.processName,
      TriggerName: trigger.Name,
      UserName: this.currentUser.UserName,
      UniqueConstraints: this.uniqueConstraint,
      Data: [updateKeyValueFormValue]
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
    //       } else {
    //         this.toastr.warning('Record already exists.');
    //       }
    //     }
    //   );
    // } else {
    //   this.updateRecord(submitData);
    // }
    this.applicationService.getTriggerConfirmMsg(this.processName, trigger.Guid)
      .pipe(first())
      .subscribe(Data => {
        //this.updateRecord(submitData);
        if (Data && Data.length > 0) {
          let isConfirmMsgExists = false;
          const fVal = {
            ...this.form.value
          };
          for (var i = 0, len = Data.length; i < len; i++) {
            const dmoDetail = this.dmos.find(x => x.DMOGuid == Data[i].DmoGuid);
            if (dmoDetail) {
              if (this.validateConfirmMsg(Data[i].Operator, fVal[dmoDetail.Name], dmoDetail.Type)) {
                isConfirmMsgExists = true;
                const bodymsg = Data[i].ConfirmMsg || 'Record with future Active To date cannot be expired, Please change it and try again.';
                this.msg.showMessage('Warning', {
                  body: bodymsg,
                  isConfirmation: false,
                  btnText: 'Ok'
                }).result.then(result => {
                  if (result) {
                    this.updateRecord(submitData,updateKeyValuesubmitData);
                  }
                });
                break;
              } else {
                isConfirmMsgExists = false;
              }
            }
          }
          if (!isConfirmMsgExists) {
            this.updateRecord(submitData,updateKeyValuesubmitData);
          }
        } else {
          this.updateRecord(submitData,updateKeyValuesubmitData);
        }
      });
    //End - #1005
        //Update Referanced Key Values
        // if (formValue && Object.keys(formValue).length > 0 && !!this.UpdateKeyValueDmoReferencedValues) {
        //   let IsUpdateKeyValCont = false;
        //   let formUpdateData = [];
        //   this.UpdateKeyValueDmoReferencedValues.split(',').forEach(element => {
        //     IsUpdateKeyValCont = true;
        //     formUpdateData.push({[element] : formValue[element]});
        //   });
        //   const DmoReferencedValues: any = {
        //     processName: this.processName,
        //     transactionId: this.transactionId,
        //     dmoData: formUpdateData
        //   };
        //   if (IsUpdateKeyValCont) {
        //     this.applicationService.UpdateKeyValueDmoReferencedValues(DmoReferencedValues).subscribe();
        //   }
        // } 
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
          const {
            year,
            month,
            day
          } = dmoValue;
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
    if (isShowHideTrigger) {
      isShowHideTrigger = this.triggerCondJson[trigger.Guid].IsVisible;
    }
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
          this.applicationService.checkSubProcessRecordCount(processrecord)
            .pipe(first())
            .subscribe(
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
    if (this.processName === 'LMKCRMCommissionAdjustment') {
      this.router.navigate(['crm/commissionadjustment', this.processUrlName]);
    } else {
      this.router.navigate(['process_control', this.processUrlName]);
    }
  }

  getProcessName() {
    const url = (this.router.url).split('/');
    if (this.processName == null || this.processName === '') {
      if (url[2] === 'LMKESaleyardListings') {
        this.processName = 'LMKOpportunities';
        sessionStorage.AppName = 'LMKOpportunities';
      } else {
        this.processName = url[2];
        sessionStorage.AppName = url[2];
      }
      if (this.processName !== '') {
        this.applicationService.getDisplayNameByProcessName(this.processName)
          .pipe(first())
          .subscribe(res => {
            if (res != null && res.length > 0) {
              sessionStorage.setItem('DisplayName', res[0].DisplayName);
              this.titleService.setTitle('Nutrien | ' + res[0].DisplayName);
            }
          });
      }
    }
  }

  ngOnDestroy() {    
    if (this.processName === 'LMKOpportunities') {
      this.lm.unsubscribeFromEvents();
    }
    sessionStorage.setItem('processName', this.processNameInternal);
    if (this.bmCondition.BmogJson && this.bmCondition.BmogJson.BusinessModelObjects) {
      Object.keys(this.bmCondition.BmogJson.BusinessModelObjects).forEach(element => {
        if (this.bmCondition.BmogJson.BusinessModelObjects[element].Type === 'ChildProcess') {
          const pName = this.bmCondition.BmogJson.BusinessModelObjects[element].ProcessName;
          sessionStorage.removeItem(pName + 'gridsort');
          sessionStorage.removeItem(pName + 'gridFlters');
          sessionStorage.removeItem(pName + 'gridPage');
        }
      });
    }
  }
  updateRecord(submitData: any,updateKeyValuesubmitData:any) {
    if (this.processName === 'LMKOpportunities') {
      if (this.allowedToUploadAttachmentsFiles(submitData.TriggerName)) {
        this.documentServie.uploadFiles().toPromise();
        this.dmoImage.upload(this.transactionId);
      }
    } else {
      this.dmoImage.upload(this.transactionId);
    }
    this.applicationService.updateApplication(submitData)
      .pipe(first())
      .subscribe(res => {
        this.updateKeyValue(updateKeyValuesubmitData);
        this.toastr.success('Data saved successfully');
        this.lm.isTriggerClick = true;
        this.applicationService.getApplicationData(null, null, this.CanvasType, this.transactionId)
          .pipe(first())
          .subscribe(data => {
            this.applicationData = data;
            this.currentStageGuid = this.applicationData.ApplicationInfo[0].StagGuid;
            this.currentStateGuid = this.applicationData.ApplicationInfo[0].StateGuid;
            this.applicationService.getTopCornerDetail(null, null, this.CanvasType, this.transactionId)
              .pipe(first())
              .subscribe(topDetails => {
                this.topCornerDetails = topDetails;
              });

        if (this.processName === 'LMKOpportunities') {
          this.cdr.detach();
          this.getBMWFJson();
        } else {
          // Reload form 
          this.getBMWFJsonInternal();
        }
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
  private getBMWFJsonInternal() {
    this.formViewService.getBmWfJson(this.processName, this.CanvasType, this.transactionId)
      .pipe(first())
      .subscribe(async response => {
        if (response.BM !== undefined && response.WF !== undefined && response.BM !== null && response.WF !== null) {
          this.spinner.hide();
          this.BMId = response.BM.BMId;
          this.uniqueConstraint = response.BM.UniqueConstraint;
          if (this.processName === 'LMKOpportunities') {
            this.BMJSON = response.BM.BusinessModelObjectGroup.View4;
          } else {
            this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
          }

        if (this.IsNotesAllow === true) {
          this.BMJSON.List.push('notes');
          this.BMJSON.BusinessModelObjects.notes = {
            Type: 'Log',
            DisplayName: 'Notes'
          };
        }
        if (this.IsNotificationAllow === true) {
          this.BMJSON.List.push('notification');
          this.BMJSON.BusinessModelObjects.notification = {
            Type: 'Log',
            DisplayName: 'Notification'
          };
        }
        if (this.IsActivityLogAllow === true) {
          this.BMJSON.List.push('activitylog');
          this.BMJSON.BusinessModelObjects.activitylog = {
            Type: 'Log',
            DisplayName: 'Activity Log'
          };
        }
        if (this.IsChangeLogAllow === true) {
          this.BMJSON.List.push('history');
          this.BMJSON.BusinessModelObjects.history = {
            Type: 'Log',
            DisplayName: 'Change Log'
          };
        }
        this.bmogCondJson = [];
        this.BMJSON.List.forEach(bmoGuid => {
          this.bmogCondJson[bmoGuid] = {
            IsVisible: true,
            IsEnable: true,
            IsRequired: null,
            Name: this.BMJSON.BusinessModelObjects[bmoGuid].Name,
            isHideFromStageState: false
          };
          if (this.BMJSON.BusinessModelObjects[bmoGuid].List != null) {
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
                    this.bmogCondJson[bmoGuid][dmogGuid][dmoGUID] = {
                      IsVisible: true,
                      IsEnable: true,
                      IsRequired: objCOLUMN.DataModelObjects[dmoGUID].IsRequired,
                      Name: objCOLUMN.DataModelObjects[dmoGUID].Name,
                      Type: objCOLUMN.DataModelObjects[dmoGUID].Type,
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
        this.dmoControlService.CurrentStage = this.WFJSON.Stages[this.currentStageGuid];
        this.dmoControlService.CurrentState = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid];
        if (this.dmoControlService.CurrentState) {
          this.wfosType = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].WfosType;
          this.wfosName = this.WFJSON.Stages[this.currentStageGuid].States[this.currentStateGuid].Name;
        }
        this.bmCondition.LoadBMConditiononPageLoad(this.BMJSON, this.form, this.bmogCondJson, this.triggerCondJson);
        this.bmCondition.LoadWFConditiononPageLoad(this.WFJSON, this.currentStageGuid, this.currentStateGuid, this.BMId, this.form, this.bmogCondJson, this.BMJSON);
      }
    });
  }
  getUserLocalDate(item) {
    let userDate = this.dmoControlService.getUserDateTime(item.Value, this.dateFormat, this.currentUser.TimeZone, item.DmoType ? item.DmoType != 'StaticDateBox' : true);
    const value = userDate.split(' ')[0];
    return value;
  }
}
