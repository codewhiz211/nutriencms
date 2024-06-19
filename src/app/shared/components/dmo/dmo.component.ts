import { Component, OnInit, OnDestroy, Input, ElementRef } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import { NgbDateParserFormatter, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { IDatePickerConfig } from 'ng2-date-picker';
import { saveAs } from 'file-saver';
import { environment } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { Observable, fromEvent, of, Subject, merge, combineLatest, BehaviorSubject, NEVER } from 'rxjs';
import { startWith, switchMap, tap, debounceTime, filter, scan, exhaustMap, distinctUntilChanged, pairwise, map } from 'rxjs/operators';

import { SearchService } from '@app/core/services/search.service';
import { NgbDateFRParserFormatter, DmoControlService, BMConditionService, ListviewService, GridConfiguration, MessageService } from '@app/core';

// Advance Search
import { takeWhileInclusive } from 'rxjs-take-while-inclusive';
import { MessageComponent } from '../message/message.component';
import { isNullOrUndefined } from 'util';
import { LotSearchService } from '@app/modules/crm/lots/services/lot-search.service';
import { ImageCompressorService } from '@app/core/services/image-compressor.service';
import { LMService } from '@app/core/services/lm.service';
import { DmoImageControlService } from '@app/core/services/dmo-image-control.service';
import { ToastrService } from 'ngx-toastr';
import { existsValidator } from '@app/core/validators/sapNo.validator';
import { UserDetail } from '@app/core/models/user-detail';

export interface ILookup {
  dmocustmstrsapno: string;
  dmocustmstrcustname1: string;
}

@Component({
  selector: 'app-dmo',
  templateUrl: './dmo.component.html',
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
  styleUrls: ['./dmo.component.scss']
})
export class DmoComponent implements OnInit, OnDestroy {
  // PICList$: Observable<string[]>;
  products$: Observable<Array<{ code: string; value: string }>>;
  productBreeds$: Observable<Array<{ code: string; value: string }>>;
  productCategories$: Observable<Array<{ code: string; value: string }>>;
  textBoxSearch$: Observable<any>;
  textBoxSearchData: any;

  message: string;
  errorMessage: any = '';
  @Input() processName: string = sessionStorage.getItem('processName');
  @Input() dmo: any;
  @Input() dmoGUID: any;
  @Input() dmogGUID: any;
  @Input() bmoGUID: any;
  @Input() parentForm: FormGroup;
  @Input() submitted: boolean;
  @Input() triggered: boolean;
  @Input() bmogCondJson = [];
  @Input() currentStageGuid: string;
  @Input() currentStateGuid: string;
  @Input() BMId: number;
  @Input() transactionID = '';
  @Input() tempTransactionID = '';
  @Input() fileList: Array<object> = [];
  @Input() OptionList = [];
  @Input() isCopy = false;
  singleSelect = true;
  dateTimeFormat24 =environment.Setting.dateTimeFormat24;
  ddlOption = [];
  dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
  ageMask = [/^\d/, '-', /\d$/];
  autoCorrectedDatePipe: any = createAutoCorrectedDatePipe('dd/mm/yyyy');
  file: File = null;
  croppedImage: any = '';
  files = [];
  imageChangedEvent: any = '';
  dynamicOptions = [];
  colorOptions = [];
  minDate = undefined;
  maxDate = undefined;
  frameSizeA = 0;
  frameSizeB = 0;
  timeOptions = [
    '12:00 AM',
    '12:30 AM',
    '01:00 AM',
    '01:30 AM',
    '02:00 AM',
    '02:30 AM',
    '03:00 AM',
    '03:30 AM',
    '04:00 AM',
    '04:30 AM',
    '05:00 AM',
    '05:30 AM',
    '06:00 AM',
    '06:30 AM',
    '07:00 AM',
    '07:30 AM',
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 AM',
    '12:30 AM',
    '12:00 AM',
    '12:30 AM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
    '09:00 PM',
    '09:30 PM',
    '10:00 PM',
    '10:30 PM',
    '11:00 PM',
    '11:30 PM'
  ];
  get getFileList() {   
     if(this.dmoimage.ImagesRemoveFileList.length>0){
      this.dmoimage.ImagesRemoveFileList.forEach(element => {
        if(this.fileList.length>0){
          const index  = this.fileList.findIndex(x => x['FileName'] === element.FileName);
          if (index !== -1) {
            this.fileList.splice(index, 1);
          }
        }else{
          if(this.fileInfoList.length>0 && element.imgId !== undefined){
            const index  = this.fileInfoList.findIndex(x => x['FileName'] === element.FileName);
            if (index !== -1) {
              this.fileInfoList.splice(index, 1);
            }
          }        
        }      
      });
     } 
     return this.fileList.length>0 ? this.fileList : this.fileInfoList;
  }

  // Advance Search
  filteredLookups$: Observable<ILookup[]>;
  private lookups: ILookup[] = [];
  private nextPage$ = new Subject();
  private _onDestroy = new Subject();
  filtered: any = [];
  resultData: any = [];
  advddOptions: any = [];
  advddOptionsData = new BehaviorSubject<string[]>([]);
  advddOptionsData$: Observable<string[]>;
  advddData: any = [];
  offset = 0;
  limit = 0;
  ddDataLength = 0;
  APIUrl = '';
  fileInfoList: Array<object> = [];
  transform: ImageTransform = {scale: 1};
  dateTimePickerConfig: IDatePickerConfig = {
    format: 'DD/MM/YYYY HH:mm:ss',
    showTwentyFourHours: environment.Setting.dateTimeFormat24,
    showSeconds: true,
    disableKeypress: true
  };
  constructor(
    private lm: LMService,
    private compressor: ImageCompressorService,
    private msg: MessageService,
    private search: SearchService,
    private lotSearchService: LotSearchService,
    private dmoControlService: DmoControlService,
    private bmCondition: BMConditionService,
    private listviewService: ListviewService,
    private modalService: NgbModal, public elRef: ElementRef,
    private dmoimage: DmoImageControlService,
    public ngbDateParserFormatter: NgbDateParserFormatter,
    private toster: ToastrService,
    private userDetail: UserDetail) {   

    // set Max & Min calander Date
    
    // let now = new Date();
    //dynamic Calander setting
    // this.maxDate = {year: (now.getFullYear() + 100), month: 12, day: now.getDate()};
    // this.minDate = {year: (now.getFullYear() - 20), month: 1, day: now.getDate()};
     this.maxDate = {year: 2199, month: 12, day: 31};
     this.minDate = {year: 1990, month: 1, day: 1};
  }

  // Advanced Search API
  async BindAdvancedSearchData(startsWith: string, page: number, dmo: any): Promise<any> {
    if(dmo.DataSource != undefined){
      return this.getAdvancedSearchData(startsWith, page, dmo.DataSource, dmo.Model, dmo.Key, dmo.Value, dmo.ParentControl);
    }
  }

  async getAdvancedSearchData(startsWith: string, page: number, DataSource: string, Model: string, ddOptionKey: string, ddOptionValue:string, parentControl: string): Promise<any> {
    const callOption = DataSource.split('/');
    this.APIUrl = '';
    if (callOption[0].toUpperCase() === 'WFAPI') {
      this.APIUrl = environment.Setting.BaseAPIUrl;
    } else {
      this.APIUrl = environment.Setting.BaseAPIUrlLmk;
    }

    if (this.APIUrl !== '' && this.APIUrl != null) {
      const apiURL = this.APIUrl; // environment.Setting.BaseAPIUrlLmk;
      const ModelParam = JSON.parse(Model);
      const LoginUser = this.userDetail;
      const ProcessName = ModelParam.ProcessName;
      const ColumnList = ModelParam.ColumnList;
      const TimeZone = LoginUser.TimeZone;
      const take = ModelParam.PageSize;
      const SortColumn = ModelParam.SortColumn;
      const SortOrder = ModelParam.SortOrder;
      let urlPost = `${apiURL}/${callOption[1]}/${callOption[2]} `;
      const skip = page > 0 ? (page - 1) * take : 0;
      const PageSize = take;
      const PageNumber = page - 1;
      const IsDistinct = ModelParam.IsDistinct? ModelParam.IsDistinct:false;
      const RefererProcessName = ModelParam.RefererProcessName;
      let config: GridConfiguration = {
        ColumnList,
        PageNumber,
        PageSize,
        SortColumn,
        SortOrder: 'asc',
        TimeZone: new Date().getTimezoneOffset(),
        ProcessName,
        SeparatorCondition: 'or',
        IsColumnListOnly: true,
        IsDistinct,
        RefererProcessName,
        GridFilters: [
          {
            GridConditions: [
              {
                Condition: 'CONTAINS',
                ConditionValue: startsWith
              }
            ],
            DataField: ddOptionKey + '-' + ddOptionValue,
            LogicalOperator: 'Or',
            FilterType: 'Column_Filter'
          }
        ]
      };
      
      let isParentFilterCheck = true;
      if (this.dmo.Name === 'DMOSYAliases_SYAAliasRef'){
        config = this.hijackGridOption(config);
        const aliasType = this.parentForm.get('DMOSYAliases_SYASAliasTyp').value;
        if(aliasType === 'Product' || aliasType === 'Breed') {
          isParentFilterCheck = false;
          urlPost = `${environment.Setting.BaseAPIUrlLmk}/${'listview/getProductAndBreedByAliasType'}`;
        }
      }
      if (!!parentControl) {
        if (!!this.parentForm.get(parentControl).value) {
          //const cascCadIndex = ModelParam.GridFilters.findIndex(x=> x.Filter_Name === 'Cascading');
          // if (cascCadIndex > -1) {
          //   const parentFilter = ModelParam.GridFilters[cascCadIndex];
          //   parentFilter.GridConditions[0].Condition === ""?'EQUAL':parentFilter.GridConditions[0].Condition;
          //   parentFilter.GridConditions[0].ConditionValue = this.parentForm.get(parentControl).value.ddOptionKey ?
          //     this.parentForm.get(parentControl).value.ddOptionKey : this.parentForm.get(parentControl).value;
          //   config.GridFilters.push(parentFilter);
          // }
          const allcascCadFilter = ModelParam.GridFilters.length;//.filter(x=> x.Filter_Name === 'Cascading');
          if(allcascCadFilter && allcascCadFilter > 0){
            for (let i = 0; i < allcascCadFilter; i++) {
              const parentFilter = ModelParam.GridFilters[i];
              if (parentFilter.Filter_Name === 'Cascading') {
                parentFilter.GridConditions[0].Condition === "" ? 'EQUAL' : parentFilter.GridConditions[0].Condition;
                if(parentFilter.GridConditions[0].ConditionValue.includes('***')){
                  const parentDmoName = parentFilter.GridConditions[0].ConditionValue.split('***')[1];
                  parentFilter.GridConditions[0].ConditionValue = this.parentForm.get(parentDmoName).value.ddOptionKey ?
                  this.parentForm.get(parentDmoName).value.ddOptionKey : this.parentForm.get(parentDmoName).value;
                }
                else{
                parentFilter.GridConditions[0].ConditionValue = this.parentForm.get(parentControl).value.ddOptionKey ?
                  this.parentForm.get(parentControl).value.ddOptionKey : this.parentForm.get(parentControl).value;
                }
                  config.GridFilters.push(parentFilter);
              }
            }
          }
        }
      }
      
      const allFilter = ModelParam.GridFilters.filter(x=> x.Filter_Name !== 'Cascading');
      if (allFilter && allFilter.length > 0) {
        allFilter.forEach(element => {
          config.GridFilters.push(element);
        });
      }
       
      const self = this;
      //For Select first parent control values
      if (!!parentControl && isParentFilterCheck) {
        if (this.parentForm.get(parentControl).value === null || this.parentForm.get(parentControl).value === '') {
          this.toster.warning('Select parent control value.', '');
          this.filteredLookups$ = of([]);//Reset previous values
          return self.filtered;
        }
      }
      await this.dmoControlService.GetAdvanceSearchOption(urlPost, config).then
        ((Result) => {
          if (Result.hasOwnProperty('Data')) {
            if(this.dmo.Name === 'DMOSYAliases_SYAAliasRef'){
              self.filtered = this.hijackData(config,Result,ddOptionKey,ddOptionValue);
            } else {
            self.resultData = Result;
            if(self.resultData.Data.length > 0){
            if(ddOptionKey === ddOptionValue){
              self.filtered = self.resultData.Data.map(x=> ({
                // ddOptionKey: x[ddOptionKey].lastIndexOf('(') > -1 ? x[ddOptionKey].substr(x[ddOptionKey].lastIndexOf('(') + 1).replace(')', '') : x[ddOptionKey], 
                // ddOptionValue: x[ddOptionValue].lastIndexOf('(') > -1 ? x[ddOptionValue].split('(')[0].trim() : x[ddOptionValue]
                ddOptionKey:  x[ddOptionKey+'_KEY'], 
                ddOptionValue: x[ddOptionValue+'_VAL']
                }));
            } else {
              self.filtered = self.resultData.Data.map(x=> ({
                ddOptionKey: x[ddOptionKey].lastIndexOf('(') > -1 ? x[ddOptionKey].substr(x[ddOptionKey].lastIndexOf('(') + 1).replace(')', '') : x[ddOptionKey], 
                ddOptionValue: x[ddOptionValue]
                }));
            }
          }
          else{
            self.filtered = self.resultData.Data.map(x=> ({
              ddOptionKey: x[ddOptionKey].lastIndexOf('(') > -1 ? x[ddOptionKey].substr(x[ddOptionKey].lastIndexOf('(') + 1).replace(')', '') : x[ddOptionKey], 
              ddOptionValue: x[ddOptionValue]
              }));
              this.toster.warning('No Matching Record Found.','');
          }
           
            }
          }
        }, error => {
          this.msg.showMessage('Fail', {body: error});
          // this.showErrorMessage(error, 'Error', 'Ok', null, false, false, true, '');
        });
      return self.filtered;
    }
  }

  async BindAdvancSearchDropDown(dmo: any): Promise<any> {
    if (dmo.DataSource != undefined) {
      let V_LogicalOperator = "CONTAINS";
      this.advddOptionsData$ = this.advddOptionsData.asObservable().pipe(
        exhaustMap(_ => this.GetDropDownOptions(V_LogicalOperator, '', dmo.DataSource, dmo.Model, dmo.Key, dmo.Value)),
        scan((acc, curr) => {
          return [...acc, ...curr];
        }, [])
      );
    }
  }

  async GetDropDownOptions(V_LogicalOperator, SearchValue: string, DataSource: string, Model: string, ddOptionKey: string, ddOptionValue:string): Promise<any> {
    const callOption = DataSource.split('/');
    this.APIUrl = '';
    if (callOption[0].toUpperCase() === 'WFAPI') {
        this.APIUrl = environment.Setting.BaseAPIUrlLmk;
    } else {
      this.APIUrl = environment.Setting.BaseAPIUrl;
    }

    if (this.APIUrl != "" && this.APIUrl != null) {
      const apiURL = environment.Setting.BaseAPIUrlLmk;
      const ModelParam = JSON.parse(Model);
      const LoginUser = this.userDetail;
      const ProcessName = ModelParam.ProcessName;
      const ColumnList = ModelParam.ColumnList;
      const TimeZone = LoginUser.TimeZone;
      const SortColumn = ModelParam.SortColumn;
      const SortOrder = ModelParam.SortOrder;
      const urlPost = `${apiURL}/${callOption[1]}/${callOption[2]} `;

      const PageSize = this.limit;
      const PageNumber =  this.offset / this.limit;

      const config: GridConfiguration = {
        ColumnList: ColumnList,
        PageNumber: PageNumber,
        PageSize: PageSize,
        SortColumn: SortColumn,
        SortOrder: 'asc',
        TimeZone: new Date().getTimezoneOffset(),
        ProcessName: ProcessName,
        GridFilters: [{
          DataField: ddOptionKey,
          FilterType: 'Column_Filter',
          LogicalOperator: 'Or',
          GridConditions: [{ Condition: V_LogicalOperator, ConditionValue: SearchValue }]
        }]
      };

      var self = this;
      if (self.advddOptions.length < 20)
        await this.dmoControlService.GetAdvanceSearchOption(urlPost, config).then
          ((Result) => {
            if (Result.hasOwnProperty('Data')) {
              self.advddData = Result;
              self.advddOptions = self.advddData.Data.map(x => ({ ddOptionKey: x[ddOptionKey], ddOptionValue: x[ddOptionValue] }));
              this.ddDataLength = self.advddData.RecordsCount;
              this.advddOptionsData.next(self.advddOptions);
              this.offset += this.limit;
            }
          }, error => {
            this.msg.showMessage('Fail', {body: error});
            // this.showErrorMessage(error, 'Error', 'Ok', null, false, false, true, '');
          });
      return self.advddOptions;
    }
  }

  hijackGridOption(config: GridConfiguration): GridConfiguration {
    const aliasType = this.parentForm.get('DMOSYAliases_SYASAliasTyp').value;
    if (aliasType === 'Partner' || aliasType === 'Customer') {
      config.ColumnList = 'dmocustmstrsapno,dmocustmstrcustname1';
      config.ProcessName = 'LMKMSTRCustomer';
      config.SortColumn = 'dmocustmstrcustname1';
      config.GridFilters[0].DataField = 'dmocustmstrsapno-dmocustmstrcustname1';
    } else if (aliasType === 'Product') {
      config.ColumnList = 'dmoproductprodcode,dmoproductproddscr';
      config.ProcessName = 'LMKMSTRProduct';
      config.SortColumn = 'dmoproductproddscr';
      config.GridFilters[0].DataField = 'dmoproductprodcode-dmoproductproddscr';
    } else if (aliasType === 'Breed') {
      config.ColumnList = 'dmoprodbrdprodbrdcode,dmoprodbrdprodbrddscr';
      config.ProcessName = 'LMKMSTRProductBreed';
      config.SortColumn = 'dmoprodbrdprodbrddscr';
      config.GridFilters[0].DataField = 'dmoprodbrdprodbrdcode-dmoprodbrdprodbrddscr';
    }
    return config;
}
hijackData(config: GridConfiguration, Data: any,ddOptionKey: string,ddOptionValue: string){
  if (config.ProcessName === 'LMKMSTRCustomer') {
   Data = Data.Data.map(x=>({ddOptionKey: x.dmocustmstrsapno,ddOptionValue: x.dmocustmstrcustname1}));
  } else if (config.ProcessName === 'LMKMSTRProduct') {
    Data = Data.Data.map(x=>({ddOptionKey: x.dmoproductprodcode,ddOptionValue: x.dmoproductproddscr}));
  } else if (config.ProcessName === 'LMKMSTRProductBreed') {
    Data = Data.Data.map(x=>({ddOptionKey: x.dmoprodbrdprodbrdcode,ddOptionValue: x.dmoprodbrdprodbrddscr}));
  }
  return Data;
}


  ngOnInit() {  

    if(this.dmo.Name === 'DMOSYAliases_SYAAliasRef') {
      setTimeout(() => {
        this.parentForm.get('DMOSYAliases_SYASAliasTyp').valueChanges.subscribe(val=>{
          this.parentForm.get('DMOSYAliases_SYAAliasRef').setValue('');
        });
      }, 400);
    
    }
     if (this.dmo.Type === 'TextBox') {
      if (this.dmo.Name === 'LMKESaleDMO_SAPAcctNumber') {

        this.textBoxSearch$ = this.lm.reactToSAPNoChanges(this.parentForm).pipe(
          tap(data => this.textBoxSearchData = data)
        );
        console.log('data', this.textBoxSearchData)
      }
      if (this.dmo.Name === 'LMKESaleDMO_TradingName')
        this.textBoxSearch$ = this.lm.reactToTradingNameChanges(this.parentForm).pipe(
          tap(data => this.textBoxSearchData = data)
        );
      if (this.dmo.Name === 'LMKOPESDMO_PostCode')
        this.textBoxSearch$ = this.lm.reactToPostCodeChange(this.parentForm);
        /*  this.reactToPostCodeChange() */
      if (this.dmo.Name === 'LMKOPESDMO_Town')
        this.textBoxSearch$ = this.lm.reactToTownChange(this.parentForm);
        // this.reactToTownChange()
    }
    // if (this.dmo.Type === 'CheckBoxList') {
    //   if (this.dmo.Name === 'LMKOPES_MarketCertns')
    //     this.adjustAccreditationsOnCategoryChange()
    // }
    if (this.dmo.Type === 'UploadImage') {
      if (this.fileList.length === 0) {
        this.parentForm.get(this.dmo.Name).setValue('');
      } else {
        if(this.isCopy) {
          this.dmoimage.ImagesFileList = [];
        this.fileList.forEach(element=>{
          this.dmoimage.index = this.dmoimage.index + 1;
          element['uId'] = this.dmoimage.index;
          this.DownloadAndStoreFile(element);
        })
      }
      this.fileList.forEach(x=>{
        this.dmoimage.SavedImagesFileList.push({...x,dmoName:this.dmo.Name,Guid:this.dmoGUID});
      });
      }
    }
    if (this.dmo.Type === 'UploadDocument') {        
        if(this.fileList.length>0){
          this.fileList.forEach(x=>{
                this.dmoimage.SavedImagesFileList.push({...x,dmoName:this.dmo.Name,Guid:this.dmoGUID});
              });
        }
    }
    if (this.dmo.Type === 'KeyValueSearchBox') {
      if (!!this.dmo.ParentControl) {
        // Code Commnet for reset Child detailview page to blank child control values and changes to reset key value search box. - Biresh - Entity - 15 feb 2021
        // if(this.parentForm.get(this.dmo.ParentControl).value !== undefined &&  this.parentForm.get(this.dmo.ParentControl).value !== null){
        //   this.filteredLookups$ = of([]);
        // }
        // else{
        //   this.parentForm.get(this.dmo.ParentControl).valueChanges
        //   .subscribe(parentValue => {
        //     this.parentForm.get(this.dmo.Name).reset();
        //     this.filteredLookups$ = of([]);
        //   });
        // }
        // End
        this.parentForm.get(this.dmo.ParentControl).valueChanges
        .subscribe(parentValue => {
          this.parentForm.get(this.dmo.Name).reset();
          this.filteredLookups$ = of([]);
        });
      }
    }

    if (this.dmo.Type === 'KeyValueDropdownList') {
      let parentDMOKey = null;
      parentDMOKey = this.dmo.Name;
      let V_LogicalOperator = 'CONTAINS';
      let formControlValue = this.parentForm.get(parentDMOKey).value;
      if (formControlValue != null && formControlValue != undefined
        && formControlValue !== '' && formControlValue.toString().search("~~~") != -1) {
        let splitted = formControlValue.split("~~~");
        const Data = [{ ddOptionKey: splitted[0], ddOptionValue: splitted[1] }];
        const config = { Data };
        var self = this;
        self.advddData = config;
        this.advddOptionsData$ = this.advddOptionsData.asObservable().pipe(
          exhaustMap(_ => self.advddData.Data.map(x => ({ ddOptionKey: x.ddOptionKey, ddOptionValue: x.ddOptionValue }))),
          scan((acc, curr) => {
            return [curr];
          }, [])
        );
        this.parentForm.get(parentDMOKey).setValue(Data[0].ddOptionKey);
        V_LogicalOperator = 'CONTAINS';
      }
      const ModelParam = JSON.parse(this.dmo.Model);
      this.limit = ModelParam.PageSize;
    }

    if (this.dmo.IsMultiSelect !== undefined) {
      this.singleSelect = !this.dmo.IsMultiSelect;
    }
    else if (this.dmo.Type === 'MultiSelectDropDownList') {
      this.singleSelect = false;
    }

    if (this.dmo.Type === 'RoleType') {
      const LoginUser = this.userDetail;
      const processName = sessionStorage.AppName;
      const transactionId = '0';
      const identifierName = this.dmoGUID;
      const parentvalue = this.dmo.Options;
      const timeZone = LoginUser.TimeZone.toString();
      const userId = '0';
      const language = LoginUser.Language;
      const selecedValue = '0';

      this.dmoControlService.GetDDLOption(
        'WF_API_ROLECONTROLUSER',
        processName,
        transactionId,
        identifierName,
        parentvalue,
        timeZone,
        userId,
        language,
        selecedValue)
        .subscribe(data => {
          this.OptionList = JSON.parse(JSON.stringify(data));
        });
    }
    if (this.dmo.Type === 'ColorCodeStatus') {
      this.colorOptions = this.getDmoOption(this.dmo);
    }

    // if (this.dmo.Type === 'DropDownList' && this.dmo.DisplayName === 'PIC') {
    //   this.PICList$ = this.search.PICList;
    // }

    if (this.dmo.Type === 'DropDownList' && this.dmo.DisplayName === 'Product Category') {
      this.productCategories$ = this.search.productCategories;
    }

    if (this.dmo.Type === 'DropDownList' && this.dmo.DisplayName === 'Product') {
      this.products$ = this.search.products;
    }

    if (this.dmo.Type === 'DropDownList' && this.dmo.DisplayName === 'Breed') {
      this.productBreeds$ = this.search.productBreeds;
    }


    if (this.dmo.Type === 'DropDownList' && (typeof this.dmo.Options).toString() !== 'undefined') {
      
      let IsChild = false;
      let parentDMOKey = null;
      if (this.dmo.ParentDMO) {
        IsChild = (Object.keys(this.dmo.ParentDMO).length > 0) ? true : false;
        if (IsChild) {
          parentDMOKey = this.dmo.ParentDMO[Object.keys(this.dmo.ParentDMO)[0]].Name;
          this.parentForm.get(parentDMOKey).valueChanges
            .subscribe(parentValue => {
              this.parentForm.get(this.dmo.Name).reset();
              this.resetChildDMOOption(parentValue);
            });
        }
      }
      if (this.dmo.DataSource === 'values') {
        this.dmo.Options.split(',').forEach((item, index) => {
          this.ddlOption.push({ ValueField: item, TextField: item });
        });
      } else if (this.dmo.DataSource === 'json') {

        if (IsChild) {
          const parentObj = this.parentForm.get(parentDMOKey);
          const parentValue = parentObj.value;
          const jsonOption = JSON.parse(this.dmo.Options);
          jsonOption.forEach(optionItem => {
            if (optionItem.ParentKey === parentValue) {
              this.ddlOption.push(JSON.parse(JSON.stringify(optionItem)));
            }
          });
        } else {
          this.ddlOption = JSON.parse(this.dmo.Options);
        }
      } else if (this.dmo.DataSource === 'c2miceapi') {

        const callOption = this.dmo.Options.split('~~~');
        let apiURL = callOption[0].toString();
        const responseKey = callOption[callOption.length - 1];

        if (IsChild) {
          const parentObj = this.parentForm.get(parentDMOKey);
          const parentValue = parentObj.value;
          apiURL = apiURL.replace('***ConditionValue***', parentValue);
        }
        this.listviewService.GetDataFromIceAPI(apiURL, 'text').subscribe(result => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(result, 'text/xml');
          const rowList = xmlDoc.getElementsByTagName('Table1');
          let nodeIndex = -1;
          if (rowList !== undefined && rowList[0] != null) {
            for (const Index in rowList[0].childNodes) {
              if (rowList[0].childNodes[Index].nodeName === responseKey) {
                nodeIndex = parseInt(Index, 0);
              }
            }
            if (nodeIndex > -1 && rowList.length > 0) {
              let rowInex = 0;
              while (rowInex < rowList.length) {
                const optionValue = rowList[rowInex].childNodes[nodeIndex].childNodes[0].nodeValue;
                this.ddlOption.push({ ValueField: optionValue, TextField: optionValue });
                rowInex++;
              }
            }
          }
        });
      } else if (this.dmo.DataSource === 'wfapigetdata') {
        const callOption = this.dmo.Options.split('~~~');
        const callParam = JSON.parse(callOption[1]);
        const responseKey = callOption[0].toString().replace(/\s/g, '');
        if (IsChild) {
          const parentObj = this.parentForm.get(parentDMOKey);
          const parentValue = parentObj.value;

          callParam.GridFilters.forEach(objFilter => {
            if (objFilter.FilterType === 'Cascading_Filter') {
              objFilter.FilterType = 'Column_Filter';
              objFilter.GridConditions.ConditionValue = parentValue;
            }

          });
        }
        const responseParamss = responseKey.split('-');
        let paramValue = '';
        let paramText = '';
        this.listviewService.GridData(callParam,false).subscribe(result => {
          result.Data.forEach(rowItem => {
            if (responseParamss.length === 1) {
              paramValue = rowItem[responseParamss[0]];
              this.ddlOption.push({ ValueField: paramValue, TextField: paramValue });
            } else if (responseParamss.length === 2) {
              //paramValue = `${rowItem[responseParamss[0]]}~${rowItem[responseParamss[1]]}`;              
              paramValue = `${rowItem[responseParamss[0]]}`;
              const resultText = responseParamss[1].replace('(', '-').replace(')', '-').split('-');
              if (resultText.length === 1) {
                paramText = `${rowItem[responseParamss[1]]}`;
              }
              else if (resultText.length > 1) {
                if (rowItem[resultText[1]] !== undefined)
                  paramText = `${rowItem[resultText[0]]} (${rowItem[resultText[1]]})`;
                else
                  paramText = `${rowItem[resultText[0]]}`;
              }
              this.ddlOption.push({ ValueField: paramValue, TextField: paramText });
            }
          });
          this.dmo['RecordsCount'] = result.RecordsCount;
          if (callParam.PageSize > 0) {
            this.dmo['BeforeFetching'] = Math.ceil(callParam.PageSize / 4);
          }
        }
        );
      }
    }

    if (this.dmo.Type === 'DateWithCalendar' || this.dmo.Type === 'StaticDateBox') {
      if (this.dmo.comparisonDataDmo) {
        if (this.dmo.comparisonDataDmo.Dmo !== null && this.dmo.comparisonDataDmo.Operator !== null) {
          const relationDmoKey = this.dmo.comparisonDataDmo.Dmo;
          const operator = this.dmo.comparisonDataDmo.Operator;
          if (this.parentForm.get(relationDmoKey) != null) {
            if (this.parentForm.get(relationDmoKey).value !== null) { // #399 - ITKT - More Info date controls not chcking range
                switch (operator) {
                  case 'LT':
                    this.maxDate = {
                      year: this.parentForm.get(relationDmoKey).value.year,
                      month: this.parentForm.get(relationDmoKey).value.month,
                      day: this.parentForm.get(relationDmoKey).value.day - 1
                    };
                    this.dateComparisonValidation(relationDmoKey, operator);
                    break;
                  case 'LE':
                    this.maxDate = {
                      year: this.parentForm.get(relationDmoKey).value.year,
                      month: this.parentForm.get(relationDmoKey).value.month,
                      day: this.parentForm.get(relationDmoKey).value.day
                    };
                    this.dateComparisonValidation(relationDmoKey, operator);
                    break;
                  case 'GT':
                    this.minDate = {
                      year: this.parentForm.get(relationDmoKey).value.year,
                      month: this.parentForm.get(relationDmoKey).value.month,
                      day: this.parentForm.get(relationDmoKey).value.day + 1
                    };
                    this.dateComparisonValidation(relationDmoKey, operator);
                    break;
                  case 'GE':
                    this.minDate = {
                      year: this.parentForm.get(relationDmoKey).value.year,
                      month: this.parentForm.get(relationDmoKey).value.month,
                      day: this.parentForm.get(relationDmoKey).value.day
                    };
                    this.dateComparisonValidation(relationDmoKey, operator);
                    break;
                }
            } else {
              this.dateComparisonValidation(relationDmoKey, operator);
            }
          }
        }
      }
    }
  }
  dateComparisonValidation(relationDmoKey,operator){
    this.parentForm.get(relationDmoKey).valueChanges
    .subscribe(value => {
      this.parentForm.get(this.dmo.Name).reset();
      if (value) {
        switch (operator) {
          case 'LT':
            this.maxDate = {
              year: value.year,
              month: value.month,
              day: value.day - 1
            };
            break;
          case 'LE':
            this.maxDate = {
              year: value.year,
              month: value.month,
              day: value.day
            };
            break;
          case 'GT':
            this.minDate = {
              year: value.year,
              month: value.month,
              day: value.day + 1
            };
            break;
          case 'GE':
            this.minDate = {
              year: value.year,
              month: value.month,
              day: value.day
            };
            break;
        }
      }
    });
  }

  

  public populateVendorDetails(item: any) {
    this.lm.populateVendorDetails(item, this.parentForm);
  }

  public populatePostalDetails(item: any) {
    this.lm.populatePostalDetails(item, this.parentForm);
  }
  

  displayWith(lookup) {
    return lookup ? lookup.ddOptionValue + ' ('+ lookup.ddOptionKey+')' : null;
  }

  onScroll() {
    //Note: This is called multiple times after the scroll has reached the 80% threshold position.
    this.nextPage$.next();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  resetChildDMOOption(parentValue: string): void {
    this.ddlOption = [];
    if (this.dmo.DataSource === 'json') {
      const jsonOption = JSON.parse(this.dmo.Options);
      jsonOption.forEach(optionItem => {
        if (optionItem.ParentKey === parentValue) {
          this.ddlOption.push(JSON.parse(JSON.stringify(optionItem)));
        }
      });
    } else if (this.dmo.DataSource === 'c2miceapi') {

      const callOption = this.dmo.Options.split('~~~');
      let apiURL = callOption[0].toString();
      const responseKey = callOption[callOption.length - 1];
      apiURL = apiURL.replace('***ConditionValue***', parentValue);


      this.listviewService.GetDataFromIceAPI(apiURL, 'text').subscribe(result => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result, 'text/xml');
        const rowList = xmlDoc.getElementsByTagName('Table1');
        let nodeIndex = -1;
        if (rowList.length > 0) {
          for (const Index in rowList[0].childNodes) {
            if (rowList[0].childNodes[Index].nodeName === responseKey) {
              nodeIndex = parseInt(Index, 0);
            }
          }
        }
        if (nodeIndex > -1 && rowList.length > 0) {
          let rowInex = 0;
          while (rowInex < rowList.length) {
            const optionValue = rowList[rowInex].childNodes[nodeIndex].childNodes[0].nodeValue;
            this.ddlOption.push({ ValueField: optionValue, TextField: optionValue });
            rowInex++;
          }
        }
      });
    } else if (this.dmo.DataSource === 'wfapigetdata') {
      const callOption = this.dmo.Options.split('~~~');
      const callParam = JSON.parse(callOption[1]);
      const responseKey = callOption[0].toString().replace(/\s/g, '');
      const responseParamss = responseKey.split('-');

      callParam.GridFilters.forEach(objFilter => {
        if (objFilter.FilterType === 'Cascading_Filter') {
          objFilter.FilterType = 'Column_Filter';
          objFilter.GridConditions[0].ConditionValue = parentValue;
        }
      });

      if (callParam.GridFilters.length < 1) {
        callParam.GridFilters.push({
          GridConditions: [
            {
              Condition: 'EQUAL',
              ConditionValue: parentValue
            }
          ],
          DataField: responseParamss[0],
          LogicalOperator: 'Or',
          FilterType: 'Column_Filter'
        });
      }

      let paramValue = '';
      let paramText = '';
      this.listviewService.GridData(callParam,false).subscribe(result => {
        result.Data.forEach(rowItem => {
          if (responseParamss.length === 1) {
            paramValue = rowItem[responseParamss[0]];
            this.ddlOption.push({ ValueField: paramValue, TextField: paramValue });
          } else if (responseParamss.length === 2) {
            //paramValue = `${rowItem[responseParamss[0]]}~${rowItem[responseParamss[1]]}`;
            paramValue = `${rowItem[responseParamss[0]]}`;
            const resultText = responseParamss[1].replace('(', '-').replace(')', '-').split('-');
            if (resultText.length === 1) {
              paramText = `${rowItem[responseParamss[1]]}`;
            }
            else if (resultText.length > 1) {
              if (rowItem[resultText[1]] !== undefined)
                paramText = `${rowItem[resultText[0]]} (${rowItem[resultText[1]]})`;
              else
                paramText = `${rowItem[resultText[0]]}`;
            }
            this.ddlOption.push({ ValueField: paramValue, TextField: paramText });
          }
        });
      });
    }
  }

  getColor(Color: string): string {
    return Color.toLowerCase();
  }

  getSelectOptions(controlType: string) {
    if (controlType === 'USAStateList') {
      this.dmoControlService.GetState().subscribe(
        data => {
          this.dynamicOptions = data;
        });
    } else if (controlType === 'CountryList') {
      this.dmoControlService.GetCountry().subscribe(
        data => {
          this.dynamicOptions = data;
        });
    }
  }
  getDmoOption(DMO: any) {
    const lstOption = [];
    if ((typeof DMO.Options).toString() !== 'undefined') {
      if (DMO.Type === 'DropDownList') {

        if (DMO.DataSource === 'values') {
          return DMO.Options.split(',');
        }
      } else {
        return DMO.Options.split(',');
      }
    }
    return lstOption;
  }

  mask(rawValue) {
    if (rawValue && rawValue.replace(/\D+/g, '').length > 11) {
      return ['+', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
    }
    else if (rawValue && rawValue.replace(/\D+/g, '').length > 10) {
      return ['+', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
    }
    else {
      return ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.parentForm.controls; }

  show_mandatory_field() {
    if (this.bmogCondJson && (Object.keys(this.bmogCondJson).length > 0)) {
      return this.bmogCondJson[this.bmoGUID] && this.bmogCondJson[this.bmoGUID][this.dmogGUID][this.dmoGUID].IsRequired === true;
    } else {
      return this.dmo.IsRequired;
    }

  }


  upload(UploadEvent: any, dmoGUID: string,dmoName:any, modal: any = undefined, cropedFile = undefined) {    
    let fileName = '';
    if(sessionStorage.AppName === 'LMKOpportunities'){
        let exttyp = (UploadEvent.target.files[0].name.split('.').pop()).toLowerCase();
        let MatchExt = ['.jpg' , '.bmp' , '.jpeg' , '.gif' , '.txt' , '.pdf' , '.doc' , '.docx', '.xls' , '.xlsx'].includes('.'+exttyp);
          if(MatchExt===false){
            this.msg.showMessage('Fail', {body: 'Not a valid file'});
            return;
          }
    }  
    
    this.dmoimage.index = this.dmoimage.index + 1;
    if (cropedFile) {
      fileName = cropedFile.ImgFileName;
      this.dmoimage.ImagesFileList.push({ 
        file: cropedFile.file, 
        ImgFileName: cropedFile.ImgFileName,
        Guid: dmoGUID,
        imgId: this.dmoimage.index,
        dmoName:dmoName
      });
    }
    else {
      fileName = UploadEvent.target.files[0].name;
      if (UploadEvent.currentTarget['files'].length === 0) {
        return;
      }
      if (UploadEvent.currentTarget['files']['files'] != undefined) {
        this.dmoimage.ImagesFileList.push({ 
          file: {file: UploadEvent.currentTarget['files']['files'][0]}, 
          ImgFileName: '',
          Guid: dmoGUID,
          imgId: this.dmoimage.index,
          dmoName:dmoName
        });
      }
      else {
        this.dmoimage.ImagesFileList.push({ 
          file: {file: UploadEvent.currentTarget['files'][0]}, 
          ImgFileName: '',
          Guid: dmoGUID,
          imgId: this.dmoimage.index,          
          dmoName:dmoName
        });
      }
    }

    if (this.processName === 'LMKOpportunities') {
      this.msg.showMessage('Warning', {
        header: 'File Upload',
        body: `Please save your changes to complete the file upload and make the file(s) visible.`
      });
    }

    const img = {
      "FileName": fileName,
      "FileSize":  '0 Kb',
      "OldFileName":  fileName,
      "CreatedOn": null,
      "CreatedBy": null,
      "DISPNAME": null,
      "UserFullName": null,
      "IsEncrypted": false,
      "Id": null,
      "uId": this.dmoimage.index,
      "dmoName": dmoName,
    }
    this.fileInfoList.push(img);
    this.fileList.push(img);
    if (modal) {
      modal.dismiss('Cross click');
    }
    if(this.fileInfoList.length > 0 || this.fileList.length > 0) {
      this.f[this.dmo.Name].setValue('fackpath.jpg');
      this.f[this.dmo.Name].markAsDirty();
    }

  }

  DeleteFile(objfile: any) {
    
    if (objfile.uId) {
      let ind = this.fileInfoList.findIndex(x => x['uId'] === objfile.uId);
      if (ind > -1) {
        this.fileInfoList.splice(ind, 1);
      }
      ind = -1;
      ind = this.fileList.indexOf(objfile);
      if (ind > -1) {
        this.fileList.splice(ind, 1);
      }
      ind = -1;
      ind = this.dmoimage.ImagesFileList.findIndex(x => x['imgId'] === objfile.uId);
      if (ind > -1) {
        this.dmoimage.ImagesFileList.splice(ind, 1);
      }
      if(this.fileInfoList.length === 0 && this.fileList.length === 0) {
        this.f[this.dmo.Name].setValue('');
        this.f[this.dmo.Name].markAsDirty();
      }
      return;
    }
    this.dmoimage.ImagesRemoveFileList.push({...objfile, Guid: this.dmoGUID,IsPermanentFileDeletion: environment.Setting.IsPermanentFileDeletion.toString()});
    const index = this.fileList.indexOf(objfile);
    const index1 = this.fileInfoList.indexOf(objfile);
    if (index > -1) {
      this.fileList.splice(index, 1);
      //Code added for - Image remove after copy record & not perform any action & Open More Info Page delete image & Upload same image 2 times then show multiple image
      this.dmoimage.ImagesFileList.splice(index, 1);
      // End
    }
    if (index1 > -1) {
      this.fileInfoList.splice(index, 1);
    }
    if(this.fileInfoList.length === 0 && this.fileList.length === 0) {
      this.f[this.dmo.Name].setValue('');
      this.f[this.dmo.Name].markAsDirty();
    }

    
  }
  DownloadFile(objfile: any) {
    if (objfile.uId) {
      const item = this.dmoimage.ImagesFileList.find(x => x['imgId'] === objfile.uId);
      if (item) {
        saveAs(item.file.file, item.ImgFileName);
      }
      return;
    }
    const formData = new FormData();
    if (this.transactionID !== '') {
      formData.append('transactionId', this.transactionID);
    }
    formData.append('tempTransactionID', this.tempTransactionID);
    formData.append('dmoGUID', this.dmoGUID);
    formData.append('isEncrypted', 'false');
    formData.append('FileName', objfile.FileName);
    this.dmoControlService.downloadfile('application/downloadfile', formData).subscribe(
      (resultBlob: Blob) => {
        saveAs(resultBlob, objfile.OldFileName);
      }
    );


  }
  fun_click(objDmo: any) {
    if (this.bmogCondJson && (Object.keys(this.bmogCondJson).length > 0)) {
      this.bmCondition.fun_Wf_Cond(this.currentStageGuid, this.currentStateGuid, this.BMId, this.parentForm, this.bmogCondJson);
      this.bmCondition.BMCond_Click(objDmo, this.bmogCondJson, this.parentForm);
    }
  }

  fileChangeEvent(event: any, id): void {
    if (this.dmo.NumberOfFiles && this.dmo.NumberOfFiles <= (this.fileInfoList.length + this.fileList.length)) {
      this.toster.error('Please remove existing file and upload new.', 'Fail');
      return;
    }
    const file = event.target.files.item(0);
    if (this.dmo.IsAutoCrop) {      
      this.files.push({
        file: { ...this.croppedImage, file: file },
        ImgFileName: file.name,
      });
      const CurDmoGuid = this.dmo.Guid === undefined ? this.dmoGUID : this.dmo.Guid;
      this.upload(event, CurDmoGuid, this.dmo.Name);
    }
    else {
      // Entity Changes allow JPG/JPEG Image model popup
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
        // this.errorMsg = '';
        // this.fileName[ControlName] = file.name;
        this.imageChangedEvent = event;
        // this.index = index;
        // this.ControlName = ControlName;
        this.modalService.open(id, { ariaLabelledBy: 'modal-basic-title' });
      } else {
        //  this.showErrorMessage('Not a valid file', 'Error', 'Ok', null);
      }
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
  }

  Cropped(dmoGUID, modal) {    
    this.compressor
      .compress(this.croppedImage, this.imageChangedEvent.target.files.item(0).name)
      .pipe(tap(fileObject => {
        this.files.push({ 
          file: {...this.croppedImage, file: fileObject}, 
          ImgFileName: fileObject.name,
        });
        this.upload(undefined, dmoGUID,undefined, modal, { file: {...this.croppedImage, file: fileObject}, ImgFileName: fileObject.name });
      }))
      .toPromise();
  }

  // onZoomChange(event: Event) {
  //   const scale = 1 + (event.target['valueAsNumber'] - 50) / 50;
  //   this.transform = {...this.transform, scale};
  // }
  
  onZoomIn() {
    const scale = this.transform.scale + 0.1;
    this.transform = {...this.transform, scale};
  }

  onZoomOut() {
    const scale = this.transform.scale - 0.1;
    this.transform = {...this.transform, scale};
  }

  checkKeyValueSearchBoxItem(dmoName:any) {
  //get Calculation Type by Fee & Config Code.
  if(dmoName === 'DMOFEECONF_FeeCode'){
    if(this.parentForm.get(dmoName).value !== null && 
     this.parentForm.get(dmoName).value.ddOptionKey !== undefined && this.parentForm.get(dmoName).value !== ""){      
      const config = {
        ColumnList:"dmofncfeecalctype",
        PageNumber:0,
        PageSize:20,
        ProcessName:"LMKMSTRFeesNCharges",
        SortColumn:"dmofncfeecalctype",
        IsColumnListOnly: true,
        SortOrder:"desc",
        TimeZone:-330,
        ViewName:"View 1",
        SeparatorCondition:"or",
        GridFilters:[{GridConditions:[
        {Condition:"EQUAL",ConditionValue:this.parentForm.get(dmoName).value.ddOptionKey}],
        DataField:"dmofncfeecode",
        LogicalOperator:"Or",
        FilterType:"Column_Filter"}
        ]  
      };
      return this.listviewService.GridData(config,false).subscribe(response=>{
        this.parentForm.get('DMOFEECONF_CalcType').setValue(response.Data[0].dmofncfeecalctype);
      });
     }
  }
    if(this.parentForm.get(dmoName).value !== null && 
       this.parentForm.get(dmoName).value.ddOptionKey === undefined && this.parentForm.get(dmoName).value !== ""){
      this.parentForm.get(dmoName).setValue('')
    }
  }

  AutoSearchTextBoxBind(event: any) {
    let parentDMOKey = null;
    parentDMOKey = this.dmo.Name;
    const filter$ = this.parentForm.get(parentDMOKey).valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      filter(q => typeof q === "string"));

    this.filteredLookups$ = filter$.pipe(
      switchMap(filter => {
        let currentPage = 1;
        let dmo = this.dmo;
        return this.nextPage$.pipe(
          startWith(currentPage),
          exhaustMap(_ => this.BindAdvancedSearchData(filter, currentPage, dmo)),
          tap(() => currentPage++),
          takeWhileInclusive(p => p.length > 0),
          scan((allProducts, newProducts) => allProducts.concat(newProducts), []),
        );
      }));
  }


  ValidateDmo(event: any, dmo: any) {    
    if (dmo.RegularExpression != null && (dmo.RegularExpression.Type === 'Dollar' ||  dmo.RegularExpression.Type === 'Percent')) {
      const charCode = (event.which) ? event.which : event.keyCode;
      if ((charCode > 47 && charCode < 57) || charCode === 46) {
        if (dmo.RegularExpression.Type === 'Dollar') {
          if (event.target.value.indexOf('$') === -1) {
            this.parentForm.get(dmo.Name).setValue('$');
            this.parentForm.updateValueAndValidity();
          }
        }
        if (dmo.RegularExpression.Type === 'Percent') {
          if (event.target.value.indexOf('%') === -1) {
            let setval = event.key + '%';
            this.parentForm.get(dmo.Name).patchValue(setval);
          } else {
            let setval = event.target.value.replace('%', '') + event.key + '%';
            this.parentForm.get(dmo.Name).patchValue(setval);
          }
          event.preventDefault();
        }
      } else {
        return false;
      }
    } else if (dmo.RegularExpression != null && (dmo.RegularExpression.Expression != null && dmo.RegularExpression.Expression !== '')) {
      const regex = dmo.RegularExpression.Expression;
      const str = event.target.value + event.key;
      if (str.match(regex)) {
        this.errorMessage = '';
      } else {
        this.errorMessage = dmo.RegularExpression.Message;
        return false;
      }
    }
    // For Customer PIC Details Configuration - Biresh - #214 - Master Data
    if (this.dmo.Name === 'DMOCUSPIC_CustPIC'){
      this.parentForm.get(dmo.Name).patchValue((event.target.value.toString() + event.key.toString()).toUpperCase());
      event.preventDefault();
    }
    // For searching Trading name & Sap no in LM
    // if (dmo.Name === 'LMKESaleDMO_TradingName')
    //   this.textBoxSearch$ = this.lm.reactToTradingNameChanges(this.parentForm);
    // if (dmo.Name === 'LMKESaleDMO_SAPAcctNumber')
    //   this.textBoxSearch$ = this.lm.reactToSAPNoChanges(this.parentForm);
      
  }

  ValidateDmoPaste(event: any, dmo: any) {
    if (dmo.RegularExpression != null && (dmo.RegularExpression.Expression != null && dmo.RegularExpression.Expression !== '')) {
      const regex = dmo.RegularExpression.Expression;
      const str = event;
      if (str.match(regex)) {
        this.errorMessage = '';
      } else {
        this.errorMessage = dmo.RegularExpression.Message;
        return false;
      }
    }
    if (this.dmo.Name === 'DMOCUSPIC_CustPIC'){
      this.parentForm.get(dmo.Name).patchValue((event).toUpperCase());
      event.preventDefault();
    }
      
  }

  validateSearchBoxOnKeyUpAndKeyPress(dmo: any, val: any) {
    const specialKeys = ['Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
    if (specialKeys.indexOf(val.key) !== -1) {
      return;
    }
    if (val !== undefined) {
      let found: any;
      if (dmo.Name === 'LMKESaleDMO_SAPAcctNumber' || dmo.Name === 'LMKESaleDMO_TradingName') {
        if (this.textBoxSearchData) {
          const value = this.parentForm.get(dmo.Name).value;
          const guid = dmo.Name === 'LMKESaleDMO_SAPAcctNumber' ? 'dmocustmstrsapno' : 'dmocustmstrcustname1'
          found = (this.textBoxSearchData.Data as Array<any>).find(item => item[guid] === value);
          if (found) {
            this.populateVendorDetails(found);
          }
          else {
            const guid = dmo.Name === 'LMKESaleDMO_SAPAcctNumber' ? 'dmocustmstrsapno' : 'dmocustmstrcustname1';
            if (guid === 'dmocustmstrsapno') {
              this.textBoxSearch$ = this.search.getSAPInfo(value).pipe(
                tap(data => {
                  this.textBoxSearchData = data;
                  found = (this.textBoxSearchData.Data as Array<any>).find(item => item[guid] === value);
                  if (found) {
                    this.populateVendorDetails(found);
                  }
                })
              );
            } else {
              this.textBoxSearch$ = this.search.getVendorInfo(value).pipe(
                tap(data => {
                  this.textBoxSearchData = data;
                  found = (this.textBoxSearchData.Data as Array<any>).find(item => item[guid] === value);
                  if (found) {
                    this.populateVendorDetails(found);
                  }
                })
              );
            }
          }
          existsValidator(this.parentForm.get(dmo.Name), dmo, found);
        }
      }
    }
  }
  validateSearchBox(dmo: any, val: any) {
    if (val === undefined) {
      let found: any;
      if (dmo.Name === 'LMKESaleDMO_SAPAcctNumber' || dmo.Name === 'LMKESaleDMO_TradingName') {
        if (this.textBoxSearchData) {
          const value = this.parentForm.get(dmo.Name).value;
          const guid = dmo.Name === 'LMKESaleDMO_SAPAcctNumber' ? 'dmocustmstrsapno' : 'dmocustmstrcustname1'
          found = (this.textBoxSearchData.Data as Array<any>).find(item => item[guid] === value);
          if (found) {
            this.populateVendorDetails(found);
          }
          existsValidator(this.parentForm.get(dmo.Name), dmo, found);
        }
      }
    }
    if (dmo.Name === 'LMKESaleDMO_SAPAcctNumber' || dmo.Name === 'LMKESaleDMO_TradingName') {
      if (this.textBoxSearchData) {
        let found: any;
        if (val === undefined) {
          val = this.parentForm.get(dmo.Name).value;
        }
        const guid = dmo.Name === 'LMKESaleDMO_SAPAcctNumber' ? 'dmocustmstrsapno' : 'dmocustmstrcustname1';
        if (guid === 'dmocustmstrsapno') {
          this.textBoxSearch$ = this.search.getSAPInfo(val).pipe(
            tap(data => {
              this.textBoxSearchData = data;
              found = (this.textBoxSearchData.Data as Array<any>).find(item => item[guid] === val);
              if (found) {
                this.populateVendorDetails(found);
              }
            })
          );
        } else {
          this.textBoxSearch$ = this.search.getVendorInfo(val).pipe(
            tap(data => {
              this.textBoxSearchData = data;
              found = (this.textBoxSearchData.Data as Array<any>).find(item => item[guid] === val);
              if (found) {
                this.populateVendorDetails(found);
              }
            })
          );
        }
        existsValidator(this.parentForm.get(dmo.Name), dmo, found);
      }
    }
  }

  // checkTextBoxSearchBoxItem(dmoName:any){    
  //   if(dmoName === 'LMKESaleDMO_SAPAcctNumber' || dmoName === 'LMKESaleDMO_TradingName'){      
  //     if(!!this.parentForm.get(dmoName).value){ 
  //       //  if(!!this.textBoxSearch$){
  //         const list$ =  this.textBoxSearch$.pipe(
  //           map(res => {
  //             if(!!res){
  //               console.log(res);
  //               return  res.Data.find(item => item.dmocustmstrsapno === this.parentForm.get(dmoName).value);
  //             }              
  //           })                
  //         );  
  //         list$.subscribe(next=>{
  //           if(next === undefined){
  //             this.parentForm.get('LMKESaleDMO_SAPAcctNumber').setValidators([existsValidator,Validators.required]);
  //             this.parentForm.get('LMKESaleDMO_SAPAcctNumber').updateValueAndValidity();
  //           }else{
  //             this.parentForm.get('LMKESaleDMO_SAPAcctNumber').clearValidators();
  //             this.parentForm.get('LMKESaleDMO_SAPAcctNumber').updateValueAndValidity();
  //           }
  //           console.log(next);
  //         });
  //       // } else{
  //       //       this.parentForm.get('LMKESaleDMO_SAPAcctNumber').setValidators([sapValidator,Validators.required]);
  //       //       this.parentForm.get('LMKESaleDMO_SAPAcctNumber').updateValueAndValidity();
  //       // }         
  //     }
  //   }
  // }

  validateRangeDmo(event: any, dmo: any) {    
    const ageControl = this.parentForm.get(dmo.Name);
    const decimalregex = new RegExp('^[0-9]{0,2}([.][1-9]{1,1})?$');
    const numberregex = new RegExp('^[0-9]{0,2}?$');
    const ageval = ageControl.value;
    if ((ageval === null || ageval === '') && ageControl.touched) {
      ageControl.patchValue(null);
      ageControl.markAsDirty()
      this.errorMessage = 'This is a required field';
      return false;
    }
    if (ageval !== null && ageval.includes('-')) {
      var range = ageval.split('-');  
      if(range[0] && range[0].includes('.'))  {
       if(!decimalregex.test(range[0])){
        this.errorMessage = 'Invalid Range.';
        return false;
       }
      }else{
        if(range[0] && !numberregex.test(range[0])){
          this.errorMessage = 'Invalid Range.';
          return false;
         }
      } if(range[1] !== '' && range[1].includes('.'))  {
        if(!decimalregex.test(range[1])){
          this.errorMessage = 'Invalid Range.';
          return false;
         }
       }else{
        if(range[1] && !numberregex.test(range[1])){
          this.errorMessage = 'Invalid Range.';
          return false;
         }
       }
      if (range[0] !== '' && range[1] !== '') {
        const from = parseFloat(range[0]);
        const to = parseFloat(range[1]);

        if (from > to) {
          this.errorMessage = 'The first value must be less than or equal to the value following the hyphen.';
          return false;
        }
        if (from === 0 && to === 0) {
          this.errorMessage = 'This fields only accepts 1 or greater than 1.';
          return false;
        }
      }
      else {
        this.errorMessage = 'The first character & last character must be a number.';
        return false;
      }
    }
    else if (ageval.includes('.')) {     
      if(!decimalregex.test(ageval)){
        this.errorMessage = 'Invalid Range.';
          return false;
      }
    }
    else if (parseFloat(ageval) === 0 || parseFloat(ageval) < 0 || parseFloat(ageval) < 1) {
      this.errorMessage = 'This fields only accepts 1 or greater than 1.';
      return false;
    }
    else if(!ageval.includes('.') && !ageval.includes('-')){
      if(ageval && !numberregex.test(ageval)){       
      this.errorMessage = 'Invalid Range.';
      return false;
      }
    }
    this.errorMessage = '';
    return true;
  }
  // validateRangeDmo1(event:any,dmo: any) {
  //   const group = this.parentForm.get(dmo.Name);   
  //   const fromControl = group.get(dmo.Name + 'From');
  //   const toControl = group.get(dmo.Name + 'To');      
  //   const fromControlFloat = fromControl.value.replace(/[^0-9.]/g, '').replace(/^\./, '0.');
  //   const toControlFloat = toControl.value.replace(/[^0-9.]/g, '').replace(/^\./, '0.');
  //   fromControl.patchValue(fromControlFloat);
  //   toControl.patchValue(toControlFloat);
  //   const from = parseFloat(fromControl.value);
  //   const to = parseFloat(toControl.value);    
  //   const isFloat = /[0-9.]*$/;  
  //   if (!fromControl.value.match(isFloat) || !toControl.value.match(isFloat) || from < 0 || to < 0) {
  //     this.errorMessage = 'Positive numeric values only';
  //     return false;
  //   }
  //   if ((from === null && fromControl.touched) || (to === null && toControl.touched)) {
  //     this.errorMessage = 'This is a required field'
  //     return false;
  //   } else if (from !== null && to !== null && from > to)  {
  //     this.errorMessage = 'Invalid Range';
  //     return false;
  //   }
  //   else if (event.data) {
  //     var val = event.data;
  //     const regex = new RegExp('^[a-zA-Z!@+,.?-_={}|/()<>*#$%^&]*$');
  //     if (regex.test(val) === true) {
  //       this.errorMessage = dmo.RegularExpression.Message;
  //       return false;
  //     }
  //   }
  //   this.errorMessage = '';
  //   return true;
  // }
  onScrollDropdown(event,dmo) {
    
    if(dmo.BeforeFetching && dmo.RecordsCount &&  dmo.RecordsCount <= this.ddlOption.length ) {
      return;
    }
    if (dmo.isSearch === false && event.end + dmo.BeforeFetching > this.ddlOption.length) {
      if (this.dmo.PageNumber > 0) {
        this.dmo.PageNumber = this.dmo.PageNumber + 1;
      } else {
        this.dmo['PageNumber'] = 1;
      }
      this.getDropDwonData();
    }
  }
  onSearchDropdown({term}, dmo) {
    if (dmo.BeforeFetching && term && term.length > 1) {
      this.dmo['PageNumber'] = 0;
      this.dmo.term = term;
      this.dmo.isSearch = true;
      this.getDropDwonData();
    }
  }
  onOpenDropdown(dmo) {
    if(dmo.BeforeFetching && this.dmo.isSearch) {
      this.dmo.term = '';
      this.dmo['PageNumber'] = 0;
      this.getDropDwonData();
    } else {
      this.dmo.isSearch = false;
    }
  }
  getDropDwonData(){
    if (this.dmo.DataSource === 'wfapigetdata') {
      const IsChild = (Object.keys(this.dmo.ParentDMO).length > 0) ? true : false;
      const callOption = this.dmo.Options.split('~~~');
      const callParam = JSON.parse(callOption[1]);
      const responseKey = callOption[0].toString().replace(/\s/g, '');
      if (IsChild) {
        const parentDMOKey = this.dmo.ParentDMO[Object.keys(this.dmo.ParentDMO)[0]].Name;
        const parentObj = this.parentForm.get(parentDMOKey);
        const parentValue = parentObj.value;

        callParam.GridFilters.forEach(objFilter => {
          if (objFilter.FilterType === 'Cascading_Filter') {
            objFilter.FilterType = 'Column_Filter';
            objFilter.GridConditions[0].ConditionValue = parentValue;
          }

        });
      }

      const responseParamss = responseKey.split('-');
      let paramValue = '';
      let paramText = '';
      let ddlOpt = [];
      callParam.PageNumber = this.dmo.PageNumber;
      if(this.dmo.term && this.dmo.term.length > 0) {
        const collist = callParam.ColumnList.split(',');
        if(collist.length > 1) {
          collist[0] = collist[0] + '-' + collist[1]; 
        }
        const filterTerm = {
          GridConditions: [
            {
              Condition: "CONTAINS",
              ConditionValue: this.dmo.term,
              dataType: "TextBox",
              RowValue: this.dmo.term
            }
          ],
          DataField: collist[0],
          LogicalOperator: "OR",
          FilterType: "Column_Filter"
        };
        callParam.GridFilters.push(filterTerm);
      }
      this.listviewService.GridData(callParam,false).pipe(
        scan((acc, curr) => Object.assign({}, acc, curr), {})
      ).subscribe(result => {
        result.Data.forEach(rowItem => {
          if (responseParamss.length === 1) {
            paramValue = rowItem[responseParamss[0]];
            ddlOpt.push({ ValueField: paramValue, TextField: paramValue });
          } else if (responseParamss.length === 2) {
            paramValue = `${rowItem[responseParamss[0]]}`;
            const resultText = responseParamss[1].replace('(', '-').replace(')', '-').split('-');
            if (resultText.length === 1) {
              paramText = `${rowItem[responseParamss[1]]}`;
            }
            else if (resultText.length > 1) {
              if (rowItem[resultText[1]] !== undefined)
                paramText = `${rowItem[resultText[0]]} (${rowItem[resultText[1]]})`;
              else
                paramText = `${rowItem[resultText[0]]}`;
            }
            ddlOpt.push({ ValueField: paramValue, TextField: paramText });
          }
        });
        if(this.dmo.term && this.dmo.term.length > 0) {
          this.ddlOption = ddlOpt;
        } else {
          this.ddlOption = this.ddlOption.concat(ddlOpt);
        }
      });
    }
  }

  displayTradingName(item: any) {
    return item.dmocustmstrcustname2 === '' ? item.dmocustmstrcustname1  : `${item.dmocustmstrcustname1} ${item.dmocustmstrcustname2}`;
  }
  DownloadAndStoreFile(objfile: any) {
    const formData = new FormData();
    if (this.transactionID !== '') {
      formData.append('transactionId', this.transactionID);
    }
    formData.append('tempTransactionID', this.tempTransactionID);
    formData.append('dmoGUID', this.dmoGUID);
    formData.append('isEncrypted', 'false');
    formData.append('FileName', objfile.FileName);
    this.dmoControlService.downloadfile('application/downloadfile', formData).subscribe(
      (resultBlob: Blob) => {
        this.dmoimage.ImagesFileList.push({
          file: {file: resultBlob}, 
          ImgFileName: objfile.OldFileName,
          Guid: this.dmoGUID,
          imgId: this.dmoimage.index
        })
      }
    );


  }
  dateMasks(event: any) {
    var v = event.target.value;
    if (v.match(/^\d{2}$/) !== null) {
      event.target.value = v + '/';
    } else if (v.match(/^\d{2}\/\d{2}$/) !== null) {
      event.target.value = v + '/';
    } else if(v > 7){
      event.target.value = v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }
  }	
}

