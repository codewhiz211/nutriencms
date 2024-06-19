import { Component, OnInit } from '@angular/core';
import { AnnoucementService } from '@app/core/services/annoucement.service';
import { IHeaderMap } from '@app/core/models';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { NgbModal, NgbModalRef, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Location, DatePipe, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { GridViewExportComponent } from '../../grid-view-export/grid-view-export.component';
import { environment } from '@env/environment';
import { ApiESaleyardService, MessageService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  dataSource: any;
  pageNum: any;
  itemsCount: number;

  filterValue1 = '';
  filterValue2 = '';
  ConditionOpt1 = '';
  ConditionOpt2 = '';
  logicalOpt = 'OR';
  TimeZone: string;
  dateFormat = '';
  FromDateobj: NgbDateStruct;
  ToDateobj: NgbDateStruct;


  filters: any = {};
  bodyData = {
    PageSize: 10,
    PageNumber: 1,
    SortColumn: 'CreatedOn',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };
  transactionId: string;
  appRoleCheck = 0;

  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'Title',
            displayName: 'Title',
            width: '20%'
          }, {
            objectKey: 'Process',
            displayName: 'Process Type',
            width: '10%'
          }, {
            objectKey: 'StartOn',
            displayName: 'Start Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat, // 'MM/dd/yyyy',
            timeZone: this.userDetail.TimeZone.toString(),
            width: '10%'
          }, {
            objectKey: 'EndOn',
            displayName: 'End Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat, // 'MM/dd/yyyy',
            timeZone: this.userDetail.TimeZone.toString(),
            width: '10%'
          },
          {
            objectKey: 'IsExternalShow',
            displayName: 'Show to External User',
            width: '10%'
          }, {
            objectKey: 'IsInternalShow',
            displayName: 'Show to Internal User',
            width: '10%'
          }, {
            objectKey: 'Status',
            displayName: 'Status',
            width: '10%'
          }, {
            objectKey: 'CreatedOn',
            displayName: 'Date Created',
            dataType: 'Date',
            format: environment.Setting.dateFormat, // 'MM/dd/yyyy',
            timeZone: this.userDetail.TimeZone.toString(),
            width: '10%'
          }, {
            objectKey: 'CreatedBy',
            displayName: 'Created By',
            width: '10%'
          }
        ],
        action: {
          Edit: true,
          Delete: true,
          Checkbox: true
        },
        columnFilter: []
      },
      paging: true
    }
  };

  constructor(
    private msg: MessageService,
    private annoucement: AnnoucementService, 
    private columnFilter: ColumnFilterService, 
    private modalService: NgbModal,
    public location: Location,
    private router: Router,
    private titleService: Title,
    private userDetail: UserDetail,
    private datePipe: DatePipe) {
      this.dateFormat = environment.Setting.dateFormat;
    }

  ngOnInit() {
    const url = (this.router.url).split('/');
    if (url[1] === 'announcement') {
      this.annoucement.checkAppRole('Announcement').subscribe(data => {
        this.appRoleCheck = data;
        if(this.appRoleCheck > 0){
          this.setDocTitle('Announcement');
          if (sessionStorage.getItem('grid_filter')) {
            this.bodyData = JSON.parse(sessionStorage.getItem('grid_filter'));
            if (this.bodyData.GridFilters != null && this.bodyData.GridFilters.length > 0) {
              this.bodyData.GridFilters.forEach(item => {
                if (item.FilterType === 'Global_Search') {
                  document.getElementById('globalSearch').setAttribute('value', item.GridConditions[0].ConditionValue);
                  this.filters['Global_Search~$~dmoName'] = item;
                } else {
                  this.filters['Column_Filter~$~' + item.DataField] = item;
                }
              });
            }
            this.bindAnnoucement(this.bodyData);
          } else {
            this.bindAnnoucement(this.bodyData);
          }
        }
      })
    }

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


  bindAnnoucement(bodyData) {
    this.annoucement.getAnnouncemnetList(bodyData).subscribe(x => {
      this.dataSource = x.Data;
      this.itemsCount = x.TotalCount;
    },
      err => {
        console.log(err);
      });
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.bindAnnoucement(this.bodyData);
  }

  actionClick(event) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Edit':
        console.log(this.dataSource[event.rowIndex]);
        const Aid = this.dataSource[event.rowIndex].AnnouncementID;
        this.router.navigate(['/process_control/announcement/add_new', Aid]);
        break;
      case 'Filter_Click':
        if (!this.validate(event)) {
          break;
        } else {
            const filter: any = {
              GridConditions: [],
              DataField: event.colData.objectKey,
              LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
              FilterType: 'Column_Filter'
            };

            if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
              if (event.colData.dataType === 'Date') {
                const modifiedDateValue1 = this.ChangeFilterDateFormat(event.filterData.filterValue1);
                filter.GridConditions.push({
                  Condition: event.filterData.ConditionOpt1.Value,
                  ConditionValue: this.datePipe.transform(modifiedDateValue1, 'yyyy-MM-dd'),
                  dataType: 'Date'
                });
              } else {
                filter.GridConditions.push({
                  Condition: event.filterData.ConditionOpt1.Value,
                  ConditionValue: event.filterData.filterValue1,
                });
              }
            }

            if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
              if (event.colData.dataType === 'Date') {
                const modifiedDateValue2 = this.ChangeFilterDateFormat(event.filterData.filterValue2);
                filter.GridConditions.push({
                  Condition: event.filterData.ConditionOpt2.Value,
                  ConditionValue: this.datePipe.transform(modifiedDateValue2, 'yyyy-MM-dd'),
                  dataType: 'Date'
                });
              } else {
                filter.GridConditions.push({
                  Condition: event.filterData.ConditionOpt2.Value,
                  ConditionValue: event.filterData.filterValue2
                });
              }
            }
            this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
            this.bodyData.GridFilters = [];
            Object.keys(this.filters).forEach(key => {
              this.bodyData.GridFilters.push(this.filters[key]);
            });

            sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
            this.bindAnnoucement(this.bodyData);
            event.ColumnFilterDropdown.close();
            break;
      }
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
        this.bindAnnoucement(this.bodyData);
        event.ColumnFilterDropdown.close();
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
        this.bindAnnoucement(this.bodyData);
        event.ColumnFilterDropdown.close();
        break;
      case 'Delete':
        this.openConfirmation(this.dataSource[event.rowIndex].AnnouncementID);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
    }
  }

  private generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    sessionStorage.setItem('grid_filter', JSON.stringify(this.bodyData));
    this.bindAnnoucement(this.bodyData);
  }

  removeFilter(txtGlobal) {
    this.filters = [];
    txtGlobal.value = '';
    this.pageNum = 1;
    this.generateFilter();
  }

  openNewExportPopup(ExportType: any) {
    const users = this.dataSource.filter(x => x.selected === true).map(x => x.USERID).join(',');
    this.annoucement.getColumns().subscribe(Result => {
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
        DownloadFileURL: this.annoucement.getEndPoint(ExportType)
      };
      modalInstance.ExportUserData.GridFilters = this.bodyData.GridFilters;
      modalInstance.ExportUserData.UserIds = users;
      modalInstance.ExportUserData.ProcessName = 'announcement';
      modalInstance.setDmoList(Result);
    },
      err => {
        console.log(err);
      });
    // modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
  }
  validate(event): boolean {
    if (event.filterData.ConditionOpt1 && (event.filterData.ConditionOpt1.Value === '' || event.filterData.ConditionOpt1.Value === 'Select...')) {
      return false;
    } else if (event.filterData.filterValue1 == null || event.filterData.filterValue1 === '') {
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

  /* -------------------------Delete Single Record---------------------- */
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete Announcement',
      body: 'Are you sure you want to delete the announcement?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this announcement',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete?', 'Delete Announcement', 'Confirm Delete', this.deleteConfirmation,
    // true, false, true, 'Yes, delete this announcement.');
  }
  deleteConfirmation(modelRef: NgbModalRef, Caller: ListComponent) {
    if (Caller.transactionId) {
      Caller.annoucement.deleteData(Caller.transactionId).subscribe(
        result => {
          if (result === true) {
            Caller.bindAnnoucement(Caller.bodyData);
            modelRef.close();
          }
        });
    } else {
      modelRef.close();
    }
  }

  go_back() {
    this.router.navigate(['/app_list']);
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }

  ChangeFilterDateFormat(dateValue){    
    //let dateArray =  dateValue.split("/");
    //let modifiedDateValue = dateArray[1].toString() + '/'+ dateArray[2].toString() +'/'+ dateArray[0].toString();
    var d = new Date(dateValue);
    var localOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - localOffset);
  }
}
