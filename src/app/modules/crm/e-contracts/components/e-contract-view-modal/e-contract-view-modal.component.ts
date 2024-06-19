
import { Component, OnInit } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormArray, FormBuilder,Validators } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import {
  ApplicationService,
  AuthenticationService,
  FormViewService,
  DmoControlService,
  ListviewService,
  NgbDateFRParserFormatter,
  ApiESaleyardService,
  IHeaderMap,
  MessageService
} from '@app/core';
import { ColumnList } from '@app/modules/crm/model/column-list';
import { EContractService } from '../../services/e-contract.service';
import { LotSearchService } from '@app/modules/crm/lots/services/lot-search.service';
import { SalesService } from '@app/modules/crm/sales/services/sales.service';
import { environment } from '@env/environment';
import { LotService } from '@app/modules/crm/lots/services/lot.service';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-e-contract-view-modal',
  templateUrl: './e-contract-view-modal.component.html',
  styleUrls: ['./e-contract-view-modal.component.scss']
})
export class EContractViewModalComponent implements OnInit {

  form: FormGroup;
  data: any;
  submitted = false;
  currentUser: any;
  processName: string;
  isEdit = false;
  transactionId = null;
  BMJSON: any = {};
  optionList: any = {};
  headerInformationdmos = [];
  headerInformationDmog: any;
  createFromFileDmos = [];
  saleData = [];
  isSaleLotShowing = false;
  dataSource: any;
  itemsCount: number;
  SelectedRecordIds: any;
  ContractId: string;
  rateVale = 0;
  isCunjuction = false;
  isDateGraeter = false;
  allLotId = [];
  transactionTypeKeyValue: string;
  saleTypeValue: string;
  GstRate=10;
  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'lmkopesecdmorecordid',
            displayName: 'Contract ID'
          },
          {
            objectKey: 'lmkoeelotdmolotnumber',
            displayName: 'Lot No'
          }, {
            objectKey: 'lmkoeelotdmospaaccno',
            displayName: 'Vendor ID'
          }, {
            objectKey: 'lmkoeelotdmotrdname',
            displayName: 'Vendor Name'
          }, {
            objectKey: 'lmkoeelotdmoproduct',
            displayName: 'Product'
          },
          {
            objectKey: 'lmkoeelotdmoquantity',
            displayName: 'Contract Qty'
          }, {
            objectKey: 'lmkoeelotdmoquantity',
            displayName: 'Invoice Qty'
          }, {
            objectKey: 'lmkoeelotdmobuyerid',
            displayName: 'Buyer ID'
          }, {
            objectKey: 'lmkoeelotdmobuyname',
            displayName: 'Buyer Name'
          }
          , {
            objectKey: 'lmkoeelotdmoturnover',
            displayName: 'Total Value'
          }
        ],
        action: {
          Edit: false,
          Delete: false,
          Checkbox: true,
          DropDown: false
        },
        columnFilter: []
      },
      paging: false
    }
  };
  CundBranchComp: string = '';//hold Company id for conducting branch
  submitData = [];
  constructor(
    private datePipe: DatePipe,
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
    private econtract: EContractService,
    private lotSearchService: LotSearchService,
    private modalService: NgbModal,
    private salesService: SalesService,
    private msg: MessageService,
    private lot: LotService,
    private userDetail: UserDetail
  ) { }


  ngOnInit() {
    this.currentUser = this.userDetail;
    this.processName = 'LMKLivestockSales';
    sessionStorage.AppName = 'LMKLivestockSales';
    if (this.data) {
      this.isEdit = true;
    }
    this.formViewService.getBmWfJson(this.processName, 'Form').subscribe(response => {
      this.BMJSON = response.BM.BusinessModelObjectGroup.Form;
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
      if (this.isEdit) {
        this.form = this.dmoControlService.toAdminViewFormGroup(dmos, this.data);
        if (this.data.DataInformation.dmocrmheaderinftrantype) {
          this.OnChangeTransactionType(this.data.DataInformation.dmocrmheaderinftrantype);
        }
        if (this.data.DataInformation.dmocrmheaderinfcndbrnc) {
          this.changeConductingBranch(this.data.DataInformation.dmocrmheaderinfcndbrnc);
        }
      } else {
        //this.GetPlasmaId(); // Get Plasma Id Insert direct from sp
        this.form = this.dmoControlService.toFormViewGroup(dmos);
        this.form.controls.DMOCRM_HeaderInf_SaleProc.patchValue(this.currentUser.UserID);
        const ddMMyyyy = this.datePipe.transform(new Date(), environment.Setting.dateFormat);
        this.form.controls.DMOCRM_HeaderInf_SaleDate.patchValue(this.ngbDateFRParserFormatter.parse(ddMMyyyy));
      }
      if (!!this.transactionTypeKeyValue) {
        this.form.get('DMOCRM_HeaderInf_TranType').setValue(this.transactionTypeKeyValue);
        this.OnChangeTransactionType({DMOVAL: this.transactionTypeKeyValue});
      }
      this.populateDDLOptions();
      if (this.ContractId !== undefined && !this.ContractId.includes(',')) {
        this.form.get('DMOCRM_HeaderInf_ContID').setValue(this.ContractId);
      }
      if (this.saleTypeValue !== undefined && !this.saleTypeValue.includes(',')) {
        this.form.get('DMOCRM_HeaderInf_SaleType').setValue(this.saleTypeValue);
      }
      this.form.addControl('dmocrmconjagntsetconjag', new FormControl(false));
      this.form.addControl('conjunctionlAgents', new FormArray([]));
      this.form.addControl('enableBranchRebate', new FormControl(false));
      this.form.addControl('rebateRate', new FormControl('',[Validators.min(0), Validators.max(100)]));
      this.form.get('DMOCRMHISaleCreatedFrom').setValue('e-contract');
      this.form.get('rebateRate').disable();
      this.onChanges();
      if (this.isEdit) {
        this.getConjunctionAgentData();
      }

    });
    this.getGstRate();
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
                      this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: item, TextField: item }];
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
                          this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: optionValue, TextField: optionValue }];
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
                    if (dmo.Name === 'DMOCRM_HeaderInf_TranType') {
                      if (!!this.transactionTypeKeyValue) {
                        callParam.GridFilters.push({
                          GridConditions: [
                            {
                              Condition: 'EQUAL',
                              ConditionValue: this.transactionTypeKeyValue.split('(')[0].substring(0, this.transactionTypeKeyValue.split('(')[0].length - 1)
                            }
                          ],
                          DataField: 'dmotrnstyptranstypedscr',
                          LogicalOperator: 'or',
                          FilterType: 'Column_Filter'
                        });
                      }
                      callParam.GridFilters.push({
                        DataField: 'dmotrnstyptranstypeact',
                        FilterType: 'Column_Filter',
                        LogicalOperator: 'Or',
                        GridConditions: [{Condition: 'CONTAINS', ConditionValue: 'Livestock'}]
                      });
                    }
                    this.listviewService.GridData(callParam,false).subscribe(result => {
                      result.Data.forEach(rowItem => {
                        if (responseParamss.length === 1) {
                          paramValue = rowItem[responseParamss[0]];
                          if (paramValue !== 'All') {
                            this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: paramValue, TextField: paramValue }];
                          }
                        } else if (responseParamss.length === 2) {
                          paramValue = `${rowItem[responseParamss[0]]}~${rowItem[responseParamss[1]]}`;
                          this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: paramValue, TextField: `${rowItem[responseParamss[1]]}` }];
                        }
                      });
                    });
                  } else if (dmo.DataSource.toLowerCase().indexOf('wfapi')>-1) {
                    const responseKey = dmo.Key.toString().replace(/\s/g, '');
                    const responseValue = dmo.Value.toString().replace(/\s/g, '');
                    const callParam = JSON.parse(dmo.Model);
                    if (dmo.Name === 'DMOCRM_HeaderInf_TranType') {
                      if (!!this.transactionTypeKeyValue) {
                        callParam.GridFilters.push({
                          GridConditions: [
                            {
                              Condition: 'EQUAL',
                              ConditionValue: this.transactionTypeKeyValue.split('(')[0].substring(0, this.transactionTypeKeyValue.split('(')[0].length - 1)
                            }
                          ],
                          DataField: 'dmotrnstyptranstypedscr',
                          LogicalOperator: 'or',
                          FilterType: 'Column_Filter'
                        });
                      }

                      callParam.GridFilters.push({
                        DataField: 'dmotrnstyptranstypeact',
                        FilterType: 'Column_Filter',
                        LogicalOperator: 'Or',
                        GridConditions: [{Condition: 'CONTAINS', ConditionValue: 'Livestock'}]
                      });
                    }
                    this.listviewService.GridDatalmk(callParam).subscribe(result => {
                      result.Data.forEach(rowItem => {
                        // set ValueField for key value search box
                        // Entity Changes By Biresh 17 Apr 21
                        if(dmo.Name == 'DMOCRM_HeaderInf_CndBrnc' || dmo.Name === 'DMOCRM_HeaderInf_PrcBrnc'){
                          this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: `${rowItem[responseValue].trim() + ' (' + rowItem[responseKey].trim() + ')'}`, TextField: `${rowItem[responseValue].trim()}`, CompCode: rowItem['dmobranchcompcode_KEY']  }];
                        } else{
                        this.optionList[dmo.Name] = [...this.optionList[dmo.Name], { ValueField: `${rowItem[responseValue].trim() + ' (' + rowItem[responseKey].trim() + ')'}`, TextField: `${rowItem[responseValue].trim()}` }];
                        }
                        // End Entity Changes By Biresh 17 Apr 21
                      });
                    });
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
      let branchName = ev.ValueField || ev.DMOVAL;
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
              // set ValueField for key value search box
              this.optionList.DMOCRM_HeaderInf_Saleyard = 
              [...this.optionList.DMOCRM_HeaderInf_Saleyard, { ValueField: item.SALEYARDNAME + ' (' + item.SALEYARDCODE + ')', TextField: item.SALEYARDNAME }];
            });
          }
        });
         // Entity Start 17 APR Biresh
      if(ev.CompCode){
        this.CundBranchComp = ev.CompCode;
      }
      // Entity End 17 APR Biresh
    }
  }
  changeConductingBranchComp(ev){
    if(ev.CompCode){
      this.CundBranchComp = ev.CompCode;
    }
  }
  getConjunctionAgentData() {
    this.salesService.getConjunctionalAgent(this.transactionId).subscribe(response => {
      if (response.length) {
        this.form.get('dmocrmconjagntsetconjag').setValue(true);
        response.forEach(item => {
          this.conjunctionlAgents.push(this.fb.group({
            DATAID: [item.ID],
            dmocrmconjagntagent: [item.AgentName],
            agentid: [item.AgentCode],
            dmocrmconjagntrate: [item.Rate]
          }));
        });
      }
    });
  }
  selectedItem(event, conjuctionForm) {
    const c = this.lotSearchService.vendorData.filter(x => x.dmocustmstrcustname1 === event.item);
    if (c.length > 0) {
      conjuctionForm.controls.agentid.patchValue(c[0].dmocustmstrsapno);
    }
  }

  onChanges() {
    this.form.get('enableBranchRebate').valueChanges
    .subscribe(checked => {
      this.form.get('rebateRate').patchValue('');
      if (checked) {
        this.form.get('rebateRate').enable();
      } else {
        this.form.get('rebateRate').disable();
      }
    });
  }
  OnChangeTransactionType(ev) {
    if (ev) {
      let trnsTypeName = ev.ValueField || ev.DMOVAL;
      trnsTypeName = trnsTypeName.indexOf('~~~') > -1 ? trnsTypeName.split('~~~')[0] : trnsTypeName;
      trnsTypeName = trnsTypeName.indexOf('(') > -1 ? trnsTypeName.substr(
        trnsTypeName.indexOf('(') + 1).replace(')', '') : trnsTypeName;
      this.apiESaleyardService.post(`crmsales/getSaleType/${trnsTypeName}`)
        .pipe(map(data => data.Data))
        .subscribe(data => {
          this.optionList.DMOCRM_HeaderInf_SaleType = [];
          if (ev.ValueField) {
            this.form.get('DMOCRM_HeaderInf_SaleType').patchValue('');
          }
          if (Array.isArray(data)) {
            data.forEach(item => {
              // set ValueField for key value search box
              this.optionList.DMOCRM_HeaderInf_SaleType = [...this.optionList.DMOCRM_HeaderInf_SaleType, { ValueField: item.SALETYPENAME + ' (' + item.SALECODE + ')', TextField: item.SALETYPENAME }];
            });
          }
        });
    }
  }
  // Get Plasma Id Insert direct from sp - Biresh - CRM #1667
  // GetPlasmaId() {
  //   this.headerInformationdmos.forEach((dmo: any) => {
  //     if (dmo.Type === 'ID') {
  //       this.dmoControlService.GetPlasmaId(dmo.Name).subscribe(value => {
  //         const chldCtrl = this.form.get(dmo.Name);
  //         chldCtrl.reset(value.PlasmaID);
  //         chldCtrl.updateValueAndValidity();
  //       });
  //     }
  //   });
  // }

  get f() { return this.form.controls; }

  get conjunctionlAgents() {
    return this.form.get('conjunctionlAgents') as FormArray;
  }

  addConjunctionalAgent() {
    this.isCunjuction = false;
    const control = this.form.controls.conjunctionlAgents as FormArray;
    control.push(
      this.fb.group({
        DATAID: [null],
        dmocrmconjagntagent: [null],
        agentid: [null],
        dmocrmconjagntrate: [null]
      })
    );
  }

  deleteConjunctionalAgent(index: number) {
    this.rateVale = 0;
    const control = this.form.controls.conjunctionlAgents as FormArray;
      control.removeAt(index);
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
          await this.salesService.saveConjunctionalAgent(body).toPromise();
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  saleIdSearch = (text$: Observable<string>) => {
    return this.salesService.saleIdSearch(text$);
  }


  onSubmit() {
    this.submitted = true;
    const loginUser = this.userDetail;
    if (!this.form.valid) {
      return;
    }

    let formValue: any = {};
    if (this.isEdit) {
      formValue = this.dmoControlService.getDirtyValues(this.form);
    } else {
      formValue = { ...this.form.value };
    }

    if(this.CundBranchComp !== ''){
      formValue.DMOCRM_HInfo_CondCmpCode = this.CundBranchComp;
      formValue.DMOCRM_HeaderInfo_CmpCode = this.CundBranchComp;
    }


    if (Object.keys(formValue).includes('DMOCRM_HeaderInf_SaleDate')) {
      if (formValue.DMOCRM_HeaderInf_SaleDate != null &&
        formValue.DMOCRM_HeaderInf_SaleDate !== '' &&
        formValue.DMOCRM_HeaderInf_SaleDate.hasOwnProperty('year') &&
        formValue.DMOCRM_HeaderInf_SaleDate.hasOwnProperty('month') &&
        formValue.DMOCRM_HeaderInf_SaleDate.hasOwnProperty('day')) {
              // formValue.DMOCRM_HeaderInf_SaleDate = this.ngbDateFRParserFormatter.format(formValue.DMOCRM_HeaderInf_SaleDate);
        const dateyyMMdd = ''.concat(formValue.DMOCRM_HeaderInf_SaleDate.year, '-', formValue.DMOCRM_HeaderInf_SaleDate.month, '-', formValue.DMOCRM_HeaderInf_SaleDate.day);
        formValue.DMOCRM_HeaderInf_SaleDate = dateyyMMdd;
        if (environment.Setting.dateTimeFormat24 === true) {
          formValue.DMOCRM_HeaderInf_SaleDate = this.getUserDateTime(formValue.DMOCRM_HeaderInf_SaleDate,
            'MM/dd/yyyy hh:mm:ss', loginUser.TimeZone);
        } else {
          formValue.DMOCRM_HeaderInf_SaleDate = this.getUserDateTime(formValue.DMOCRM_HeaderInf_SaleDate,
            'MM/dd/yyyy hh:mm:ss', loginUser.TimeZone);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const saledate = new Date(dateyyMMdd);
        saledate.setHours(0, 0, 0, 0);
        if (this.isDateGraeter === false && saledate > today) {
          this.msg.showMessage('Warning', {
            body: 'You have selected a future date. Would you like to proceed?',
            btnText: 'Yes',
            checkboxText: 'Proceed',
            isConfirmation: true,
            isDelete: false,
            callback: this.redirectionConfirmation,
            caller: this,
          })
          // this.showErrorMessage('You have selected a future date. would you like to proceed?', 'Warning', 'Yes',
          // this.redirectionConfirmation, false, true, true, 'would you like to proceed?');
          return;
        }
      } else {
        if (isNaN(Date.parse(formValue.DMOCRM_HeaderInf_SaleDate))) {
          formValue.DMOCRM_HeaderInf_SaleDate = null;
        }
        // formValue.DMOCRM_HeaderInf_SaleDate = null;
      }
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
    }
    delete formValue.enableBranchRebate;
    delete formValue.rebateRate;
   
    if(formValue.dmocrmconjagntsetconjag == true || formValue.dmocrmconjagntsetconjag == 'Yes'){
      formValue.DMOCRM_ConjAgnt_SetConjAg = 'Yes';
    } else {
      formValue.DMOCRM_ConjAgnt_SetConjAg = 'No';
      const controlAgent = (this.form.get('conjunctionlAgents') as FormArray);
      controlAgent.controls.forEach(element=>{
        this.salesService.deleteConjunctionalAgent(element['controls'].DATAID.value).subscribe(x=>{});
      })
    }
    delete formValue.conjunctionlAgents;
    delete formValue.dmocrmconjagntsetconjag;
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
        if (conjunctionalAgentsData) {
          const conjData = [];
          Object.keys(conjunctionalAgentsData).forEach(key => {
            const control = this.form.controls.conjunctionlAgents as FormArray;
            conjData.push(control.controls[key].value);
          });
          await this.saveConjunctionalAgent(conjData);
        }
        this.activeModal.close(true);
      });

    } else {
      // this.form.get('DMOCRM_HeaderInf_TranType').enable();
      if(!this.form.get('DMOCRM_HeaderInf_ContID').value) {
        this.form.get('DMOCRM_HeaderInf_ContID').patchValue(this.ContractId);
      }
      Object.keys(formValue).forEach(key => {
        if (formValue[key] == null || formValue[key] === '' || formValue[key] === 'Select...') {
          delete formValue[key];
        }
      });
      // this.form.get('DMOCRM_HeaderInf_TranType').disable();
      const submitData: any = {
        ProcessName: this.processName,
        UserName: this.currentUser.UserName,
        TriggerName: 'TRGR_PreProcessing_Next',
        Data: [formValue]
      };

      if (this.isSaleLotShowing) {
        this.applicationService.insertApplication(submitData).subscribe(async response => {
          this.transactionId = response.result.transactionId;
          if (conjunctionalAgentsData.length) {
            await this.saveConjunctionalAgent(conjunctionalAgentsData);
          }
          //const PId = this.form.get('DMOCRM_HeaderInf_SaleID');// Get Plasma Id Insert direct from sp - Biresh - CRM #1667

          // Save Sale Contract Mapping
          this.SaleContract();// Get Plasma Id Insert direct from sp - Biresh - CRM #1667
          // Save lot Mapping
         // this.SaleLot(PId.value);

          await this.saveLotData(this.SelectedRecordIds);

          this.activeModal.close(true);
        });
      } else {
        this.GetLotConfig();
        this.isSaleLotShowing = true;
      }

    }

  }

  GetLotConfig() {
    const cl = new ColumnList();
    const RequestBody = {
      ProcessName: 'LMKOPECESLot',
      PageSize: -1,
      PageNumber: '0',
      SortColumn: '-1',
      SortOrder: '-1',
      TimeZone: '-330',
     // ColumnList: 'lmkoeelotdmolotnumber,lmkoeelotdmospaaccno,lmkoeelotdmotrdname,lmkoeelotdmoproduct,lmkoeelotdmoquantity,lmkoeelotdmobuyerid,lmkoeelotdmobuyname,lmkoeelotdmoturnover',
     ColumnList: cl.LMKOPECESLot,
      GridFilters: [
      ],
      ParentTransactionId: this.SelectedRecordIds.join(','),
      ViewName: ''
    };
    this.GetLotData(RequestBody);
  }

  GetLotData(body) {
    this.econtract.GridData(body).subscribe(
      data => {
        this.dataSource = data.Data;
        this.itemsCount = data.RecordsCount;
      });
  }
  getGstRate() {
    this.lot.getGstRate().subscribe(result => {
      this.GstRate=result.GSTRate;
    });
  }
  // savelotdatg function is use to map data and save on remote.
  async saveLotData(parentId) {
    this.submitData = [];
    let lotId = 0;
    this.dataSource.filter(x => x.selected === true).forEach(element => {
      lotId = lotId + 1;
      if (element) {
        this.submitData.push(
          {
            // Vendor Id
            DMOLot_VInfo_VendorId: element.lmkoeelotdmospaaccno,
            // Vendor Name
            DMOLot_VInfo_VendorNam: element.lmkoeelotdmotrdname,
            // Vendor Branch
            DMOLot_VInfo_VendorBrc: element.lmkoeelotdmovdombrch,
            // Vendor Pic
            DMOLot_VInfo_VendorPic: element.lmkoeelotdmovendorpic,
            // GST
            DMOLot_VInfo_GstReg: element.lmkoeelotdmovendorgstreg,
            // Sale Ref
            DMOLot_VInfo_AcSaleRef: element.dmolotvinfoacsaleref,
            // Buyer Id
            DMOLot_BInfo_BuyerId: element.lmkoeelotdmobuyerid,
            // Buyer Name
            DMOLot_BInfo_BuyerName: element.lmkoeelotdmobuyname,
            // Buyer Branch
            DMOLot_BInfo_BuyerBrc: element.lmkoeelotdmobuybrch,
            // Buyer Pic
            DMOLot_BInfo_BuyerPic: element.lmkoeelotdmobuyerpic,
            // Invoice Reference
            DMOLot_BInfo_InvoiceRef: element.dmolotbinfoinvoiceref,
            // Bread
            DMOLot_BInfo_SetIntBBReb: element.dmolotbinfosetintbbreb,
            // Rate
            DMOLot_BInfo_Rate: element.dmolotbinfosetintbbreb,
            // Lot Number
            DMOLot_LotInfo_LotNum: element.lmkoeelotdmolotnumber,
            // Lot Quantity
            DMOLot_LotInfo_Qnty: element.lmkoeelotdmoquantity,
            // Product
            DMOLot_LotInfo_Pdct: element.lmkoeelotdmoproduct,
            // Product description
            DMOLot_LotInfo_ProdDesc: element.lmkoeelotdmoproductname,
            // Lot bread
            DMOLot_LotInfo_Brd: element.lmkoeelotdmobreed,
            // $/Head
            DMOLot_LotInfo_Price$PHd: element.lmkoeelotdmopriceaud,
            // Cost/Head
            DMOLot_LotInfo_PriceCPKg: element.lmkoeelotdmopriceckg,
            DMOLot_LotInfo_PriceType:element.lmkfmdmocostper,
            LMK_LD_ProductCategory:element.lmkoeelotdmoproductcat,
            // Weight
            DMOLot_LotInfo_WtKg: element.lmkoeelotdmotweight,
            // turnover
            DMOLot_LotInfo_TurnovAUD: element.lmkoeelotdmoturnover,
            DMOLot_LotInfo_GST: element.lmkoeelotdmovendorgstreg === 'No' ?  '0' : (this.GstRate * Number(element.lmkoeelotdmoturnover) / 100),
            DMOLot_LotInfo_TurnoverGs: element.lmkoeelotdmovendorgstreg === 'No' ?  Number(element.lmkoeelotdmoturnover) :  Number(element.lmkoeelotdmoturnover) + (this.GstRate * Number(element.lmkoeelotdmoturnover) / 100),
            // Sex
            DMOLot_LotInfo_Sex: element.lmkoeelotdmosex,

            DMOLot_LotInfo_PaintMk: element.dmolotlotinfopaintmk,

            DMOLot_LotInfo_ContractId: element.RecordId,
            DMOLot_LotInfo_HGP: element.dmolotlotinfohgp,
            DMOLot_LotInfo_TransClaim: element.dmolotlotinfotransclaim,
            DMOLot_LotInfo_LotID: lotId,
            opscLotTrnsid: element.TRNSCTNID,
            // Gst Rate
            DMOLot_LotInfo_GSTRate: this.GstRate,
            // Notes Comment 
            NotesComment: element.lmkoeelotdmogridrefno,
            DOMLot_VInfo_CompCode:element.lmkoeelotdmovendcompname,
            DMOLot_BInfo_CompCode:element.lmkoeelotdmobuycompname
          }
        );
      }
    });
    this.submitData.forEach((ele, index) => {
      Object.keys(ele).forEach(key => {
        if (this.submitData[index][key] == null || this.submitData[index][key] === '' || this.submitData[index][key] === undefined) {
          delete this.submitData[index][key];
        }
      });
    });
    if (this.submitData.length > 0) {
      for (const element of this.submitData) {
        const opscLotTrnsid = element.opscLotTrnsid;
        const NotesComment = element.NotesComment;
        delete element.opscLotTrnsid;
        delete element.NotesComment;
        const submitData: any = {
          ProcessName: 'LMKLivestockLots',
          UserName: this.currentUser.UserName,
          TriggerName: 'TRGR_LotPreProcessing_Calculate',
          ParentTransactionID: this.transactionId,
          Data: [element]
        };
        const x = await this.applicationService.insertApplication(submitData).toPromise();
        await this.lot.updateeContractLot({ OpsLotTrnsctsId: opscLotTrnsid, SaleLotTrnsctsId: x.result.transactionId,SaleTrnsctnId:this.transactionId }).toPromise();
        // #CRMI-1237 - EXT 457 - Grid reference text needs to appear in C/Kg lot for e-contract records - Roshan - 09/08/2020
        if (NotesComment && element.DMOLot_LotInfo_PriceType == 'Grid Reference') {
          const NotesRequest = {
            Identifier: {
              Name: "",
              Value: "",
              TrnsctnID: x.result.transactionId
            },
            CommentType: "DiscussionBoard",
            Comment: NotesComment,
            Files: []
          }
          await this.econtract.sendNoteMessage(NotesRequest).subscribe();
        }
      }
      this.router.navigate(['/crm/sales', this.transactionId]);
    } else {
      this.router.navigate(['/crm/sales', this.transactionId]);
    }
  }
  // Get Plasma Id Insert direct from sp - Biresh - CRM #1667
  SaleContract() {
    const requestData: any = {
      ContractTransactionID: this.SelectedRecordIds.join(','),
      ContractID: '',
      SaleTransactionID: this.transactionId,
      SaleID: ''
    };
    this.econtract.saveSaleContract(requestData).toPromise();
  }
  SaleLot(Saleid) {
    const requestDataLot: any = {
      LotId: '0',
      LotTransactionId: this.dataSource.filter(x => x.selected === true).map(x => x.TRNSCTNID).join(','),
      SaleId: Saleid,
      SaleTransactionId: this.transactionId,
    };
    this.econtract.saveSaleLot(requestDataLot).toPromise();
  }
  conjuctionalAgentSearch = (text$: Observable<string>) => {
    return this.lotSearchService.conjuctionalAgentSearch(text$);
  }
  onSubmitRecord() {
    const control = this.form.controls.conjunctionlAgents as FormArray;
    this.rateVale = 0;
    control.controls.forEach(element => { this.rateVale += element.value.dmocrmconjagntrate; });
    if (this.rateVale > 100 && this.isCunjuction === false) {
      this.msg.showMessage('Warning', {
        header: 'Confirmation Message',
        body: 'Conjunctional commission exceeds 100%. Do you want to continue?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.redirectionConfirmation,
        caller: this,
      });
    } else {
      this.onSubmit();
    }

  }
  redirectionConfirmation(modelRef: NgbModalRef, Caller: EContractViewModalComponent) {
    Caller.isCunjuction = true;
    Caller.isDateGraeter = true;
    Caller.onSubmit();
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
}
