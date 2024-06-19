import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormArray } from '@angular/forms';
import { urlValidator } from '../validators/url.validator';
import { phoneNumberValidator } from '../validators/phone.validator';
import { NgbDateFRParserFormatter } from './ngb-date-fr-parser-formatter';
import { DropdownlistValidator, CheckBoxListValidator } from '../validators';
import { UserDetail } from '../models/user-detail';
import { DmoImageControlService } from './dmo-image-control.service';
import { stubFalse } from 'lodash';
@Injectable({ providedIn: 'root' })
export class BMConditionService {
    dmos: any;
    formValue: any;
    BmogJson: any;
    wfJson: any;
    triggerCondJson: any;
    executionOrderCond: any = {};
    constructor( private userDetail:UserDetail,private dmoImage:DmoImageControlService) {

    }
    /** Start below function to use call from parent control and call parent and child condition method */
    BMCond_Click(objDmo: any, dmos: any, form: any, condFrompageLoad: boolean = false) {
        const objDmoCond = objDmo.Conditions;
        Object.keys(objDmo.Conditions).forEach((element: any) => {
            const condJsonData = objDmoCond[element];
            if (condJsonData !== undefined) {
                let chldCondExecute = true;
                let isEnable: any = condJsonData.IsEnabled===undefined?null:condJsonData.IsEnabled;
                let isVisible: any = condJsonData.IsVisible===undefined?null: condJsonData.IsVisible;
                let isRequired: any = condJsonData.IsRequired===undefined?null:condJsonData.IsRequired;
                const condArea = condJsonData.Area;
                const isExElse = condJsonData.ExecuteElse;
                const condResult = this.GetParentControlCondResult(condJsonData.ParentDmoConditions, form, dmos, isVisible, isExElse);
                if (condResult === false) {
                    if (isExElse === true) {
                        isVisible = isVisible === null ? isVisible : !isVisible;
                        isEnable = isEnable === null ? isEnable : !isEnable;
                        isRequired = isRequired === null ? isRequired : !isRequired;
                    }
                    else {
                        chldCondExecute = false;
                    }
                }
                if (chldCondExecute)
                    this.PerformActiononChildControls(condJsonData.ChildDmoConditions, condArea, isEnable, isRequired, isVisible, form, condFrompageLoad);
            }
        });
    }
    /** End below function to use call from parent control and call parent and child condition method */

