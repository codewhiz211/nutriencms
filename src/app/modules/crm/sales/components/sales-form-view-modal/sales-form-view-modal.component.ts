import { Component, OnInit } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { LotSearchService } from '../../../lots/services/lot-search.service';
import { SalesService } from '../../services/sales.service';

import {
  ApplicationService,
  AuthenticationService,
  FormViewService,
  DmoControlService,
  ListviewService,
  NgbDateFRParserFormatter,
  ApiESaleyardService,
  SaleStage,
  MessageService
} from '@app/core';
import { environment } from '@env/environment';
import { UserDetail } from '@app/core/models/user-detail';
import { CrmLotTrigger } from '@app/core/models/crm-lot-trigger.enum';

@Component({
  selector: 'app-sales-form-view-modal',
  templateUrl: './sales-form-view-modal.component.html',
  styleUrls: ['./sales-form-view-modal.component.scss']
})
export class SalesFormViewModalComponent implements OnInit {

  form: FormGroup;
  data: any;
  submitted = false;
  currentUser: any;
  processName: string;
  isEdit = false;
  isCopy = false;
  lotData = [];
  transactionId = null;
  parentTransactionId = null;
  BMJSON: any = {};
  applicationData: any = {};
  optionList: any = {};
  headerInformationdmos = [];
  headerInformationDmog: any;
  createFromFileDmos = [];
  saleData = [];
  rateVale = 0;
  flag = false;
  file: File = null;
  IsValidFile = false;
  fileName = '';
  errorMsg = '';
  isFileUpload = false;
  isDateGraeter = false;
  isDoneLoading = false;
  isCalcFeesFieldsChanged = false;
  isConductingBranchChanged = false;
  isBuyerRebateChanged = false;
  stage: SaleStage;
  deleteConjuctionalIndex: number;
  isFinalised = false;
  isReversal = false;
  isInvoiced = false;
  typeAheadEnter$ = new BehaviorSubject<boolean>(true);

  triggerCondJson = [];
  triggers: any = [];
  WFJSON: any = {};
  currentStageGuid: string;
  currentStateGuid: string;
  currentTriggerGuid: string;

  CompCode: string;
  CondCompCode: string;

  isSaveButton = true;
  currentSaleProcessorSel: string = '';
  IsAllowForCondutingBranch = true;

