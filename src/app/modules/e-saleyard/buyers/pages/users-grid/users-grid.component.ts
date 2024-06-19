import { Component, OnInit } from '@angular/core';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { UserManagementService } from '@app/core/services/user-management.service';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { NgbModal, NgbModalRef, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { Router } from '@angular/router';
import { GridViewExportComponent } from '@app/shared/components/grid-view-export/grid-view-export.component';
import { formatDate } from '@angular/common';
import { environment } from '@env/environment';
import { ApiESaleyardService, MessageService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-users-grid',
  templateUrl: './users-grid.component.html',
  styleUrls: ['./users-grid.component.scss']
})

export class UsersGridComponent implements OnInit {
  transactionId: string;
  filters: any = {};
  dataSource: any;
  itemsCount: number;
  pageNum = -1;

  filterValue1: string = "";
  filterValue2: string = "";
  ConditionOpt1: string = "";
  ConditionOpt2: string = "";
  logicalOpt:string="OR";
  TimeZone: string;
  dateFormat = '';
  FromDateobj: NgbDateStruct;
  ToDateobj: NgbDateStruct;
  DisplayName = sessionStorage.getItem('DisplayName');
  isBuyerAccess: boolean = false;
  constructor(
    private msg: MessageService,
    private usermanagement: UserManagementService,
    private columnFilter: ColumnFilterService,
    private modalService: NgbModal,
    private router: Router,
    private userDetail: UserDetail,
    private api: ApiESaleyardService) { 
      this.dateFormat = environment.Setting.dateFormat;
    }
  bodyData = {
    PageSize: 10,
    PageNumber: 1,
    SortColumn: 'DateSubscribed',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };

  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'FirstName',
            displayName: 'First Name',
            width: '13%',
            //dataType: 'TextWithOtherColumn',
          //  OtherColumn: 'LastName'
          },
          {
            objectKey: 'LastName',
            displayName: 'Last Name',
            width: '12%',
           // dataType: 'TextWithOtherColumn',
           // OtherColumn: 'FirstName'
          }, {
            objectKey: 'ActiveStatus',
            displayName: 'Status',
            width: '6%'
          }, {
            objectKey: 'EmailAddress',
            displayName: 'Email',
            width: '20%'
          },
          //  {
          //   objectKey: 'CompanyName',
          //   displayName: 'Company',
          //   width: '15%'
          // },
           {
            objectKey: 'DateSubscribed',
            displayName: 'Date Created',
            dataType: 'Date',
            format: 'dd/MM/yyyy',
            timeZone: this.userDetail.TimeZone.toString(),
            width: '9%'
          },
          {
            objectKey: 'TradingName',
            displayName: 'Trading Name',
            dataType: 'TextWithSeparator',
            separator: ',',
            width: '18%'
          }, {
            objectKey: 'AccountNumber',
            displayName: 'Customer Number',
            dataType: 'TextWithSeparator',
            separator: ',',
            width: '10%'
          }, {
            objectKey: 'PendingApprovals',
            displayName: 'Pending Approvals',
            dataType: 'TextWithColor',
            Color: 'Red',
            Condition: 'contains',
            CompareWith: 'Pending',
            width: '10%'
          // }, {
          //   objectKey: 'PendingApprovals',
          //   displayName: 'Detail',
          //   dataType: 'LinkWithSpecialChar',
          //   SpecialChar: 'View',
          //   width: '10%'
          }
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
    this.isBuyerAccess = this.api.hasBuyerFullAccess;
    if (sessionStorage.getItem('grid_filter')) {
      this.bodyData = JSON.parse(sessionStorage.getItem('grid_filter'));
      if(this.bodyData.GridFilters != undefined)
      {
        if(this.bodyData.GridFilters.length>0){
          if(this.bodyData.GridFilters[0].FilterType == 'Global_Search'){
            if(this.bodyData.GridFilters[0].GridConditions.length > 0){
            (<HTMLInputElement>document.getElementById("globalSearch")).value = this.bodyData.GridFilters[0].GridConditions[0].ConditionValue.toString();
            }
          }
        }
      }

      this.bindUser(this.bodyData);
    }
    else {
      this.bindUser(this.bodyData);
    }    
  }

  private bindUser(bodyData) {
    console.log(bodyData);
    this.usermanagement.getUserList(bodyData).subscribe(x => {
      if(!!x){
        console.log(x);
        this.dataSource = x.Users;
        this.itemsCount = x.RecordsCount;
      }     
    },
      err => {
        console.log(err);
      });
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.bindUser(this.bodyData);
  }
  actionClick(event) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Edit':
        console.log(this.dataSource[event.rowIndex]);
        const EmailAddress = this.dataSource[event.rowIndex].EmailAddress;
        this.router.navigate(['/e-saleyard/edit-buyer', EmailAddress]);
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
        sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
        this.bindUser(this.bodyData);
        console.log(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        console.log(this.bodyData);
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
    console.log(event);
  }

  globalSearch(value) {
    this.pageNum = 1;
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
      this.ConditionOpt1 = item.ConditionOpt1;
      this.ConditionOpt2 = item.ConditionOpt2;
    }
  }
  removeFilter(txtGlobal) {
    this.filters = [];
    txtGlobal.value = '';
    this.pageNum = 1;
    this.generateFilter();
  }

  /* -------------------------Delete Single Record---------------------- */
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete Buyer Record',
      body: 'Are you sure you want to delete this record?',
      btnText:'Confirm Delete',
      checkboxText: 'Yes, delete this buyer',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete?', 'Delete Buyer Record', 'Confirm Delete', this.deleteConfirmation, true,
    // true, false, 'Yes, delete this buyer.');
  }
  deleteConfirmation(modelRef: NgbModalRef, Caller: UsersGridComponent) {
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
  //                  IsDefaultView: boolean, confirmationText: string) {
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

  openNewExportPopup(ExportType: string) {
    const users = this.dataSource.filter(x => x.selected === true).map(x => x.USERID).join(',');
    this.usermanagement.getColumns().subscribe(Result => {
      const modalRef = this.modalService.open(GridViewExportComponent, { backdrop: 'static' });
      const modalInstance: GridViewExportComponent = modalRef.componentInstance;
      modalInstance.ExportType = ExportType.toUpperCase();
      modalInstance.ExportPopup = modalRef;
      modalInstance.ExportUserData.SortColumn = this.bodyData.SortColumn;
      modalInstance.ExportUserData.SortOrder = this.bodyData.SortOrder;
      modalInstance.ExternalCall = {
        FromURL: true,
        GUID: 'Name',
        displayValue: 'DisplayName',
        DownloadFileURL: this.usermanagement.getEndPoint(ExportType)
      };
      modalInstance.ExportUserData.GridFilters = this.bodyData.GridFilters;
      modalInstance.ExportUserData.UserIds = users;
      modalInstance.ExportUserData.ProcessName = 'Users';
      modalInstance.setDmoList(Result);
    },
      err => {
        console.log(err);
      });
    // modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
  }

  /* -------------------------Change User Status (active/ inactive)---------------------- */
  openStatus() {
    const count = this.dataSource.filter(x => x.selected === true).length;
    if (count === 1) {
      this.msg.showMessage('Warning', {
        header: 'Change Buyer Status',
        body: 'Are you sure you want to change this status?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.ChangeStatus,
        caller: this,
      })
      // this.showErrorMessage('Are you sure you want to change this status?', 'Change Buyer Status', 'Yes', this.ChangeStatus, true,
      // false , true, '');
    } else if (count > 1) {
      this.msg.showMessage('Warning', {body: 'Please select only one record'});
      // this.showErrorMessage('Please select only one record', 'Warning !', 'Ok', null, false, false, true, '');
    } else  {
      this.msg.showMessage('Warning', {body: 'Please select at least one record'});
      // this.showErrorMessage('Please select at least one record', 'Warning !', 'Ok', null, false, false, true, '');
    }
  }
  ChangeStatus(modelRef: NgbModalRef, Caller: UsersGridComponent) {
    if(Caller.dataSource){
      Caller.dataSource.filter(x => x.selected === true).forEach(element => {
        const status = element.ActiveStatus === 'Active' ? 0 : 1;
        Caller.usermanagement.ChangeUserStatus(element.UserName, status).subscribe(
          result => {
            if (result.status === 'SUCCESS') {
              Caller.bindUser(Caller.bodyData);
            }
          });
      });
    }   
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
    
    let dateArray =  dateValue.split("/");
    let modifiedDateValue = dateArray[1].toString() + '/'+ dateArray[0].toString() +'/'+ dateArray[2].toString();
    var d = new Date(modifiedDateValue);
    var localOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() + localOffset);
  }
}