    /*Start Below method use for parent control value matching and return condition result as true and false */
    GetParentControlCondResult(jsonData: any, form: any, dmos: any, isVisible: boolean, isExElse: boolean): any {
        this.formValue = form.getRawValue();
        this.dmos = dmos;
        let ctrlValue: any = '';
        let pCondResult: any = '';
        let pCondLogOptr: any = '';
        if (Object.keys(jsonData).length === 0) {
            pCondResult = 'No Parent Condition';
            return pCondResult;
        }
        Object.keys(jsonData).forEach((element) => {
            const condExpr = jsonData[element].ConditionExpression;
            const compVal = jsonData[element].Value;
            const logicalOpr = jsonData[element].LogicalOperator;
            const contrlType = jsonData[element].Type;
            const ctrlName = jsonData[element].Name;
            let ctrlVal = this.formValue[ctrlName];
            const bmoGuid = jsonData[element].BmoGuid;
            const dmogGuid = jsonData[element].DmogGuid;

            switch (contrlType) {
                case 'CheckBoxList':
                    {
                        if (this.formValue[ctrlName] != undefined) {
                            const options = [];
                            this.formValue[ctrlName].forEach((val, i) => {
                                if (val) {
                                    options.push(this.dmos[bmoGuid][dmogGuid][element].dmoOption.split(',')[i]);
                                }
                            });
                            if (options.length === 0) {
                                ctrlVal = '';
                            } else if (options.length === 1) {
                                ctrlVal = options[0];
                            } else {
                                for (let i = 0; i < options.length; i++) {
                                    i === 0 ? ctrlVal = options[i] : ctrlVal += '|' + options[i];
                                }
                            }
                        }
                        else {
                            ctrlVal = '';
                        }
                        ctrlValue = ctrlVal;
                    }
                    break;
                    case 'RoleTypeHidden':
                      let  userRoles:any='';
                      userRoles= this.userDetail.ListRole;
                        for (let i = 0; i < userRoles.length; i++) {
                            i === 0 ? ctrlVal = userRoles[i] : ctrlVal += '|' + userRoles[i];
                        }
                        ctrlValue = ctrlVal;
                        break;
                default:
                    {
                        ctrlValue = ctrlVal;

                    }
            }
            if(contrlType!=='KeyValueSearchBox'){
            let condResult: any = false;
            let condValue: any;
            if (compVal.indexOf("|") > -1) {
                let arrcompValue ;
                if(contrlType === 'RoleTypeHidden'){
                    arrcompValue = ctrlValue.split('|');
                } else{
                    arrcompValue =  compVal.split('|');
                }
                //const arrcompValue = ctrlValue.split('|');
                if (ctrlValue != undefined && ctrlValue!=null && ctrlValue.indexOf("|") > -1) {
                    compVal.split("|").forEach((key: any) => {
                        condValue = arrcompValue.find((a: any) => {
                            return a.replace(/\s/g, '') === key.replace(/\s/g, '');
                        });
                        if (condValue !== undefined) {
                            condResult = true;
                            return false;
                        }
                    });
                } else {
                    condResult = arrcompValue.find(a => a.replace(/\s/g, '') === (ctrlValue == undefined ? ctrlValue : ctrlValue.replace(/\s/g, ''))) === undefined ? false : true;
                }
            } else {
                if (ctrlValue !== undefined && ctrlValue !== null && ctrlValue.indexOf("|") > -1) {
                    ctrlValue.split("|").forEach((key: any) => {
                        if (key.replace(/\s/g, '') == (compVal == undefined ? compVal : compVal.replace(/\s/g, ''))) {
                            condResult = true;
                        }
                    });
                } else {
                    condResult = (compVal == undefined ? compVal : compVal.replace(/\s/g, '')) === (ctrlValue == undefined ? ctrlValue : ctrlValue.replace(/\s/g, '')) ? true : false;
                }
            }
            condResult = condExpr === 'equal' ? condResult : !condResult;
            pCondLogOptr = logicalOpr === 'AND' ? '&&' : '||';

            pCondResult = pCondResult === '' ? condResult : pCondResult;
            if (pCondResult !== '') {
                if (pCondLogOptr === '&&') {
                    pCondResult = (pCondResult === true && condResult === true) ? true : false;
                } else {
                    pCondResult = (pCondResult === false && condResult === false) ? false : true;
                }
            } else {
                pCondResult = condResult;
            }
            if (isVisible === false && (contrlType === 'CheckBoxList' || contrlType === 'RadioButtonList' || contrlType === 'DropDownList')) {
                if (isExElse === true) {
                    if (pCondResult === false && (ctrlValue === '' || ctrlValue === 'Select...')) {
                        pCondResult = true;
                    }
                }
            }
        }
        });

        return pCondResult;
    }
    /*End Below method use for parent control value matching and return condition result as true and false */