  CundBranchComp: string = '';//hold Company id for conducting branch

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private applicationService: ApplicationService,
    private authenticationService: AuthenticationService,
    private dmoControlService: DmoControlService,
    private ngbDateFRParserFormatter: NgbDateFRParserFormatter,
    private formViewService: FormViewService,
    private listviewService: ListviewService,
    private apiESaleyardService: ApiESaleyardService,
    private fb: FormBuilder,
    private lotSearchService: LotSearchService,
    private salesService: SalesService,
    private datePipe: DatePipe,
    private msg: MessageService,
    private toastr: ToastrService,
    private userDetail: UserDetail
  ) { }


  ngOnInit() {
    this.isDoneLoading = false;
    this.isFinalised = this.stage === SaleStage.Finalised || this.stage === SaleStage.ReversalCompleted;
    this.isReversal = this.stage === SaleStage.ReversalProcess;
    this.isInvoiced = this.stage === SaleStage.Invoiced;
    this.currentUser = this.userDetail;
    this.processName = sessionStorage.getItem('AppName');
    if (this.data) {
      this.isEdit = true;
    }
    this.formViewService.getBmWfJson(this.processName, 'Form').subscribe(async response => {
      this.BMJSON = response.BM.BusinessModelObjectGroup.Form;
      this.WFJSON = response.WF;
      this.BMJSON.List.forEach(bmoGuid => {
        this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
          if (this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].DisplayName === 'Header Information') {
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
          if (this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].DisplayName === 'Create From File') {
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
              this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
                objCOLUMN.List.forEach(dmoGUID => {
                  objCOLUMN.DataModelObjects[dmoGUID].DMOGuid = dmoGUID;
                  objCOLUMN.DataModelObjects[dmoGUID].dmoGUID = dmoGUID;
                  this.createFromFileDmos.push(objCOLUMN.DataModelObjects[dmoGUID]);
                });
              });
            });
          }
        });
      });

      const dmos = [...this.headerInformationdmos, ...this.createFromFileDmos];
      this.form = this.dmoControlService.toFormViewGroup(dmos);
      if (this.isEdit) { // edit mode
        this.form = this.dmoControlService.toAdminViewFormGroup(dmos, this.data);
        if (this.data.DataInformation.dmocrmheaderinftrantype) {
          this.OnChangeTransactionType(this.data.DataInformation.dmocrmheaderinftrantype);
        }
        if (this.data.DataInformation.dmocrmheaderinfcndbrnc) {
          this.changeConductingBranch(this.data.DataInformation.dmocrmheaderinfcndbrnc);

        }
      } else if (this.isCopy) { // copy mode
        this.applicationData = await this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).toPromise();
        this.form = this.dmoControlService.toAdminViewFormGroup(dmos, this.applicationData);
        if (this.applicationData.DataInformation.dmocrmheaderinftrantype) {
          this.OnChangeTransactionType(this.applicationData.DataInformation.dmocrmheaderinftrantype);
        }
        if (this.applicationData.DataInformation.dmocrmheaderinfcndbrnc) {
          this.changeConductingBranch(this.applicationData.DataInformation.dmocrmheaderinfcndbrnc);
        }
        this.GetPlasmaId();
        this.parentTransactionId = this.transactionId;
      } else { // create mode
        this.GetPlasmaId();
        this.form.controls.DMOCRM_HeaderInf_SaleProc.patchValue(this.currentUser.UserID);
      }

      this.populateDDLOptions();

      this.form.addControl('DMOCRM_ConjAgnt_SetConjAg', new FormControl(false));
      this.form.addControl('conjunctionlAgents', new FormArray([]));
      this.form.addControl('enableBranchRebate', new FormControl(false));
      this.form.addControl('rebateRate', new FormControl('', [Validators.min(0), Validators.max(100)]));
      this.form.get('rebateRate').disable();
      if (this.isEdit) {
        if (this.data.DataInformation.dmocrmintbuybrcrebenab != null && this.data.DataInformation.dmocrmintbuybrcrebenab.DMOVAL === 'true') {
          this.form.get('enableBranchRebate').patchValue(true);
        }
        if (this.data.DataInformation.dmocrmintbuybrcrebrate != null && this.data.DataInformation.dmocrmintbuybrcrebrate.DMOVAL) {
          this.form.get('rebateRate').patchValue(this.data.DataInformation.dmocrmintbuybrcrebrate.DMOVAL);
          this.form.get('rebateRate').enable();
        }
        if (this.data.DataInformation &&
          this.data.DataInformation.dmocrmconjagntsetconjag != null &&
          this.data.DataInformation.dmocrmconjagntsetconjag.DMOVAL === 'Yes') {
          this.form.get('DMOCRM_ConjAgnt_SetConjAg').patchValue(true);
        }
        if (this.data.DataInformation &&
          this.data.DataInformation.dmocrmhisalecreatedfrom != null &&
          this.data.DataInformation.dmocrmhisalecreatedfrom.DMOVAL === 'e-contract') {
          this.form.get('DMOCRM_HeaderInf_ContID').disable();
        }
      } else if (this.isCopy && this.applicationData !== null) {
        if (this.applicationData.DataInformation.dmocrmintbuybrcrebenab != null && this.applicationData.DataInformation.dmocrmintbuybrcrebenab.DMOVAL === 'true') {
          this.form.get('enableBranchRebate').patchValue(true);
        }
        if (this.applicationData.DataInformation.dmocrmintbuybrcrebrate != null && this.applicationData.DataInformation.dmocrmintbuybrcrebrate.DMOVAL) {
          this.form.get('rebateRate').patchValue(this.applicationData.DataInformation.dmocrmintbuybrcrebrate.DMOVAL);
          this.form.get('rebateRate').enable();
        }
        if (this.applicationData.DataInformation
          && this.applicationData.DataInformation.dmocrmconjagntsetconjag != null
          && this.applicationData.DataInformation.dmocrmconjagntsetconjag.DMOVAL === 'Yes') {
          this.form.get('DMOCRM_ConjAgnt_SetConjAg').patchValue(true);
        }
      }
      if (this.isEdit || this.isCopy) {
        this.getConjunctionAgentData();

      } else if (this.salesService.submitDataForCreateSale) {
        this.form.patchValue(this.salesService.submitDataForCreateSale.submitData.Data[0]);
        const ddMMyyyy = this.datePipe.transform(new Date(this.salesService.submitDataForCreateSale.submitData.Data[0].DMOCRM_HeaderInf_SaleDate), environment.Setting.dateFormat);
        this.form.controls['DMOCRM_HeaderInf_SaleDate'].patchValue(this.ngbDateFRParserFormatter.parse(ddMMyyyy));
        this.changeConductingBranch({ DMOVAL: this.salesService.submitDataForCreateSale.submitData.Data[0].DMOCRM_HeaderInf_CndBrnc });
        this.OnChangeTransactionType({ DMOVAL: this.form.controls['DMOCRM_HeaderInf_TranType'].value });
        if (this.salesService.submitDataForCreateSale.conjunctionalAgentsData.length) {
          this.form.get('DMOCRM_ConjAgnt_SetConjAg').setValue(true);
          for (const item of this.salesService.submitDataForCreateSale.conjunctionalAgentsData) {
            (this.form.get('conjunctionlAgents') as FormArray).push(this.fb.group({
              DATAID: [null],
              dmocrmconjagntagent: [item.AgentName, Validators.required],
              agentid: [item.AgentCode],
              dmocrmconjagntrate: [item.Rate, [Validators.required, Validators.min(0)]]
            }));
          }
        }
        this.file = this.salesService.submitDataForCreateSale.file;
        this.fileName = this.file.name;
      } else {
        const ddMMyyyy = this.datePipe.transform(new Date(), environment.Setting.dateFormat);
        this.form.controls['DMOCRM_HeaderInf_SaleDate'].patchValue(this.ngbDateFRParserFormatter.parse(ddMMyyyy));
      }
      this.onChanges();
      this.isDoneLoading = true;
      if (this.isFinalised || this.isReversal) {
        this.form.disable();
      }

      if (this.isReversal) {
        this.form.controls['DMOCRM_HeaderInf_SaleDate'].enable();
        this.form.controls['DMOCRM_HeaderInf_SaleDesc'].enable();
      }

      if (this.isInvoiced) {
        this.form.controls['DMOCRM_HeaderInf_CndBrnc'].disable();
      }
      this.getTriggers();
    });
  }

  conjuctionalAgentSearch = (text$: Observable<string>) => {
    return this.lotSearchService.conjuctionalAgentSearch(text$);
  }

  populateDDLOptions() {
    this.BMJSON.List.forEach(bmoGuid => {
      this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
        if (this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].DisplayName === 'Header Information') {
          this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
              objCOLUMN.List.forEach(dmoGUID => {
                const dmo = objCOLUMN.DataModelObjects[dmoGUID];
                if ((dmo.Type === 'DropDownList' || dmo.Type === 'KeyValueSearchBox') && dmoGUID !== 'dmocrmheaderinfsaleyard' && dmoGUID !== 'dmocrmheaderinfsaletype') {
                  this.optionList[dmo.Name] = [];
                  if (dmo.DataSource === 'values') {
                    dmo.Options.split(',').forEach(item => {
                      if (item !== 'All') {
                        this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: item, TextField: item }];
                      }
                    });
                  } else if (dmo.DataSource === 'json') {
                    this.optionList[dmo.Name] = JSON.parse(dmo.Options);
                  } else if (dmo.DataSource === 'c2miceapi') {
                    const callOption = dmo.Options.split('~~~');
                    const apiURL = callOption[0].toString();
                    const responseKey = callOption[callOption.length - 1];
                    this.listviewService.GetDataFromIceAPI(apiURL, 'text').subscribe(result => {
                      const parser = new DOMParser();
                      const xmlDoc = parser.parseFromString(result, 'text/xml');
                      const rowList = xmlDoc.getElementsByTagName('Table1');
                      let nodeIndex = -1;
                      for (const Index in rowList[0].childNodes) {
                        if (rowList[0].childNodes[Index].nodeName === responseKey) {
                          nodeIndex = parseInt(Index, 0);
                        }
                      }
                      if (nodeIndex > -1 && rowList.length > 0) {
                        let rowInex = 0;
                        while (rowInex < rowList.length) {
                          const optionValue = rowList[rowInex].childNodes[nodeIndex].childNodes[0].nodeValue;
                          if (optionValue !== 'All') {
                            this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: optionValue, TextField: optionValue }];
                          }
                          rowInex++;
                        }
                      }
                    });
                  } else if (dmo.DataSource === 'wfapigetdata') {
                    const callOption = dmo.Options.split('~~~');
                    const callParam = JSON.parse(callOption[1]);
                    const responseKey = callOption[0].toString().replace(/\s/g, '');
                    const responseParamss = responseKey.split('-');
                    let paramValue = '';
                    this.listviewService.GridData(callParam, false).subscribe(result => {
                      result.Data.forEach(rowItem => {
                        if (responseParamss.length === 1) {
                          paramValue = rowItem[responseParamss[0]];
                          if (paramValue !== 'All') {
                            this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: paramValue, TextField: paramValue }];
                          }
                        } else if (responseParamss.length === 2) {
                          paramValue = `${rowItem[responseParamss[0].trim()]}~${rowItem[responseParamss[1].trim()]}`;
                          this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: `${rowItem[responseParamss[0].trim()]}`, TextField: `${rowItem[responseParamss[1].trim()]}` }];
                        }
                      });
                    });
                  } else if (dmo.DataSource.toLowerCase().indexOf('wfapi') > -1) {
                    if ((this.isFinalised || this.isReversal) && dmo.Name !== 'DMOCRM_HeaderInf_CndBrnc' && dmo.Name !== 'DMOCRM_HeaderInf_PrcBrnc') {
                      if (!!this.form.get(dmo.Name).value) {
                        this.optionList[dmo.Name] = [{ ValueField: this.form.get(dmo.Name).value, TextField: this.form.get(dmo.Name).value.split(' (')[0] }];
                      }
                    } else {
                      const responseKey = dmo.Key.toString().replace(/\s/g, '');
                      const responseValue = dmo.Value.toString().replace(/\s/g, '');
                      const callParam = JSON.parse(dmo.Model);
                      if (dmo.Name === 'DMOCRM_HeaderInf_TranType') {
                        callParam.GridFilters.push(
                          {
                            DataField: 'dmotrnstyptranstypeact',
                            FilterType: 'Column_Filter',
                            LogicalOperator: 'Or',
                            GridConditions: [{ Condition: 'CONTAINS', ConditionValue: 'Livestock' }]
                          }
                        );
                      }
                      this.listviewService.GridDatalmk(callParam).subscribe(result => {
                        result.Data.forEach(rowItem => {
                          if (rowItem[responseValue] !== 'All') {
                            // Entity Start 04 Mar Roshan
                            if(dmo.Name == 'DMOCRM_HeaderInf_CndBrnc' || dmo.Name === 'DMOCRM_HeaderInf_PrcBrnc'){
                              this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: `${rowItem[responseValue].trim() + ' (' + rowItem[responseKey].trim() + ')'}`, TextField: `${rowItem[responseValue].trim()}`, CompCode: rowItem['dmobranchcompcode_KEY']  }];
                            } else{
                            this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: `${rowItem[responseValue].trim() + ' (' + rowItem[responseKey].trim() + ')'}`, TextField: `${rowItem[responseValue].trim()}` }];
                            }
                            // Entity End 04 Mar Roshan
                           // Entity Code For Sale company wise
                            // if(dmo.Name === 'DMOCRM_HeaderInf_CndBrnc' && this.CundBranchComp === ''){
                            //   this.CundBranchComp = rowItem.dmobranchcompcode_KEY;
                            // }
                            // end
                          }
                        });
                      });
                    }
                  }
                }
              });
            });
          });
        }
      });
    });
  }

  changeConductingBranch(ev) {
    if (ev) {
      if (this.isFinalised || this.isReversal) {
        this.optionList.DMOCRM_HeaderInf_Saleyard = [];
        if (!!this.form.get('DMOCRM_HeaderInf_Saleyard').value) {
          if (this.form.get('DMOCRM_HeaderInf_Saleyard').value == 'undefined ()') {
            this.form.get('DMOCRM_HeaderInf_Saleyard').patchValue('');
          } else {
            this.optionList.DMOCRM_HeaderInf_Saleyard = [{ ValueField: this.form.get('DMOCRM_HeaderInf_Saleyard').value, TextField: this.form.get('DMOCRM_HeaderInf_Saleyard').value.split(' (')[0] }];
          }
        }
      } else {
        let branchName = ev.ValueField || ev.DMOVAL;
        if (branchName.indexOf('~~~') > -1) {
          const spliter = branchName.split('~~~');
          branchName = spliter[1] + ' (' + spliter[0] + ')';
        }

        branchName = branchName.indexOf('(') > -1 ? branchName.substr(
          branchName.indexOf('(') + 1).replace(')', '') : branchName;
        this.apiESaleyardService.post(`crmsales/getSaleyardName/${branchName}`)
          .pipe(map(data => data.Data))
          .subscribe(data => {
            this.optionList.DMOCRM_HeaderInf_Saleyard = [];
            if (ev.ValueField) {
              this.form.get('DMOCRM_HeaderInf_Saleyard').patchValue('');
            }
            if (Array.isArray(data)) {
              data.forEach(item => {
                if (item.SALEYARDNAME !== 'All') {
                  this.optionList.DMOCRM_HeaderInf_Saleyard = [...this.optionList.DMOCRM_HeaderInf_Saleyard, { ValueField: item.SALEYARDNAME + ' (' + item.SALEYARDCODE + ')', TextField: item.SALEYARDNAME }];
                }
              });
            }
          });
      }
      // Entity Start 04 Mar Roshan
      if(ev.CompCode){
        this.CundBranchComp = ev.CompCode;
      }
      // Entity End 04 Mar Roshan
    }
  }

  getConjunctionAgentData() {
    this.salesService.getConjunctionalAgent(this.transactionId).subscribe(response => {
      if (response.length) {
        this.form.get('DMOCRM_ConjAgnt_SetConjAg').setValue(true);
        response.forEach(item => {
          (this.form.get('conjunctionlAgents') as FormArray).push(this.fb.group({
            DATAID: this.isCopy ? [null] : [item.ID],
            dmocrmconjagntagent: [item.AgentName, Validators.required],
            agentid: [item.AgentCode],
            dmocrmconjagntrate: [item.Rate, [Validators.required, Validators.min(0)]]
          }));
        });

        if (this.isFinalised || this.isReversal) {
          this.form.get('conjunctionlAgents').disable();
        }
      }
    });
  }


  onChanges() {
    this.form.get('enableBranchRebate').valueChanges
      .subscribe(checked => {
        if (!this.isFinalised && !this.isReversal)
          this.form.get('rebateRate').patchValue('');
        if (checked) {
          this.form.get('rebateRate').enable();
        } else {
          this.form.get('rebateRate').disable();
        }
      });

    this.form.get('DMOCRM_HeaderInf_TranType').valueChanges
      .subscribe(val => {
        this.isCalcFeesFieldsChanged = true;
      });

    this.form.get('DMOCRM_HeaderInf_SaleType').valueChanges
      .subscribe(val => {
        this.isCalcFeesFieldsChanged = true;
      });

    this.form.get('DMOCRM_HeaderInf_Saleyard').valueChanges
      .subscribe(val => {
        this.isCalcFeesFieldsChanged = true;
      });

    this.form.get('DMOCRM_HeaderInf_CndBrnc').valueChanges
      .subscribe(val => {
        this.isConductingBranchChanged = true;
      });

    this.form.get('rebateRate').valueChanges
      .subscribe(val => {
        this.isBuyerRebateChanged = true;
      });
  }

  OnChangeTransactionType(ev) {
    let val: any;
    if (ev) {
      if (this.isFinalised || this.isReversal) {
        this.optionList.DMOCRM_HeaderInf_SaleType = [];
        if (!!this.form.get('DMOCRM_HeaderInf_SaleType').value) {
          this.optionList.DMOCRM_HeaderInf_SaleType = [{ ValueField: this.form.get('DMOCRM_HeaderInf_SaleType').value, TextField: this.form.get('DMOCRM_HeaderInf_SaleType').value.split(' (')[0] }];
        }
      } else {
        let trnsTypeName = ev.ValueField || ev.DMOVAL;
        if (trnsTypeName.indexOf('~~~') > -1) {
          const spliter = trnsTypeName.split('~~~');
          trnsTypeName = spliter[1] + ' (' + spliter[0] + ')';
        }

        trnsTypeName = trnsTypeName.indexOf('(') > -1 ? trnsTypeName.substr(
          trnsTypeName.indexOf('(') + 1).replace(')', '') : trnsTypeName;
        if (trnsTypeName) {
          this.apiESaleyardService.post(`crmsales/getSaleType/${trnsTypeName}`)
            .pipe(map(data => data.Data))
            .subscribe(data => {
              this.optionList.DMOCRM_HeaderInf_SaleType = [];
              if (ev.ValueField) {
                this.form.get('DMOCRM_HeaderInf_SaleType').patchValue('');
              }
              if (Array.isArray(data)) {
                data.forEach(item => {
                  if (item.SALETYPENAME !== 'All') {
                    this.optionList.DMOCRM_HeaderInf_SaleType = [...this.optionList.DMOCRM_HeaderInf_SaleType, { ValueField: item.SALETYPENAME + ' (' + item.SALECODE + ')', TextField: item.SALETYPENAME }];
                  }
                });
              }
            });
        } else {
          this.optionList.DMOCRM_HeaderInf_SaleType = [];
        }

      }
    }
    if (ev !== undefined) {
      val = ev.ValueField || ev.DMOVAL;
    } else {
      val = this.form.get('DMOCRM_HeaderInf_TranType').value;
    }
    val = val.indexOf('~~~') > -1 ? val.split('~~~')[0] : val;
    val = val.indexOf('(') > -1 ? val.substr(val.indexOf('(') + 1).replace(')', '') : val;
    // const options = 'ZL02,ZL03,ZL04';
    // if (!!val && options.split(',').indexOf(val.trim()) === -1) {
    //   this.form.get('DMOCRM_HeaderInf_Saleyard').disable();
    //   this.form.get('DMOCRM_HeaderInf_Saleyard').patchValue('');
    // } else {
    //   this.form.get('DMOCRM_HeaderInf_Saleyard').enable();
    // }
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
  }

  addConjunctionalAgent() {
    if (this.isFinalised || this.isReversal) {
      return;
    }
    if(this.isEdit && !this.IsAllowForCondutingBranch){
      return;
    }
    const control = this.form.controls.conjunctionlAgents as FormArray;
    control.push(
      this.fb.group({
        DATAID: [null],
        dmocrmconjagntagent: [null, Validators.required],
        agentid: [null],
        dmocrmconjagntrate: [null, [Validators.required, Validators.min(0)]]
      })
    );
  }

  deleteConjunctionalAgent(index: number) {
    if (this.isFinalised || this.isReversal) {
      return;
    }
    if(this.isEdit && !this.IsAllowForCondutingBranch){
      return;
    }
    this.rateVale = 0;
    const control = this.form.controls.conjunctionlAgents as FormArray;
    if (control.controls[index].value.DATAID) {
      this.deleteConjuctionalIndex = index;
      this.msg.showMessage('Warning', {
        header: 'Confirmation Message',
        body: 'Are you sure you want to delete conjuctional agent?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.ConfirmationConjuctionDelete,
        caller: this,
      });
    } else {
      control.removeAt(index);
    }
  }
  ConfirmationConjuctionDelete(modelRef: NgbModalRef, Caller: SalesFormViewModalComponent) {
    const control = Caller.form.controls.conjunctionlAgents as FormArray;
    Caller.salesService.deleteConjunctionalAgent(control.controls[Caller.deleteConjuctionalIndex].value.DATAID).subscribe(data => {
      control.removeAt(Caller.deleteConjuctionalIndex);
      Caller.calcBuyerBranchRebate(Caller.transactionId);
    });
  }

  async saveConjunctionalAgent(conjunctionlAgents: any) {
    try {
      for (const item of conjunctionlAgents) {
        if (item.agentid !== '' && item.agentid != null &&
          item.dmocrmconjagntrate !== '' && item.dmocrmconjagntrate != null) {
          const body = {
            SaleTransactionID: this.transactionId,
            AgentCode: item.agentid,
            Rate: item.dmocrmconjagntrate
          };
          await this.salesService.saveConjunctionalAgent(body).subscribe(x => {
            const bodyconjTerm = {
              saleTransactionID: this.transactionId
            };
            this.salesService.saveConjAgentTerms(bodyconjTerm).toPromise();
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  saleIdSearch = (text$: Observable<string>) => {
    return this.salesService.saleIdSearch(text$);
  }
  onSubmitRecord() {
    const control = this.form.controls.conjunctionlAgents as FormArray;
    this.rateVale = 0;
    control.controls.forEach(element => { this.rateVale += +element.value.dmocrmconjagntrate; });
    if (this.rateVale > 100) {
      this.msg.showMessage('Warning', {
        header: 'Confirmation Message',
        body: 'Conjunctional commission exceeds 100%. Do you want to continue?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.redirectionConfirmation,
        caller: this
      });
    } else {
      this.onSubmit();
    }

  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);
    if (this.file) {
      if (this.file.type === 'text/plain' || this.file.type === 'application/vnd.ms-excel') {
        this.IsValidFile = false;
        this.fileName = this.file.name;
      } else {
        this.fileName = '';
        this.errorMsg = 'The file format select is invalid';
        this.IsValidFile = true;
      }
    }
  }
  deletefile(){
    this.fileName=null;
    this.fileName='';
    this.isFileUpload=false;
  }
  upload(processName: string, userId: string, saleyardName: string) {
    if (this.file === null) {
      this.IsValidFile = true;
      this.errorMsg = 'Please select file';
      return;
    }
    this.IsValidFile = false;
    this.errorMsg = '';
    const formData = new FormData();
    formData.append('uploadFile', this.file);
    this.salesService.ImportFileData(processName, userId, saleyardName, formData).subscribe(Result => {
      if (Result == 1) {
        this.file = null;
        this.fileName = '';
        this.router.navigate(['/crm/sales/processing/file-import-review']);
        this.activeModal.close(true);
      } else if (Result == 0) {
        this.toastr.error("The file selected does not contain any data");
        return;
      } else {
        this.toastr.error("The file format select is invalid");
        return;
      }
    }, error => { console.log(error); });
  }

  onSubmit() {
    this.submitted = true;
    const loginUser = this.userDetail;
    if (this.form.value.DMOCRM_ConjAgnt_SetConjAg === true && this.form.value.conjunctionlAgents != null && this.form.value.conjunctionlAgents.length > 0) {
      for (const item of this.form.value.conjunctionlAgents) {
        if (item.dmocrmconjagntagent == null || item.dmocrmconjagntrate == null) {
          this.msg.showMessage('Warning', {
            body: 'The Conjunctional Agent section is missing mandatory fields. Please complete in order to continue',
          });
          return;
        } else if (item.dmocrmconjagntrate < 0) {
          this.msg.showMessage('Warning', {
            body: 'The Conjunctional Agent rate must be greater than 0'
          });
          return;
        }
      }
    }
    if (!this.form.valid) {
      return;
    }
    let formValue: any = {};
    if (this.isEdit) {
      formValue = this.dmoControlService.getDirtyValues(this.form);
    } else {
      formValue = { ...this.form.value };
    }
    // Entity Start  04 Mar Roshan
    if(this.CundBranchComp !== ''){
      formValue.DMOCRM_HInfo_CondCmpCode = this.CundBranchComp;
    }
    // Entity End  04 Mar Roshan
    if ((Object.keys(formValue).includes('DMOCRM_HeaderInf_Saleyard') && formValue.DMOCRM_HeaderInf_Saleyard === null) || 
    this.form.get('DMOCRM_HeaderInf_Saleyard').status == "DISABLED") {
      formValue.DMOCRM_HeaderInf_Saleyard = '';
    }
    if (Object.keys(formValue).includes('DMOCRM_HeaderInf_SaleDate')) {
      if (formValue.DMOCRM_HeaderInf_SaleDate != null &&
        formValue.DMOCRM_HeaderInf_SaleDate !== '' &&
        formValue.DMOCRM_HeaderInf_SaleDate.hasOwnProperty('year') &&
        formValue.DMOCRM_HeaderInf_SaleDate.hasOwnProperty('month') &&
        formValue.DMOCRM_HeaderInf_SaleDate.hasOwnProperty('day')) {
        const dateyyMMdd = ''.concat(formValue.DMOCRM_HeaderInf_SaleDate.year, '-', formValue.DMOCRM_HeaderInf_SaleDate.month, '-', formValue.DMOCRM_HeaderInf_SaleDate.day);
        const { year, month, day } = formValue.DMOCRM_HeaderInf_SaleDate;
        let value = `${month}/${day}/${year}`;
        value = this.dmoControlService.getUserDateTime(value, environment.Setting.dateTimeFormat1, loginUser.TimeZone * -1, false);
        formValue.DMOCRM_HeaderInf_SaleDate = value;

        // formValue.DMOCRM_HeaderInf_SaleDate = this.ngbDateFRParserFormatter.format(formValue.DMOCRM_HeaderInf_SaleDate);
       
        // if (environment.Setting.dateTimeFormat24 === true) {
        //   formValue.DMOCRM_HeaderInf_SaleDate = this.getUserDateTime(formValue.DMOCRM_HeaderInf_SaleDate,
        //     'MM/dd/yyyy hh:mm:ss', loginUser.TimeZone);
        // } else {
        //   formValue.DMOCRM_HeaderInf_SaleDate = this.getUserDateTime(formValue.DMOCRM_HeaderInf_SaleDate,
        //     'MM/dd/yyyy hh:mm:ss', loginUser.TimeZone);
        // }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const saledate = new Date(dateyyMMdd);
        saledate.setHours(0, 0, 0, 0);
        if (this.isDateGraeter === false && saledate > today) {
          if (this.isReversal) {
            this.msg.showMessage('Warning', { body: 'You have selected a future date' });
            // this.showErrorMessage('You have selected a future date.', 'Message', 'Ok', null, false, true, false, '');
          } else {
            this.msg.showMessage('Warning', {
              body: 'You have selected a future date. Would you like to proceed?',
              btnText: 'Yes',
              checkboxText: 'Proceed',
              isDelete: false,
              isConfirmation: true,
              callback: this.redirectionConfirmation,
              caller: this,
            })
            // this.showErrorMessage('You have selected a future date. would you like to proceed?', 'Warning', 'Yes',
            //   this.redirectionConfirmation, false, true, true, 'would you like to proceed?');
          }
          return;
        }
      } else {
        if (isNaN(Date.parse(formValue.DMOCRM_HeaderInf_SaleDate))) {
          formValue.DMOCRM_HeaderInf_SaleDate = null;
        }
      }
    }

    let saleyard = formValue["DMOCRM_HeaderInf_Saleyard"];
    let tempFileName = this.fileName;
    if (tempFileName !== '' && saleyard === '') {
      this.isFileUpload = true;
      return;
    }


    let isRebate = false;
    const conjunctionalAgentsData = formValue.conjunctionlAgents;
    if (formValue.enableBranchRebate === true && formValue.rebateRate) {
      formValue.DMOCRM_IntBuyBrcReb_Rate = formValue.rebateRate;
      formValue.DMOCRM_IntBuyBrcReb_Enab = true;
    } else if (formValue.enableBranchRebate === true) {
      formValue.DMOCRM_IntBuyBrcReb_Enab = true;
    } else if (formValue.rebateRate) {
      formValue.DMOCRM_IntBuyBrcReb_Rate = formValue.rebateRate;
    } else if (this.isEdit === true &&
      this.data.DataInformation.dmocrmintbuybrcrebenab.RLTYPDMOVAL === 'true' && formValue.enableBranchRebate === false) {
      formValue.DMOCRM_IntBuyBrcReb_Rate = '';
      formValue.DMOCRM_IntBuyBrcReb_Enab = false;
      isRebate = true;
    } else if (this.isCopy &&
      this.applicationData.DataInformation.dmocrmintbuybrcrebenab.RLTYPDMOVAL === 'true' && formValue.enableBranchRebate === false) {
      formValue.DMOCRM_IntBuyBrcReb_Rate = '';
      formValue.DMOCRM_IntBuyBrcReb_Enab = false;
      isRebate = true;
    }
    delete formValue.enableBranchRebate;
    delete formValue.rebateRate;
    // delete formValue.dmocrmconjagntsetconjag;
    // Check Agent config
    if (formValue.DMOCRM_ConjAgnt_SetConjAg == true) {
      formValue.DMOCRM_ConjAgnt_SetConjAg = 'Yes';
    } else if (formValue.DMOCRM_ConjAgnt_SetConjAg == false) {
      formValue.DMOCRM_ConjAgnt_SetConjAg = 'No';
      const controlAgent = (this.form.get('conjunctionlAgents') as FormArray);
      controlAgent.controls.forEach(element => {
        this.salesService.deleteConjunctionalAgent(element['controls'].DATAID.value).subscribe(x => { });
      });
    }
    // if(this.isEdit == true && (formValue.DMOCRM_ConjAgnt_SetConjAg == true || formValue.DMOCRM_ConjAgnt_SetConjAg == 'Yes')){
    //   formValue.DMOCRM_ConjAgnt_SetConjAg = 'Yes';
    // } else if(formValue.DMOCRM_ConjAgnt_SetConjAg ==undefined) {
    //   formValue.DMOCRM_ConjAgnt_SetConjAg = 'No';
    //  const controlAgent = (this.form.get('conjunctionlAgents') as FormArray);
    //  controlAgent.controls.forEach(element=>{
    //    this.salesService.deleteConjunctionalAgent(element['controls'].DATAID.value).subscribe(x=>{});
    //  })
    // }
    delete formValue.conjunctionlAgents;
    if (this.isEdit) {
      const submitData: any = {
        Identifier: {
          Name: null,
          Value: null,
          TrnsctnID: this.transactionId
        },
        ProcessName: this.processName,
        TriggerName: 'Save Data',
        UserName: this.currentUser.UserName,
        Data: [formValue]
      };

      this.applicationService.updateApplication(submitData).subscribe(async data => {
        if (formValue.DMOCRM_IntBuyBrcReb_Rate || formValue.DMOCRM_IntBuyBrcReb_Rate == '') {
          const resetRequest = {
            ParentTransctionId: this.transactionId,
            Rate: formValue.DMOCRM_IntBuyBrcReb_Rate,
            Rebate: formValue.DMOCRM_IntBuyBrcReb_Rate == '' ? 'false' : 'true',
            ProcessName: 'LMKLivestockLots'
          };
          this.salesService.ResetLot(resetRequest).subscribe(x => { });
        }
        const bodyDataVendor = {
          SaleTransactionID: this.transactionId
        };
        this.salesService.AddVendorTermsData(bodyDataVendor).subscribe(x => {
          this.salesService.bindvendor(this.transactionId);
        });
        if (conjunctionalAgentsData) {
          const conjData = [];
          Object.keys(conjunctionalAgentsData).forEach(key => {
            const control = this.form.controls.conjunctionlAgents as FormArray;
            conjData.push(control.controls[key].value);
          });
          await this.saveConjunctionalAgent(conjData);
          this.isBuyerRebateChanged = true;
        }
        // if reversal sale, not doing any lot fees & charges calculation
        if (!this.isReversal) {
          if (this.isCalcFeesFieldsChanged) {
            await this.calcLotFeesChargesById(this.transactionId);
          } else if (this.isBuyerRebateChanged) {
            await this.calcBuyerBranchRebate(this.transactionId);
          } else if (this.isConductingBranchChanged) {
            await this.calcHandlingFee(this.transactionId);
          }
        }

        if (formValue 
          && formValue.DMOCRM_HeaderInf_SaleProc
          && formValue.DMOCRM_HeaderInf_SaleProc !='') {
            if(formValue.DMOCRM_HeaderInf_SaleProc == this.userDetail.UserID){
              this.salesService.IsAllowInvoiceFinalize = true;
            } else{
              this.salesService.IsAllowInvoiceFinalize = false;
            }
        }
        this.activeModal.close(true);
      });

    } else {
       // Entity Changes  For Send Company Code 
      if(this.CundBranchComp !== ''){
        formValue.DMOCRM_HeaderInfo_CmpCode = this.CundBranchComp;
      }
    // end
      Object.keys(formValue).forEach(key => {
        if (formValue[key] == null || formValue[key] === '') {
          delete formValue[key];
        }
      });

      const submitData: any = {
        ProcessName: this.processName,
        UserName: this.currentUser.UserName,
        TriggerName: 'TRGR_PreProcessing_Next',
        Data: [formValue]
      };
      // sanitize value from DMOCRM_HeaderInf_TranType
      const trnsType = formValue.DMOCRM_HeaderInf_TranType.indexOf('(') > -1 ? formValue.DMOCRM_HeaderInf_TranType.substr(
        formValue.DMOCRM_HeaderInf_TranType.indexOf('(') + 1).replace(')', '') : formValue.DMOCRM_HeaderInf_TranType;
      if (this.fileName != '' && this.fileName != undefined && this.fileName !=null) {
        const dataSource: any = {
          submitData,
          conjunctionalAgentsData,
          file: this.file,
          UserId: this.currentUser.UserName
        };

        // this.salesService.currentSaleYardName = formValue.DMOCRM_HeaderInf_Saleyard;
        const SelectedSaleYard = this.optionList.DMOCRM_HeaderInf_Saleyard.find(x => x.ValueField === formValue.DMOCRM_HeaderInf_Saleyard);
        if (SelectedSaleYard) {
          this.salesService.currentSaleYardName = SelectedSaleYard.TextField;
        }
        // sanitize saleyard value
        this.salesService.currentSaleYardValue = formValue.DMOCRM_HeaderInf_Saleyard.indexOf('(') > -1 ? formValue.DMOCRM_HeaderInf_Saleyard.substr(
          formValue.DMOCRM_HeaderInf_Saleyard.indexOf('(') + 1).replace(')', '') : formValue.DMOCRM_HeaderInf_Saleyard;
        this.salesService.submitDataForCreateSale = dataSource;

        const saleyardValue = submitData.Data[0]["DMOCRM_HeaderInf_Saleyard"].toString().indexOf('(') > -1 ? submitData.Data[0]["DMOCRM_HeaderInf_Saleyard"].toString().substr(
          submitData.Data[0]["DMOCRM_HeaderInf_Saleyard"].toString().indexOf('(') + 1).replace(')', '') : submitData.Data[0]["DMOCRM_HeaderInf_Saleyard"].toString();

        this.upload(this.processName, this.currentUser.UserID, saleyardValue);
        // this.router.navigate(['/crm/sales/processing/file-import-review']);

      } else {
        this.applicationService.insertApplication(submitData).subscribe(async response => {
          this.transactionId = response.result.transactionId;
          if (conjunctionalAgentsData.length && !this.isCopy) {
            await this.saveConjunctionalAgent(conjunctionalAgentsData);
          }
          if (this.isCopy) {
            await this.copyLotRecords();
          }
          this.isFileUpload = false;
          this.router.navigate(['/crm/sales', this.transactionId]);
        });
        this.activeModal.close(true);
      }

    }
  }

  async copyLotRecords() {
    try {
      await this.salesService.SaveCopyLotData(this.parentTransactionId, this.transactionId).toPromise();
    } catch (err) {
      console.log(err);
    }
  }

  redirectionConfirmation(modelRef: NgbModalRef, Caller: SalesFormViewModalComponent) {
    Caller.isDateGraeter = true;
    Caller.onSubmit();
  }

  redirectionCloseConfirmation(modelRef: NgbModalRef, Caller: SalesFormViewModalComponent) {
    Caller.salesService.submitDataForCreateSale = null; Caller.activeModal.dismiss('Close')
  }

  /* ---------------------Open Confirmation Popup-------------- */
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

  DownloadFileTemplate() {

    this.salesService.DownloadTemplateFile().subscribe(data => {
      saveAs(data, 'Sale_Yard_import_template.csv');
    }, error => {
      console.log(error);
    });
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
        isDelete: false,
        isConfirmation: true,
        callback: this.redirectionCloseConfirmation,
        caller: this,
      })
      // this.showErrorMessage('Are you sure to close this Form?', 'Warrning', 'Yes',
      //   this.redirectionCloseConfirmation, false, true, true, 'would you like to proceed?');
    } else {
      this.salesService.submitDataForCreateSale = null;
      this.activeModal.dismiss('Close');
    }
  }
  selectedItem(event, conjuctionForm) {
    const c = this.lotSearchService.vendorData.filter(x => x.dmocustmstrcustname1 === event.item);
    if (c.length > 0) {
      conjuctionForm.controls.agentid.patchValue(c[0].dmocustmstrsapno);
    }
  }

  async calcLotFeesChargesById(SaleTransactionID: string) {
    const bodyData = {
      SaleTransactionID: SaleTransactionID,
      LotTransactionID: '',
      RecalcCharges: true,
      RecalcVendorCommission: true
    };

    await this.apiESaleyardService.post('crmlot/calcLotFeesChargesById', bodyData).toPromise();
  }

  async calcBuyerBranchRebate(SaleTransactionID: string) {
    const bodyData = {
      SaleTransactionID,
      LotTransactionID: ''
    };

    await this.apiESaleyardService.post('crmlot/calcBuyerBranchRebate', bodyData).toPromise();
  }

  async calcHandlingFee(SaleTransactionID: string) {
    const bodyData = {
      SaleTransactionID,
      LotTransactionID: ''
    };

    await this.apiESaleyardService.post('crmlot/calcHandlingFee', bodyData).toPromise();
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

  selectLinkSaleId() {
    setTimeout(() => {
      this.typeAheadEnter$.next(true);
    });
  }
  checkValidLinkSaleId() {
    if (this.typeAheadEnter$.getValue() || this.trimString(this.salesService.SaleLink) === '') {
      this.form.get('DMOCRM_HeaderInf_LinkSale').clearValidators();
      this.form.get('DMOCRM_HeaderInf_LinkSale').updateValueAndValidity();
      // this.toastr.warning('Sale ID inputted in "Link to Sale Record" does not exist');
    } else {
      this.form.get('DMOCRM_HeaderInf_LinkSale').setValidators([Validators.required]);
      this.form.get('DMOCRM_HeaderInf_LinkSale').updateValueAndValidity();
    }

  }
  checkValue(event) {
    if (this.trimString(event.target.value) === '') {
      this.form.get('DMOCRM_HeaderInf_LinkSale').patchValue('');
    }
  }
  trimString(x) {
    return x ? x.replace(/^\s+|\s+$/gm, '') : '';
  }

  checkSaleProcessorSaleHeader() {
    let changeSaleProcessor = true;
    let currentLoginUser = this.userDetail.UserID;
    let processorSelected = this.form.get('DMOCRM_HeaderInf_SaleProc').value;
    if (this.isSaveButton == true && this.currentSaleProcessorSel === '') {
      this.currentSaleProcessorSel = processorSelected;
      if (currentLoginUser !== processorSelected) {
        changeSaleProcessor = false;
        this.isSaveButton = false;
        return changeSaleProcessor;
      }
      else {
        return changeSaleProcessor;
      }
    }
    else{
      if(this.currentSaleProcessorSel === currentLoginUser.toString()){
        return changeSaleProcessor;
      }
      else{
        return false;
      }
    }
  }

  isTriggerVisible(trigger: any) {
    let isShowHideTrigger = false;
    Object.keys(trigger.ActionRoles).forEach(roleguid => {
      if (isShowHideTrigger == false) {
        if (this.currentUser.ListRole.indexOf(roleguid) > -1) {
          if (trigger.Guid === this.currentTriggerGuid) {
            isShowHideTrigger = this.triggerCondJson[trigger.Guid].IsVisible;
            return isShowHideTrigger;
          }
          else {
            isShowHideTrigger = false;
          }
        }
      }
    });
    return isShowHideTrigger;
  }
  IsCondutingBranchUser() {
    if (!this.isEdit) {
      return true;
    } else {
      const response = this.salesService.IsAllowForCondutingBranch(this.CompCode, this.CondCompCode);
      if(!response){
        this.IsAllowForCondutingBranch = response;
        this.form.disable();
      }
    }
  }
  getTriggers() {
    this.triggers = [];
    var userRole = this.currentUser.ListRole;
    this.getCurrentStageGUID();
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
    this.IsCondutingBranchUser();
  }

  getCurrentStageGUID() {
    if (this.stage === SaleStage.Inprocess) {
      this.currentStageGuid = CrmLotTrigger.SaleHederSubmit;
      this.currentStateGuid = CrmLotTrigger.InprocessState;
      this.currentTriggerGuid = CrmLotTrigger.TrgPreprocessingNext;
    }
    else if (this.stage === SaleStage.Finalised) {
      this.currentStageGuid = CrmLotTrigger.Inprocessfinalize;
      if (SaleStage.Finalised) {
        this.currentStateGuid = CrmLotTrigger.FinalisedCompleteState;
        this.currentTriggerGuid = CrmLotTrigger.TrgrPreprocessingFinaliseSale;
      }
      else if (SaleStage.ReversalCompleted) {
        this.currentStateGuid = CrmLotTrigger.FinalisedReverseState;
        this.currentTriggerGuid = CrmLotTrigger.TrgPreprocessingRevers;
      }
    }
    else if (this.stage === SaleStage.Invoiced) {
      this.currentStageGuid = CrmLotTrigger.InprocessInvoice;
      this.currentStateGuid = CrmLotTrigger.InvoicedProcessingState;
      this.currentTriggerGuid = CrmLotTrigger.TrgrPreprocessingInvoiceSale;
    }else if(this.stage==SaleStage.ReversalProcess){
      this.currentStageGuid = CrmLotTrigger.SaleHederSubmit;
      this.currentStateGuid = CrmLotTrigger.InprocessState;
      this.currentTriggerGuid = CrmLotTrigger.TrgPreprocessingNext;
    }
    else if (this.transactionId === undefined || this.transactionId === null) {
      this.currentStageGuid = CrmLotTrigger.SaleHederSubmit;
      this.currentStateGuid = CrmLotTrigger.InprocessState;
      this.currentTriggerGuid = CrmLotTrigger.TrgPreprocessingNext;
    }
  }
}
