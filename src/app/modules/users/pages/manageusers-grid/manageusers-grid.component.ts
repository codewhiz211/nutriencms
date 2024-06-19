import { Component, OnInit } from '@angular/core';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { UserManagementService } from '@app/core/services/user-management.service';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { NgbModal, NgbModalRef, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { Router } from '@angular/router';
import { GridViewExportComponent } from '@app/shared/components/grid-view-export/grid-view-export.component';
import { DatePipe, formatDate } from '@angular/common';
import { environment } from '@env/environment';
import * as CryptoJS from 'crypto-js';
import { MessageService } from '@app/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserDetail } from '@app/core/models/user-detail';
@Component({
  selector: 'app-users-grid',
  templateUrl: './manageusers-grid.component.html',
  styleUrls: ['./manageusers-grid.component.scss']
})

export class ManageUsersGridComponent implements OnInit {
  encrypted: any;
  transactionId: string;
  filters: any = {};
  dataSource: any;
  ExportData: any;
  itemsCount: number;
  pageNum = -1;
  dammyData: any = {};
  filterValue1: string = "";
  filterValue2: string = "";
  ConditionOpt1: string = "";
  ConditionOpt2: string = "";
  logicalOpt:string="OR";
  TimeZone: string;
  dateFormat = '';
  FromDateobj: NgbDateStruct;
  ToDateobj: NgbDateStruct;
  SearchText = new FormControl('');
  constructor(
    private msg: MessageService,
    private usermanagement: UserManagementService,
    private columnFilter: ColumnFilterService,
    private modalService: NgbModal,
    private router: Router,
    private userDetail: UserDetail,
    private datePipe: DatePipe) { 
      this.dateFormat = environment.Setting.dateFormat;
    }
  bodyData = {
    PageSize: 10,
    PageNumber: 1,
    SortColumn: 'FirstName',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: [],
    UserId: this.userDetail.UserID.toString(),
    GroupId: this.userDetail.GroupId.toString(),
    ApiKey:this.userDetail.ApiKey.toString(),
    AccessToken: localStorage.getItem('AccessToken'),
    SearchName: ""
  };

  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'UserName',
            displayName: 'User Name',
            width: '15%'
          },
          {
            objectKey: 'FirstName',
            displayName: 'First Name',
            width: '15%'
          },
          {
            objectKey: 'LastName',
            displayName: 'Last Name',
            width: '15%'
          },
          {
            objectKey: 'EmailAddress',
            displayName: 'Email Address',
            width: '15%'
          },
          {
            objectKey: 'Phone',
            displayName: 'Phone',
            width: '15%'
          },
          {
            objectKey: 'Status',
            displayName: 'Status',
            width: '8%'
          },
          {
            objectKey: 'DateRegistered',
            displayName: 'Created On',
            dataType: 'Date',
            format: environment.Setting.dateFormat,//'dd/MM/yyyy',
            timeZone: this.userDetail.TimeZone.toString(),
            width: '10%'
          },
          {
            objectKey: 'DateLastModified',
            displayName: 'Modified On',
            dataType: 'Date',
            format: environment.Setting.dateFormat,//'dd/MM/yyyy',
            timeZone: this.userDetail.TimeZone.toString(),
            width: '10%'
          },
        ],
        action: {
          Edit: true,
          Delete: true,
          Checkbox: true,
          Placement: 'IsExternalShow',

          DropDown: false
        },
        columnFilter: []
      },
      paging: true
    }
  };
  ngOnInit() {
   // this.bindUser(this.bodyData);
      if (sessionStorage.getItem('grid_filter')) {
      this.bodyData = JSON.parse(sessionStorage.getItem('grid_filter'));
      if(this.bodyData.GridFilters != undefined)
      {
        if(this.bodyData.GridFilters.length>0){
          if(this.bodyData.GridFilters[0].FilterType == 'Column_Filter'){
            if(this.bodyData.GridFilters[0].GridConditions.length > 0){
              for(let i = 0; i < this.bodyData.GridFilters[0].GridConditions.length; i++){
                this.logicalOpt = this.bodyData.GridFilters[0].LogicalOperator;           
                if(i == 0){
                  this.ConditionOpt1 = this.bodyData.GridFilters[0].GridConditions[i].Condition;
                  if(this.bodyData.GridFilters[0].GridConditions[i].dataType === 'Date'){                    
                    const lstFromDate = this.convertToLocalDataAndTime(this.bodyData.GridFilters[0].GridConditions[i].ConditionValue, this.dateFormat, 0).split('/');
                    this.FromDateobj = {year: parseInt(lstFromDate[2], 0), month: parseInt(lstFromDate[0], 0), day: parseInt(lstFromDate[1], 0) };
                  }
                  else{
                    this.filterValue1 = this.bodyData.GridFilters[0].GridConditions[i].ConditionValue;      
                  }                    
                }
                else{
                  this.ConditionOpt2 = this.bodyData.GridFilters[0].GridConditions[i].Condition;
                  if(this.bodyData.GridFilters[0].GridConditions[i].dataType === 'Date'){
                    const lstToDate = this.convertToLocalDataAndTime(this.bodyData.GridFilters[0].GridConditions[i].ConditionValue, this.dateFormat, 0).split('/'); ;
                    this.ToDateobj = {year: parseInt(lstToDate[2], 0), month: parseInt(lstToDate[0], 0), day: parseInt(lstToDate[1], 0) };
                  }
                  else{
                    this.filterValue2 = this.bodyData.GridFilters[0].GridConditions[i].ConditionValue;
                  }
                }
              }
            }
          }
          if(this.bodyData.GridFilters[0].FilterType == 'Global_Search'){
            if(this.bodyData.GridFilters[0].GridConditions.length > 0){
            //(<HTMLInputElement>document.getElementById("globalSearch")).value = this.bodyData.GridFilters[0].GridConditions[0].ConditionValue.toString();
            var searchval=this.bodyData.GridFilters[0].GridConditions[0].ConditionValue.toString();
            searchval=searchval!="" ? this.ReplaceDoubleQuotes(searchval) : "";
            this.SearchText.setValue(searchval);
            }
          }
        }
      }

      this.bindUser(this.bodyData);
    }
    else {
      this.bindUser(this.bodyData);
    }    
    
    this.SearchText.valueChanges.pipe(debounceTime(600), distinctUntilChanged()).subscribe(searchText => {
      this.bodyData.SearchName = searchText!="" ? this.ReplaceSingleQuotes(searchText) : "";
      this.globalSearch(searchText);    
      });
      
      
}




  private bindUser(bodyData) {
 
    this.usermanagement.getUserGridList(bodyData).subscribe(Result => {
      if (Result) {
        if (Result.code == "200") {
          if (Result.data.UserInfo.ManageUsers.length == undefined) {
            this.dataSource = [Result.data.UserInfo.ManageUsers]
          } else {
            this.dataSource = Result.data.UserInfo.ManageUsers;
          }

          this.itemsCount = Result.totalrecords;
        }
        else if (Result.code == "3035") {
          this.dataSource = [];
          this.itemsCount = 0;
        }else if(Result.message==""|| Result.message==null){
          this.msg.showMessage('Fail', {body: "GetAllManageUserList failed due to an internal server error."});
        }
        else {
          this.msg.showMessage('Fail', {body: Result.message});
        }
      }
    }, error => {
      this.msg.showMessage('Fail', {body: error});
    });
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.bindUser(this.bodyData);
  }

  actionClick(event) {

    if (event.action == "asc" || event.action == "desc") {
      if (event.action == "asc") {
        event.action = "desc";
      } else {
        event.action = "asc";
      }
    }
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Edit':
        //console.log(this.dataSource[event.rowIndex]);
        const UserName = this.dataSource[event.rowIndex].UserName;
        this.encrypted = CryptoJS.AES.encrypt(UserName, environment.Setting.secretCode);
        // this.router.navigate(['/users/user-profile', this.encrypted.toString()]);
        this.router.navigate(['/users/user-profile'],{ queryParams: { uName:encodeURIComponent(this.encrypted.toString())}});
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
          if (event.colData.dataType === 'Date') {
            let modifiedDateValue1 = this.ChangeFilterDateFormat(event.filterData.filterValue1);
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: this.datePipe.transform(modifiedDateValue1, 'yyyy-MM-dd HH:mm:ss')
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: event.filterData.filterValue1!=""?this.ReplaceSingleQuotes(event.filterData.filterValue1):""
            });
          }
        }
        if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {          
          if (event.colData.dataType === 'Date') {
            let modifiedDateValue2 = this.ChangeFilterDateFormat(event.filterData.filterValue2);
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: this.datePipe.transform(modifiedDateValue2, 'yyyy-MM-dd HH:mm:ss')
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: event.filterData.filterValue2!=""?this.ReplaceSingleQuotes(event.filterData.filterValue2):""
            });
          }
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
        sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
        this.bindUser(this.bodyData);
        //console.log(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        //console.log(this.bodyData);
        sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
        this.bindUser(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
        this.bindUser(this.bodyData);
        break;
      case 'Delete':
        this.openConfirmation(this.dataSource[event.rowIndex].UserName);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        sessionStorage.removeItem('grid_filter');
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
    }
    // console.log(event);
  }

  
 ReplaceSingleQuotes(val){
  return val.replace(/'/g, "''");
} 
ReplaceDoubleQuotes(val){
  return val.replace(/''/g, "'");
} 

  globalSearch(value) {

    value=this.ReplaceSingleQuotes(value);
    let filter: any = {};
    if (value === '') {
      delete this.filters['Global_Search~$~dmoName'];
    } else {
      filter = {
        GridConditions: [{
          Condition: 'CONTAINS',
          ConditionValue: value
        }
        ],
        DataField: '',
        LogicalOperator: 'Or',
        FilterType: 'Global_Search'
      };
    }
    if (filter && Object.keys(filter).length !== 0) {
      this.filters['Global_Search~$~dmoName'] = filter;
    }
    this.generateFilter();
  }

  private generateFilter() {
    sessionStorage.removeItem('grid_filter');
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
    this.bindUser(this.bodyData);
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
  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
      // if (!this.ColumnData[item.datafield]) {
      //   this.showItemLoading = false;
      //   this.listviewService.DMOData(this.ProcessName, item.datafield).subscribe(
      //     data => {
      //       this.ColumnData[item.datafield] = data;
      //       this.showItemLoading = true;
      //     });
      // }
    } else {
      const key = Object.keys(item.colData)[0];
      this.HeaderMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }
  removeFilter(txtGlobal) {
    this.filters = [];
    txtGlobal.value = '';
    this.pageNum = 1;
    this.bodyData.SearchName="";
    this.generateFilter();
  }

  /* -------------------------Delete Single Record---------------------- */
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete User Record',
      body: 'Are you sure you want to delete the user record?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this user',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete?', 'Delete user record', 'Confirm Delete', this.deleteConfirmation, true,
    //   true, false, 'Yes, delete this user.');
  }
  deleteConfirmation(modelRef: NgbModalRef, Caller: ManageUsersGridComponent) {
    if (Caller.transactionId) {
      Caller.usermanagement.deleteUser(Caller.transactionId).subscribe(
        result => {
          if (result.status === 'SUCCESS') {
            Caller.bindUser(Caller.bodyData);
            modelRef.close();
          }
        });
    } else {
      modelRef.close();
    }
  }
  /*------------------- Show Popup -------------------*/
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsConfirmation: boolean, IsDelete: boolean,
  //   IsDefaultView: boolean, confirmationText: string) {
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


  getExportDataList(Result: any) {

    if (Result.code == "200") {
      if (Result.data.UserInfo.ManageUsers.length == undefined) {
        this.ExportData = [Result.data.UserInfo.ManageUsers]
      } else {
        this.ExportData = Result.data.UserInfo.ManageUsers;
      }
    } else if (Result.code == "3035") {
      this.ExportData = [];
    }
  }


  async GetExportData() {
    this.bodyData.PageNumber=1;
    this.bodyData.PageSize=90000;
    
    await this.usermanagement.GetExportData(this.bodyData).then((Result) => {
      this.getExportDataList(Result);
    }, error => {
      this.msg.showMessage('Fail', {body: error});
      // this.showErrorMessage(error, 'Error', 'Ok', null, false, false, true, '');
    });
  }

  async openNewExportPopup(ExportType: string) {

    await this.GetExportData();

    this.usermanagement.getUserColumns().subscribe(Result => {
      const modalRef = this.modalService.open(GridViewExportComponent, { backdrop: 'static' });
      const modalInstance: GridViewExportComponent = modalRef.componentInstance;
      modalInstance.ExportType = ExportType.toUpperCase();
      modalInstance.ExportPopup = modalRef;
      modalInstance.ExternalCall = {
        FromURL: true,
        GUID: 'Name',
        displayValue: 'DisplayName',
        DownloadFileURL: this.usermanagement.getUserEndPoint(ExportType)
      };
      modalInstance.ExportUserData.ManageUsers = this.ExportData;
      modalInstance.ExportUserData.ProcessName = 'Users';
      modalInstance.setDmoList(Result);
    }, err => {
      this.msg.showMessage('Fail', {body: err.message});
      // this.showErrorMessage(err.message, 'Error', 'Ok', null, false, false, true, '');
    });
  }

  /* -------------------------Change User Status (active/ inactive)---------------------- */
  openStatus() {
    const count = this.dataSource.filter(x => x.selected === true).length;
    if (count === 1) {
      this.msg.showMessage('Warning', {
        header: 'Change User Status',
        body: 'Are you sure you want to change this status?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.ChangeStatus,
        caller: this,
      })
      // this.showErrorMessage('Are you sure you want to change this status?', 'Change user status', 'Yes', this.ChangeStatus, true,
      //   false, true, '');
    } else if (count > 1) {
      this.msg.showMessage('Warning', {body: 'Please select only one record'});
      // this.showErrorMessage('Please select only one record', 'Warning !', 'Ok', null, false, false, true, '');
    } else {
      this.msg.showMessage('Warning', {body: 'Please select at least one record'});
      // this.showErrorMessage('Please select at least one record', 'Warning !', 'Ok', null, false, false, true, '');
    }
  }
  ChangeStatus(modelRef: NgbModalRef, Caller: ManageUsersGridComponent) {
    Caller.dataSource.filter(x => x.selected === true).forEach(element => {
      const status = element.Status === 'Active' ? 0 : 1;
      Caller.usermanagement.ChangeUserStatus(element.UserName, status).subscribe(
        result => {
          if (result.status === 'SUCCESS') {
            Caller.bindUser(Caller.bodyData);
          }
        });
    });
    modelRef.close();
  }

  convertToLocalDataAndTime(value, format, zone) {
    if (value == null || value === '') {
      return null;
    }
    try {
      const d = new Date(value); // val is in UTC
      let timeZone;
      if (!zone) {
        timeZone = this.TimeZone;
      } else {
        timeZone = zone;
      }
      const localOffset = timeZone * -60000;
      const localTime = d.getTime();// - localOffset;
      d.setTime(localTime);
      return formatDate(d, format, 'en-US');
    } catch (error) {
      // console.log('Datevalue-' + value + 'error' + error);
      return '';
    }
  }
 ChangeFilterDateFormat(dateValue){
    
    //let dateArray =  dateValue.split("/");
    //let modifiedDateValue = dateArray[1].toString() + '/'+ dateArray[0].toString() +'/'+ dateArray[2].toString();
   // var d = new Date(modifiedDateValue);
    //return d;
    return new Date(dateValue);
  }
}