    /* Start Below method use for child controls(bmo, dmog and dmo) to show/hide, enable/disbale and required/non required
      condition on form load.  */
    PerformActiononChildControls(jsonData: any, condArea: string, isEnable: any, isRequired: any,
        isVisible: any, form: any, condFrompageLoad: boolean = false, isCallFromWFCond: boolean = false): any[] {
        switch (condArea) {
            case 'DataModelObject':
                Object.keys(jsonData).forEach((dmoGuid: any) => {
                    const bmoGuid = jsonData[dmoGuid].BmoGuid;
                    const dmogGuid = jsonData[dmoGuid].DmogGuid;
                    if (dmogGuid !='' && bmoGuid!='' && this.dmos[bmoGuid] !== undefined &&
                    this.dmos[bmoGuid][dmogGuid]!== undefined && this.dmos[bmoGuid][dmogGuid][dmoGuid] !== undefined)  {
                        if (isCallFromWFCond === true && isVisible === false) {
                            this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState = true;
                        }
                        if ((this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState && isCallFromWFCond)
                            || this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState === false) {
                            if (isVisible != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsVisible = isVisible; }
                            if (isEnable != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsEnabled = isEnable; }
                            if (isRequired != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsRequired = isRequired; }
                            const ctrlName = jsonData[dmoGuid].Name;
                            const ctrlType = jsonData[dmoGuid].Type;
                            this.ActionOnChildControl(ctrlName, ctrlType, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsEnabled, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsVisible, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsRequired, form, condFrompageLoad);
                            if (this.BmogJson != undefined && (ctrlType === 'RadioButtonList' || ctrlType === 'DropDownList' || ctrlType === 'CheckBoxList'
                                || ctrlType === 'RoleType' || ctrlType === 'RadioButtonList' || ctrlType === 'DropDownList') && isVisible != null && isVisible != undefined) {
                                this.BmogJson.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowid => {
                                    this.BmogJson.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowid].Columns
                                        .forEach(objCOLUMN => {
                                            objCOLUMN.List.forEach(dmoguid => {
                                                if (dmoguid === dmoGuid) {
                                                    this.BMCond_Click(objCOLUMN.DataModelObjects[dmoguid], this.dmos, form, condFrompageLoad);
                                                }
                                            });
                                        });
                                });
                            }
                        }
                    }
                });
                break;
            case 'DataModelGroup':
                Object.keys(jsonData).forEach(dmogGuid => {
                    const bmoGuid = jsonData[dmogGuid].BmoGuid;
                    if (this.dmos[bmoGuid][dmogGuid] != undefined) {
                        if (isCallFromWFCond === true && isVisible === false) {
                            this.dmos[bmoGuid][dmogGuid].isHideFromStageState = true;
                        }
                        if ((this.dmos[bmoGuid][dmogGuid].isHideFromStageState && isCallFromWFCond)
                            || this.dmos[bmoGuid][dmogGuid].isHideFromStageState === false) {
                            if (isVisible != null) { this.dmos[bmoGuid][dmogGuid].IsVisible = isVisible; }
                            if (isEnable != null) { this.dmos[bmoGuid][dmogGuid].IsEnabled = isEnable; }
                            if (isRequired != null) { this.dmos[bmoGuid][dmogGuid].IsRequired = isRequired; }
                            Object.keys(this.dmos[bmoGuid][dmogGuid]).forEach(dmoGuid => {
                                if (this.dmos[bmoGuid][dmogGuid][dmoGuid] instanceof Object) {
                                    const ctrlName = this.dmos[bmoGuid][dmogGuid][dmoGuid].Name;
                                    const ctrlType1 = this.dmos[bmoGuid][dmogGuid][dmoGuid].Type;
                                    if ((this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState && isCallFromWFCond)
                                        || this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState === false) {
                                        if (isVisible != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsVisible = isVisible; }
                                        if (isEnable != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsEnabled = isEnable; }
                                        if (isRequired != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsRequired = isRequired; }
                                        this.ActionOnChildControl(ctrlName, ctrlType1, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsEnabled, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsVisible, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsRequired, form, condFrompageLoad);
                         
                                    }
                                }
                            });
                        }
                        if (this.BmogJson != undefined && isVisible == true) {
                            this.BmogJson.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowid => {
                                this.BmogJson.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowid].Columns
                                    .forEach(objCOLUMN => {
                                        objCOLUMN.List.forEach(dmoguid => {                                       
                                            if (objCOLUMN.DataModelObjects[dmoguid].Conditions) {
                                            const ctrlType = objCOLUMN.DataModelObjects[dmoguid].Type;
                                            if ( objCOLUMN.DataModelObjects[dmoguid] && (ctrlType === 'RadioButtonList' || ctrlType === 'DropDownList' || ctrlType === 'CheckBoxList'
                                                || ctrlType === 'RoleType' || ctrlType === 'RadioButtonList' || ctrlType === 'DropDownList')&& condFrompageLoad==false) {                    
                                                    this.BMCond_Click(objCOLUMN.DataModelObjects[dmoguid], this.dmos, form, condFrompageLoad);
                                            }
                                        }

                                        });
                                    });
                            });
                        }
                    }
                });
                break;
            case 'BusinessModelObject':
                Object.keys(jsonData).forEach(bmoGuid => {
                    if (this.dmos[bmoGuid] != undefined) {
                        if (isCallFromWFCond === true && isVisible === false) {
                            this.dmos[bmoGuid].isHideFromStageState = true;
                        }
                        if ((this.dmos[bmoGuid].isHideFromStageState && isCallFromWFCond)
                            || this.dmos[bmoGuid].isHideFromStageState === false) {
                            if (isVisible != null) { this.dmos[bmoGuid].IsVisible = isVisible; }
                            if (isEnable != null) { this.dmos[bmoGuid].IsEnabled = isEnable; }
                            if (isRequired != null) { this.dmos[bmoGuid].IsRequired = isRequired; }
                            Object.keys(this.dmos[bmoGuid]).forEach(dmogGuid => {
                                if (this.dmos[bmoGuid][dmogGuid] instanceof Object) {
                                    if ((this.dmos[bmoGuid][dmogGuid].isHideFromStageState && isCallFromWFCond)
                                        || this.dmos[bmoGuid][dmogGuid].isHideFromStageState === false) {
                                        if (isVisible != null) { this.dmos[bmoGuid][dmogGuid].IsVisible = isVisible; }
                                        if (isEnable != null) { this.dmos[bmoGuid][dmogGuid].IsEnabled = isEnable; }
                                        if (isRequired != null) { this.dmos[bmoGuid][dmogGuid].IsRequired = isRequired; }
                                        Object.keys(this.dmos[bmoGuid][dmogGuid]).forEach(dmoGuid => {
                                            if (this.dmos[bmoGuid][dmogGuid][dmoGuid] instanceof Object) {
                                                const ctrlName = this.dmos[bmoGuid][dmogGuid][dmoGuid].Name;
                                                const ctrlType = this.dmos[bmoGuid][dmogGuid][dmoGuid].Type;
                                                if ((this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState && isCallFromWFCond)
                                                    || this.dmos[bmoGuid][dmogGuid][dmoGuid].isHideFromStageState === false) {
                                                    if (isVisible != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsVisible = isVisible; }
                                                    if (isEnable != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsEnabled = isEnable; }
                                                    if (isRequired != null) { this.dmos[bmoGuid][dmogGuid][dmoGuid].IsRequired = isRequired; }
                                                    // const chldControl = form.get(ctrlName);
                                                    this.ActionOnChildControl(ctrlName, ctrlType, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsEnabled, this.dmos[bmoGuid][dmogGuid][dmoGuid].IsVisible,  this.dmos[bmoGuid][dmogGuid][dmoGuid].IsRequired, form, condFrompageLoad);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
                break;
            case 'Trigger':
                {
                    Object.keys(jsonData).forEach(triggerId => {
                        if (isVisible != null && this.triggerCondJson[triggerId] != undefined) { this.triggerCondJson[triggerId].IsVisible = isVisible; }
                        if (isEnable != null && this.triggerCondJson[triggerId] != undefined) { this.triggerCondJson[triggerId].IsEnabled = isEnable; }
                        if (isRequired != null && this.triggerCondJson[triggerId] != undefined) { this.triggerCondJson[triggerId].IsRequired = isRequired; }
                    });
                    break;
                }
            default:
                break;
        }
        //  this.cdr.detectChanges();
        return this.dmos;
    }
    ActionOnChildControl(ctrlName: any, ctrlType: string, isEnable: boolean, isVisible: boolean, isRequired: boolean,
        form: FormGroup, condFrompageLoad: boolean): void {
        if (isRequired === true) {
            switch (ctrlType) {
                case 'UrlTextBox':
                    {
                        form.get(ctrlName).setValidators([Validators.required, urlValidator]);
                    }
                    break;
                case 'PhoneTextBox':
                    {
                        form.get(ctrlName).setValidators([Validators.required, phoneNumberValidator]);
                    }
                    break;
                case 'EmailEditBox':
                    {
                        form.get(ctrlName).setValidators([Validators.required, Validators.email]);
                    }
                    break;
                case 'DropDownList':
                    {
                       // form.get(ctrlName).setValidators([Validators.required, DropdownlistValidator]);
                       form.get(ctrlName).setValidators(Validators.required);
                    }
                    break;
                case 'DateTimeZone':
                    {
                        const groupName: any = form.get(ctrlName);
                        Object.keys(groupName.controls).forEach(ctrl => {
                            groupName.get(ctrl).setValidators(Validators.required);
                        });
                    }
                    break;
                case 'CheckBoxList':
                    {
                        form.get(ctrlName).setValidators([Validators.required, CheckBoxListValidator]);
                    }
                    break;
                case 'ProgressBar':
                    {
                        // Object.keys(form.get(ctrlName).).forEach(ctrl => {
                        //     chldControl.get(ctrl).setValidators(Validators.required);
                        // });
                    }
                    break;
                default:
                    {
                        form.get(ctrlName).setValidators(Validators.required);
                    }
                    break;
            }
            form.get(ctrlName).updateValueAndValidity();

        } else if (isRequired === false) {
            form.get(ctrlName).clearValidators();
            form.get(ctrlName).updateValueAndValidity();
        } else if ((isRequired === null || isRequired === undefined) && isVisible == false) {
            
            form.get(ctrlName).clearValidators();
            form.get(ctrlName).updateValueAndValidity();
        }
        if (isEnable === true) {
            form.get(ctrlName).enable();
            form.get(ctrlName).updateValueAndValidity();
        } else if (isEnable === false) {
            if (form.get(ctrlName) != null) {
                form.get(ctrlName).disable();
                form.get(ctrlName).updateValueAndValidity();
            }
        }
        if (isVisible === false && condFrompageLoad === false) {
            switch (ctrlType) {
                case 'DropDownList':
                    form.get(ctrlName).reset('');
                    break;
                case 'DateTimeZone':
                    {
                        const groupName: any = form.get(ctrlName);
                        Object.keys(groupName.controls).forEach(ctrl => {
                            if (ctrl === 'date') {
                                groupName.get(ctrl).reset();
                            } else if (ctrl === 'Time') {
                                groupName.get(ctrl).reset('12:00 AM');
                            }
                            groupName.get(ctrl).updateValueAndValidity();
                        });
                        break;
                    }
                case 'ID':
                    break;
                    case 'UploadDocument':                        
                            if(this.dmoImage.ImagesFileList.length>0){                                
                                this.dmoImage.ImagesFileList.forEach(element => {
                                        if(element.dmoName === ctrlName){                                            
                                            this.dmoImage.ImagesRemoveFileList.push(element);
                                            const index = this.dmoImage.ImagesFileList.indexOf(element);
                                            if(index!== -1)    {
                                             this.dmoImage.ImagesFileList.splice(index,1);
                                            } 
                                        }
                                });                                           
                            }
                            if(this.dmoImage.SavedImagesFileList.length>0){                                
                                this.dmoImage.SavedImagesFileList.forEach(element => {
                                        if(element.dmoName === ctrlName){                                            
                                            this.dmoImage.ImagesRemoveFileList.push(element);
                                            const index = this.dmoImage.SavedImagesFileList.indexOf(element);
                                            if(index!== -1)    {
                                             this.dmoImage.SavedImagesFileList.splice(index,1);
                                            } 
                                        }
                                });                                           
                            }
                    break;
                default:
                    {
                        form.get(ctrlName).reset('');
                        break;
                    }
            }
            form.get(ctrlName).updateValueAndValidity();
            form.get(ctrlName).markAsDirty();
            form.get(ctrlName).markAsTouched();
        }

    }
    /* End Below method use for child controls(bmo, dmog and dmo) to show/hide, enable/disbale and required/non required
     condition on form load.  */

    /* Start Below method use for run condition on form load.  */
    LoadBMConditiononPageLoad(BMOGJSON: any, form: FormGroup, dmosJson: any, triggerCondJson: any): void {
        this.BmogJson = BMOGJSON;
        this.triggerCondJson = triggerCondJson;
        const ConditionSeq = [{ ExecOrd: 0, Area: 'BusinessModelObject', Visible: false },
        { ExecOrd: 0, Area: 'BusinessModelObject', Visible: null },
        { ExecOrd: 0, Area: 'BusinessModelObject', Visible: true },
        { ExecOrd: 0, Area: 'DataModelGroup', Visible: false },
        { ExecOrd: 0, Area: 'DataModelGroup', Visible: null },
        { ExecOrd: 0, Area: 'DataModelGroup', Visible: true },
        { ExecOrd: 0, Area: 'DataModelObject', Visible: false },
        { ExecOrd: 0, Area: 'DataModelObject', Visible: null },
        { ExecOrd: 0, Area: 'DataModelObject', Visible: true },
        { ExecOrd: 0, Area: 'Trigger' },
        { ExecOrd: 0, Area: 'Trigger', Visible: false },
    ];

        BMOGJSON.List.forEach(bmoGuid => {
            if (BMOGJSON.BusinessModelObjects[bmoGuid].List != undefined) {
                BMOGJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
                    BMOGJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
                        BMOGJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns
                            .forEach(objCOLUMN => {
                                objCOLUMN.List.forEach(dmoGUID => {
                                    Object.keys(objCOLUMN.DataModelObjects[dmoGUID].Conditions).forEach(condid => {
                                        const condObj = objCOLUMN.DataModelObjects[dmoGUID].Conditions[condid];
                                        ConditionSeq.forEach((key: any) => {
                                            if (key.Area === condObj.Area
                                                && key.Visible === condObj.IsVisible) {
                                                let chldCondExecute = true;
                                                let isEnable: any = condObj.IsEnabled;
                                                let isVisible: any = condObj.IsVisible;
                                                let isRequired: any = condObj.IsRequired;
                                                const condArea = condObj.Area;
                                                const isExElse = condObj.ExecuteElse;
                                                const condResult = this.GetParentControlCondResult(condObj.ParentDmoConditions, form, dmosJson, isVisible, isExElse);
                                                if (condResult === false) {
                                                    if (isExElse === true) {
                                                        isVisible = isVisible === null ? isVisible : !isVisible;
                                                        isEnable = isEnable === null ? isEnable : !isEnable;
                                                        isRequired = isRequired === null ? isRequired : !isRequired;
                                                    }
                                                    else {
                                                        chldCondExecute = false;
                                                    }
                                                }
                                                if (chldCondExecute) {
                                                    this.PerformActiononChildControls(condObj.ChildDmoConditions, condArea,
                                                        isEnable, isRequired, isVisible, form, true, false);
                                                }
                                            } else if (condObj.ExecutionOrder > 0) {
                                                this.executionOrderCond[condid] = condObj;
                                            }
                                        });
                                    });
                                });
                            });
                    });
                });
            }

        });
        if (this.executionOrderCond != null) {
            Object.keys(this.executionOrderCond).forEach(condid => {
                const condObj = this.executionOrderCond[condid];
                let isEnable: any = condObj.IsEnabled;
                let isVisible: any = condObj.IsVisible;
                let isRequired: any = condObj.IsRequired;
                const condArea = condObj.Area;
                const isExElse = condObj.ExecuteElse;
                const condResult = this.GetParentControlCondResult(condObj.ParentDmoConditions, form, dmosJson, isVisible, isExElse);
                if (condResult === false) {
                    if (isExElse === true) {
                        isVisible = isVisible === null ? isVisible : !isVisible;
                        isEnable = isEnable === null ? isEnable : !isEnable;
                        isRequired = isRequired === null ? isRequired : !isRequired;
                    }
                }
                this.PerformActiononChildControls(condObj.ChildDmoConditions, condArea,
                    isEnable, isRequired, isVisible, form, true, false);
            });
        }
    }
    /* End Below method use for run condition on form load.  */
    /** Start load workflow condition on form load */
    LoadWFConditiononPageLoad(wfJson: any, currentStage: string, currentState: string, BMId: Number, form: FormGroup, dmosJson: any, BMJSON: any) {
        this.wfJson = wfJson;
        this.BmogJson = BMJSON;
        const ConditionSeq = [{ Area: 'BusinessModelObject', Visible: false },
        { Area: 'BusinessModelObject', Visible: null }, { Area: 'BusinessModelObject', Visible: true },
        { Area: 'DataModelGroup', Visible: false }, { Area: 'DataModelGroup', Visible: null },
        { Area: 'DataModelGroup', Visible: true }, { Area: 'DataModelObject', Visible: false },
        { Area: 'DataModelObject', Visible: null }, { Area: 'DataModelObject', Visible: true },
        { Area: 'Trigger', Visible: false },
        { Area: 'Trigger', Visible: null }, { Area: 'Trigger', Visible: true }];
        if (wfJson.Stages[currentStage]) {
            ConditionSeq.forEach((key: any) => {
                Object.keys(wfJson.Stages[currentStage].Conditions).forEach(condId => {
                    const condObject = wfJson.Stages[currentStage].Conditions[condId];
                    const condVisible = condObject.IsVisible == undefined ? null : condObject.IsVisible;
                    if (parseInt(condObject.BusinessModelID) === BMId) {
                        if (key.Area === condObject.Area && key.Visible === condVisible) {
                            this.CheckWorkFlowCondition(condObject, form, dmosJson, true);
                        }
                    }
                });
                if (wfJson.Stages[currentStage].States[currentState]) {
                    Object.keys(wfJson.Stages[currentStage].States[currentState].Conditions).forEach(condId => {
                        const condObject = wfJson.Stages[currentStage].States[currentState].Conditions[condId];
                        const condVisible = condObject.IsVisible == undefined ? null : condObject.IsVisible;
                        if (parseInt(condObject.BusinessModelID) === BMId) {
                            if (key.Area === condObject.Area && key.Visible === condVisible) {
                                this.CheckWorkFlowCondition(condObject, form, dmosJson, true);
                            }
                        }
                    });
                }
            });
        }
    }
    CheckWorkFlowCondition(condObject: any, form: FormGroup, dmosJson: any, condFrompageLoad: boolean) {
        const area = condObject.Area;
        let isRequired = condObject.IsRequired==undefined?null:condObject.IsRequired;
        let isEnable = condObject.IsEnabled==undefined?null:condObject.IsEnabled;
        let isVisible = condObject.IsVisible==undefined?null:condObject.IsVisible;
        const bmID = condObject.BusinessModelID;
        const condResult = this.GetParentControlCondResult(condObject.ParentConditions, form, dmosJson, isVisible, false);
        if (condResult === false) {
            if(isVisible!=undefined)
            isVisible = isVisible === null ? isVisible : !isVisible;
            if(isEnable!=undefined)
            isEnable = isEnable === null ? isEnable : !isEnable;
            if(isRequired!=undefined)
            isRequired = isRequired === null ? isRequired : !isRequired;
        }
         this.PerformActiononChildControls(condObject.ChildConditions, area,
             isEnable, isRequired, isVisible, form, condFrompageLoad, true);
    }
    /** End load workflow condition on form load */

    /** Start below function to use call from parent contro */
    //resolved Raygun Error
    fun_Wf_Cond(currentStage: string, currentState: string, bmID: Number, form: FormGroup, bmogJson: any) {
        if(this.wfJson.Stages[currentStage].Conditions && this.wfJson.Stages[currentStage].Conditions.length>0){
            Object.keys(this.wfJson.Stages[currentStage].Conditions).forEach(condId => {
                const condObject = this.wfJson.Stages[currentStage].Conditions[condId];
                if (parseInt(condObject.BusinessModelID) === bmID) {
                    this.CheckWorkFlowCondition(condObject, form, bmogJson, true);
                }
    
            });
        }
        if(this.wfJson.Stages[currentStage].States[currentState].Conditions && this.wfJson.Stages[currentStage].States[currentState].Conditions.length>0){
            Object.keys(this.wfJson.Stages[currentStage].States[currentState].Conditions).forEach(condId => {
                const condObject = this.wfJson.Stages[currentStage].States[currentState].Conditions[condId];
                if (parseInt(condObject.BusinessModelID) === bmID) {
                    this.CheckWorkFlowCondition(condObject, form, bmogJson, true);
                }
    
            });
        }          
    }
    /** End below function to use call from parent contro */
}
