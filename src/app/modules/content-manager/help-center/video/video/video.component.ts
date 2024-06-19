import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AddEditVideoComponent } from '../add-edit-video/add-edit-video.component';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { ContentManagerService } from '@app/core/services/content-manager.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Title } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { MessageService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';


@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  dataSource: any;
  itemsCount: number;
  filters: any = {};

  filterValue1: string = "";
  filterValue2: string = "";
  ConditionOpt1: string = "";
  ConditionOpt2: string = "";
  logicalOpt: string = "OR";
  TimeZone: string;
  dateFormat = '';
  FromDateobj: NgbDateStruct;
  ToDateobj: NgbDateStruct;

  bodyData = {
    AssetType: 'Video',
    PageSize: 10,
    PageNumber: 1,
    SortColumn: '-1',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };
  transactionId: string;
  pageNum = -1;
  VideoName: string;
  VideoURL: any;
  rowIndex: number;
  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'Name',
            displayName: 'Video Name',
            width: '15%'
          }, {
            objectKey: 'Description',
            displayName: 'Description',
            width: '30%'
          }, {
            objectKey: 'AddedBy',
            displayName: 'Added By',
            width: '15%'
          }, {
            objectKey: 'CreatedOn',
            displayName: 'Date Added',
            dataType: 'Date',
            format: environment.Setting.dateTimeFormatNoSeconds,
            timeZone: this.userDetail.TimeZone.toString(),
            width: '18%'
          },
          {
            objectKey: 'Status',
            displayName: 'Status',
            width: '10%'
          }, {
            objectKey: 'DataID',
            displayName: 'View',
            dataType: 'LinkWithSpecialChar',
            SpecialChar: 'View',
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
  isBuyerAccess: boolean = false;

  constructor(private contentManager: ContentManagerService,
    private columnFilter: ColumnFilterService,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private msg: MessageService,
    private userDetail: UserDetail
  ) {
    this.dateFormat = environment.Setting.dateFormat;
  }

  ngOnInit() {
    this.isBuyerAccess = this.contentManager.hasBuyerFullAccess;
    this.setDocTitle('Video');

    if( sessionStorage.getItem("storage_GridSearchConfig")){
      sessionStorage.removeItem("storage_GridSearchConfig");
    } 
    if (sessionStorage.getItem('video_grid_filter')) {
      this.bodyData = JSON.parse(sessionStorage.getItem('video_grid_filter'));
      if (this.bodyData.GridFilters != undefined) {
        if (this.bodyData.GridFilters.length > 0) {      
          if (this.bodyData.GridFilters[0].FilterType == 'Global_Search') {
            if (this.bodyData.GridFilters[0].GridConditions.length > 0) {
              (<HTMLInputElement>document.getElementById("globalSearch")).value = this.bodyData.GridFilters[0].GridConditions[0].ConditionValue.toString();
            }
          }
        }
      }
      this.LoadData(this.bodyData);
    }
    else {
      this.LoadData(this.bodyData);
    }
  }

  LoadData(bodyData) {
    // console.log(bodyData);
    this.contentManager.getContentManagerList(bodyData).subscribe(x => {
      this.dataSource = x.ContentManager;
      this.itemsCount = x.RecordsCount;
    },
      err => {
        console.log(err);
      });
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.LoadData(this.bodyData);
  }
  actionClick(event, modalId) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Edit':
       // console.log(this.dataSource[event.rowIndex]);
        this.openAddEditPopup(event.rowIndex);
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
        sessionStorage.setItem('video_grid_filter', JSON.stringify(this.bodyData));
        this.LoadData(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('video_grid_filter', JSON.stringify(this.bodyData));
       // console.log(this.bodyData);
        this.LoadData(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('video_grid_filter', JSON.stringify(this.bodyData));
        this.LoadData(this.bodyData);
        break;
      case 'Delete':
        this.openConfirmation(this.dataSource[event.rowIndex].DataID);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        sessionStorage.removeItem('video_grid_filter');
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'SpecialCharClick':
        this.rowIndex = event.rowIndex;
        this.VideoName = this.dataSource[event.rowIndex].Name;
        this.VideoURL = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://www.youtube.com/embed/' + this.dataSource[event.rowIndex].Document );
        // this.VideoURL = this.dataSource[event.rowIndex].Document;
        this.openModal(modalId);
        break;
    }
   // console.log(event);
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
    sessionStorage.removeItem('video_grid_filter');
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    sessionStorage.setItem('video_grid_filter', JSON.stringify(this.bodyData));
    this.LoadData(this.bodyData);
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
      header: 'Delete Video Record',
      body: 'Are you sure you want to delete this video?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this video',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete this video?', 'Delete Video Record', 'Confirm Delete',
    //  this.deleteConfirmation, true, false, true, 'Yes, delete this video.');
  }
  deleteConfirmation(modelRef: NgbModalRef, Caller: VideoComponent) {
    if (Caller.transactionId) {
      Caller.contentManager.deleteData(Caller.transactionId).subscribe(
        result => {
          if (result === true) {
            Caller.LoadData(Caller.bodyData);
            modelRef.close();
          }
        });
    } else {
      modelRef.close();
    }
  }
  /*------------------- Show Popup -------------------*/
  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsDelete: boolean, IsDefaultView: boolean,
  //                  IsConfirmation: boolean, confirmationText) {
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

  /*------------------- Open Popup -------------------*/
  openAddEditPopup(index) {
    if(index === null && this.isBuyerAccess === false)    {
      return false;
    }
    const modalRef = this.modalService.open(AddEditVideoComponent, { size: 'lg',backdrop:'static' });
    const modalInstance: AddEditVideoComponent = modalRef.componentInstance;
    if (index !== null) {
      const item = this.dataSource[index];
      modalInstance.addEditData.DataID = item.DataID;
      modalInstance.addEditData.Document = item.Document;
      modalInstance.addEditData.Name = item.Name;
      modalInstance.addEditData.Description = item.Description;
      modalInstance.addEditData.Status = item.Status;
      modalInstance.addEditVideo = 'Edit Video';
      modalInstance.isShowSave = this.isBuyerAccess === false ? false : true;
    }
    modalRef.result.then(Result => {
      if (Result) {
        this.LoadData(this.bodyData);
      }
    })
      .catch(error => error); // In case modal is dismissed when clicked on backdrop
   }
   openModal(id) {
    this.modalService.open(id, {ariaLabelledBy: 'modal-basic-title'});
  }

    /* -------------------------Change User Status (active/ inactive)---------------------- */
    openStatus() {
      const count = this.dataSource.filter(x => x.selected === true).length;
      if (count > 0) {
        this.msg.showMessage('Warning', {
          header: 'Change Video Status',
          body: 'Are you sure you want to change this status?',
          btnText: 'Yes',
          isConfirmation: true,
          callback: this.ChangeStatus,
          caller: this,
        })
        // this.showErrorMessage('Are you sure you want to change this status?', 'Change Video Status', 'Yes',
        // this.ChangeStatus, false, true, true, '');
      } else  {
        this.msg.showMessage('Warning', {body: 'Please select at least one record'});
        // this.showErrorMessage('Please select at least one record', 'Warning !', 'Ok', null, false, true, false, '');
      }
    }
    ChangeStatus(modelRef: NgbModalRef, Caller: VideoComponent) {
      const users = Caller.dataSource.filter(x => x.selected === true).map(x => x.DataID).join(',');
      Caller.contentManager.ChangeUserStatus(users).subscribe(
        result => {
          if (result) {
            Caller.LoadData(Caller.bodyData);
          }
        });
      modelRef.close();
    }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
  }
}
