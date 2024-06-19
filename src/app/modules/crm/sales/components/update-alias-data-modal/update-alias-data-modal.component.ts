import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbTypeaheadSelectItemEvent, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { IHeaderMap, ApplicationService, AuthenticationService, DmoControlService, ColumnFilterService, MessageService } from '@app/core';
import { LotSearchService } from '@app/modules/crm/lots/services/lot-search.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from '../../services/sales.service';
import { MessageComponent } from '@app/shared';
import { UserDetail } from '@app/core/models/user-detail';
import { environment } from '@env/environment';

@Component({
  selector: 'app-update-alias-data-modal',
  templateUrl: './update-alias-data-modal.component.html',
  styleUrls: ['./update-alias-data-modal.component.scss']
})
export class UpdateAliasDataModalComponent implements OnInit {
  formValue: any;
  aliasForm: FormGroup;
  CustomersList: any;
  SAPNo: any;
  saleYardCode: any;
  currentUser: any;
  saleyardSapNo: any;
  transactionId: any;
  dmo = [];
  sname = 'Customer';
  sapno = 'Customer';
  filters: any = {};
  isTriggerRole = false;
  Invalid = '';
  submitted = false;
  companyCode = '';
  aliasHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'Alias',
            displayName: 'Alias',
            width: '25%'
          },
          {
            objectKey: 'SName',
            displayName: this.sname + ' Name',
            width: '25%'
          },
          // Entity Start 19 Feb Roshan
          {
            objectKey: 'CompanyCode',
            displayName: 'Company Code',
            width: '25%'
          },
          // Entity End 19 Feb Roshan
          {
            objectKey: 'SapNo',
            displayName: this.sapno + ' ID',
            width: '23%'
          }
        ],
        action: {
          Delete: this.checkRoleExists()
        },
        columnFilter: []
      },
      paging: true
    }
  };

  aliasDataSource: any = [];
  aliasItemsCount: number;
  pageNum = -1;
  bodyData = {
    PageSize: 10,
    PageNumber: 1,
    SortColumn: '-1',
    SortOrder: 'desc',
    TimeZone: 0,
    saleyardCode: '',
    aliasName: '',
    aliasType: '',
    aliasCategoryName: '',
    GridFilters: []
  };
  nextClick = false;
  constructor(
    public activeModal: NgbActiveModal,
    public lotSearchService: LotSearchService,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    public applicationService: ApplicationService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public saleservice: SalesService,
    private dmoControlService: DmoControlService,
    private columnFilter: ColumnFilterService,
    private msg: MessageService,
    private userDetail: UserDetail
  ) {
  }

  ngOnInit() {
    this.aliasForm = this.fb.group({
      DMOSYAliases_SYASAliasTyp: ['Customer'],
      lookup_alias_alias: [null],
      lookup_alias_breed: [null],
      lookup_alias_customer: [null],
      lookup_alias_product: [null],
      DMOSYAliases_SYAAliasNo: [null, [Validators.required]],
      DMOSYAliases_SYAAliasRef: [null, [Validators.required]],
      DMOSYAliases_SYASaleyard: [null],
      DMOSYAliases_SYAPActFm: [null],
      DMOSYAliases_SYASActTo: [null]
    });
  }

  get f() { return this.aliasForm.controls; }

  capitalize(str1) {
    return str1.charAt(0).toUpperCase() + str1.slice(1);
  }


  actionClick(event) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        if (!this.validate(event)) {
          break;
        }
        this.bodyData.PageNumber = 1;
        let filter: any = {};
        filter = {
          GridConditions: [
          ],
          DataField: event.colData.objectKey,
          LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
          FilterType: 'Column_Filter'
        };
        if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
          filter.GridConditions.push({
            Condition: event.filterData.ConditionOpt1.Value,
            ConditionValue: event.filterData.filterValue1
          });
        }
        if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
          filter.GridConditions.push({
            Condition: event.filterData.ConditionOpt2.Value,
            ConditionValue: event.filterData.filterValue2
          });
        }
        if (filter && Object.keys(filter).length !== 0) {
          this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
        }
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        this.getAliasListBasedOnAliasType();
        console.log(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        console.log(this.bodyData);
        this.getAliasListBasedOnAliasType();
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.getAliasListBasedOnAliasType();
        break;
      case 'Delete':
        this.msg.showMessage('Warning', {
          header: 'Delete Selected Item',
          body: 'Do you want to delete selected item?',
          btnText: 'Confirm Delete',
          checkboxText: 'Yes, delete selected item',
          isDelete: true,
          caller: this,
        }).result.then(result=>{
          if (result) {
            this.applicationService.deleteGridData(this.aliasDataSource[event.rowIndex].TRNSCTNID).subscribe(x => {
              this.getAliasListBasedOnAliasType();
            });
          }
        })
      
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
    }
    console.log(event);
  }

  private generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });

    this.getAliasListBasedOnAliasType();
  }
  validate(event): boolean {

    if (event.filterData.ConditionOpt1 && (event.filterData.ConditionOpt1.Value === '' ||
      event.filterData.ConditionOpt1.Value === 'Select...')) {
      return false;
    } else if (event.filterData.filterValue1 && event.filterData.filterValue1.Value === '') {
      return false;
    } else {
      return true;
    }
  }
  CreateNewAlias() {
    this.submitted = true;
    if(this.aliasForm.invalid){
      return;
    }
    var aliasType = this.aliasForm.controls.DMOSYAliases_SYASAliasTyp.value;
    var alias = this.aliasForm.controls.DMOSYAliases_SYAAliasNo.value;
    if (aliasType === 'Customer') {
      aliasType = "Partner";
    }
    const saleYardName = this.saleservice.currentSaleYardName;
    if(!this.SAPNo){
      this.Invalid = aliasType;
    }
    if (saleYardName != undefined && alias && this.SAPNo) {
     // this.lotSearchService.getSalyardCodeByName(saleYardName).subscribe(res => {
        this.aliasForm.controls['DMOSYAliases_SYASaleyard'].setValue(this.saleservice.currentSaleYardName + ' (' + this.saleservice.currentSaleYardValue + ')');
        this.formValue = { ...this.aliasForm.value };
        this.dmo = [];
        this.dmo.push("dmosyaliasessyasaleyard");//saleyard code
        this.dmo.push("dmosyaliasessyaaliasno");//alias name/no
        this.dmo.push("dmosyaliasessyaaliasref");//sap no/bread/product
        this.dmo.push("dmosyaliasessyasaliastyp");//alias type    
        this.dmo.push({Type: 'StaticDateBox', Name: 'DMOSYAliases_SYAPActFm'});
        this.dmo.push({Type: 'StaticDateBox', Name: 'DMOSYAliases_SYASActTo'});
        var currentDate = new Date();
        this.formValue.DMOSYAliases_SYAPActFm = { year: currentDate.getFullYear() , month: currentDate.getMonth()+1, day: currentDate.getDate()};
        this.formValue.DMOSYAliases_SYASActTo = { year: 9999 , month: currentDate.getMonth()+1, day: currentDate.getDate()}; 
        // currentDate.getMonth() + "/" + currentDate.getDate() + "/" + "9999";
        this.formValue = this.dmoControlService.sanitizeFormValue(this.dmo, this.formValue);
        if (this.aliasForm.controls.DMOSYAliases_SYASAliasTyp.value == "Customer") {
          this.formValue.DMOSYAliases_SYASAliasTyp = "Partner";
          this.formValue.DMOSYAliases_CompCode = this.companyCode;
        }
        this.formValue.DMOSYAliases_SYAAliasRef = this.formValue.DMOSYAliases_SYAAliasRef + ' (' + this.SAPNo + ')';
        const dataSource = this.saleservice.submitDataForCreateSale;
        if (dataSource != null && dataSource.submitData != null) {
          const saledate = dataSource.submitData.Data[0].DMOCRM_HeaderInf_SaleDate;
          this.formValue.DMOSYAliases_SYAPActFm = saledate;
        }        
        this.currentUser = this.userDetail;
        const submitData: any = {
          ProcessName: "LMKConfigSaleyardAliases",
          TriggerName: "TRGR_SaleyardAliasesInProcess_Submit",
          UserName: this.currentUser.UserName,
          UniqueConstraints: '',
          Data: [this.formValue],
          ParentTransactionID: '-1',
          TempTransactionID: '0',
          IsBulkUpload: 'true'
        };
        this.lotSearchService.ValidateAlias(aliasType, this.SAPNo, alias, this.saleservice.currentSaleYardValue).subscribe(
          (resultData: any) => {
            if (resultData[0].rowCount == 0) {
              delete submitData.Data[0].lookup_alias_customer;
              delete submitData.Data[0].lookup_alias_alias;
              delete submitData.Data[0].lookup_alias_breed;
              delete submitData.Data[0].lookup_alias_product;
              this.applicationService.insertApplication(submitData).subscribe(data => {

                if (data.status == 'Success') {
                  
                  // const dataSource = this.saleservice.submitDataForCreateSale;
                  // if (dataSource != null && dataSource.submitData != null) {
                  //   const saledate =this.saleservice.getCurrentDateTime(this.userDetail.TimeZone, dataSource.submitData.Data[0].DMOCRM_HeaderInf_SaleDate);
                  //   const UpdateData = {
                  //     TransactionID: data.result.transactionId,
                  //     CreatedDate: saledate,
                  //   };
                  //   this.saleservice.updateAliasCreatedDate(UpdateData).toPromise();
                  // }
                }
                  this.aliasForm.get("DMOSYAliases_SYAAliasRef").reset();
                this.aliasForm.get("DMOSYAliases_SYAAliasNo").reset();
                this.toastr.success('Data saved successfully');
                this.submitted = false;
              });
            }
            else if (resultData[0].rowCount == 1 && resultData[0].rowCount1 == 0) {
              this.msg.showMessage('Warning', {body: 'This alias exists already'});
              // this.showErrorMessage('This alias is already exist.', 'Message', 'Ok', null, false, true, false, '');
            }
            else if (resultData[0].rowCount == 0 && resultData[0].rowCount1 == 1) {
              this.openConfirmation(resultData[0].transactionID);
            }
          }
        );
     // })
    }
  }

  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Update Alias Record',
      body: 'Are you sure you want to update this alias?',
      btnText: 'Confirm Update',
      checkboxText: 'Yes, update this alias',
      isDelete: true,
      callback: this.updateConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to update this alias?',
    //   'Update Alias Record', 'Confirm Update', this.updateConfirmation, true, false, true, 'Yes, Update this Alias.');
  }
  /*------------------- Show Popup -------------------*/
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

  updateConfirmation(modelRef: NgbModalRef, Caller: UpdateAliasDataModalComponent) {
    if (Caller.transactionId != "") {
      const submitData: any = {
        Identifier: {
          Name: null,
          Value: null,
          TrnsctnID: Caller.transactionId
        },
        ProcessName: "LMKConfigSaleyardAliases",
        TriggerName: 'Save Data',
        UserName: Caller.currentUser.UserName,
        Data: [Caller.formValue]
      };
      delete submitData.Data[0].lookup_alias_customer;
      delete submitData.Data[0].lookup_alias_alias;
      delete submitData.Data[0].lookup_alias_breed;
      delete submitData.Data[0].lookup_alias_product;

      Caller.applicationService.updateApplication(submitData).subscribe(data => {
        Caller.aliasForm.get('DMOSYAliases_SYAAliasRef').reset();
        Caller.aliasForm.get('DMOSYAliases_SYAAliasNo').reset();
        Caller.toastr.success('Data updated successfully');
        this.submitted = false;
      });
    } else {
      modelRef.close();
    }
  }
  customerSearch = (text$: Observable<string>) => {
    return this.lotSearchService.customerSearch(text$);
  }

  selectcustomer(event: NgbTypeaheadSelectItemEvent, field: string) {
    this.lotSearchService.customerData.forEach(customer => {
      if (customer[field] === event.item) {
        this.aliasForm.get('DMOSYAliases_SYAAliasRef').patchValue(customer.dmocustmstrcustname1);
        this.SAPNo = customer.dmocustmstrsapno;
        this.companyCode = customer.dmocustmstrcompcode;
        this.Invalid = '';
      }
    });
  }
  breadSearch = (text$: Observable<string>) => {
    return this.lotSearchService.breadSearch(text$);
  }

  selectBread(event: NgbTypeaheadSelectItemEvent, field: string) {
    this.lotSearchService.breadData.forEach(breed => {
      if (breed[field] === event.item) {
        this.aliasForm.get('DMOSYAliases_SYAAliasRef').patchValue(breed.dmoprodbrdprodbrddscr);
        this.SAPNo = breed.dmoprodbrdprodbrdcode;
        this.Invalid = '';
      }
    });
  }

  productSearch = (text$: Observable<string>) => {
    return this.lotSearchService.ProductSearch(text$);
  }

  selectProduct(event: NgbTypeaheadSelectItemEvent, field: string) {
    this.lotSearchService.ProductData.forEach(product => {
      if (product[field] === event.item) {
        this.aliasForm.get('DMOSYAliases_SYAAliasRef').patchValue(product.dmoproductproddscr);
        this.SAPNo = product.dmoproductprodcode;
        this.Invalid = '';
      }
    });
  }

  search() {
    if(this.nextClick) {
      this.nextClick = false;
    this.pageNum =-1;
    this.bodyData.PageNumber = 1;
    }
    this.getAliasListBasedOnAliasType();
  }
  getAliasListBasedOnAliasType() {
   
    const saleYardName = this.saleservice.currentSaleYardName;
    const aliasType = this.aliasForm.controls.DMOSYAliases_SYASAliasTyp.value;
    const aliasName = this.aliasForm.controls.lookup_alias_alias.value;
    let aliasCatgryName: any;
    if (aliasType === 'Customer') {
      aliasCatgryName = this.aliasForm.controls.lookup_alias_customer.value;
    } else if (aliasType === 'Breed') {
      aliasCatgryName = this.aliasForm.controls.lookup_alias_breed.value;
    } else {
      aliasCatgryName = this.aliasForm.controls.lookup_alias_product.value;
    }
    if (saleYardName) {
     this.bodyData.saleyardCode = this.saleservice.currentSaleYardValue;
     //this.saleservice.currentSaleYardValue = this.bodyData.saleyardCode = '57032';
      this.bodyData.aliasType = aliasType === 'Customer' ? 'Partner' : aliasType;
      this.bodyData.aliasName = aliasName;
      this.bodyData.aliasCategoryName = aliasCatgryName;

      this.saleservice.getAlias(this.bodyData).subscribe(result => {
        this.aliasDataSource = result.AliasData;
        this.aliasItemsCount = result.itemCount;
      });
    } else {
      this.aliasDataSource = [];
    }

  }
  setConfig() {
    this.aliasForm.controls.DMOSYAliases_SYAAliasRef.patchValue("");
    this.aliasForm.controls.DMOSYAliases_SYAAliasNo.patchValue("");
    const name = this.aliasForm.controls.DMOSYAliases_SYASAliasTyp.value;
    // Entity Start 19 Feb Roshan
    if(name == 'Customer'){
      this.aliasHeaderMap.config.header.columns = [
        {
          objectKey: 'Alias',
          displayName: 'Alias',
          width: '25%'
        },
        {
          objectKey: 'SName',
          displayName: 'Customer Name',
          width: '25%'
        },
        {
          objectKey: 'CompanyCode',
          displayName: 'Company Code',
          width: '25%'
        },
        {
          objectKey: 'SapNo',
          displayName: this.sapno + ' ID',
          width: '23%'
        }
      ];
    } else{
      this.aliasHeaderMap.config.header.columns = [
        {
          objectKey: 'Alias',
          displayName: 'Alias',
          width: '25%'
        },
        {
          objectKey: 'SName',
          displayName: 'Customer Name',
          width: '25%'
        },
        {
          objectKey: 'SapNo',
          displayName: this.sapno + ' ID',
          width: '23%'
        }
      ];
      this.aliasHeaderMap.config.header.columns[1].displayName = name + ' Name';
      this.aliasHeaderMap.config.header.columns[2].displayName = name + ' Id';
    }
  // Entity End 19 Feb Roshan
    this.aliasDataSource = [];
    this.bodyData.GridFilters = [];
    this.SAPNo = '';
  }

  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
    } else {
      // const key = Object.keys(item.colData)[0];
      this.aliasHeaderMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }
  pageChange(event) {
    this.nextClick = true;
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getAliasListBasedOnAliasType();
  }
  removeFilter() {
    this.filters = [];
    this.pageNum = 1;
    this.generateFilter();
  }
  get hasFilter() {
    return Object.keys(this.filters).length > 0 ? true : false;
  }
  checkRoleExists(): boolean {
    environment.saleTriggerRole.forEach(role => {
      if(this.userDetail.ListRole.indexOf(role) > -1){
        this.isTriggerRole = true;
      }
    })
    return this.isTriggerRole;
  }
}
