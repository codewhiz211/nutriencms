import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AddEditBannerComponent } from '../add-edit-banner/add-edit-banner.component';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { MessageComponent } from '@app/shared/components/message/message.component';
import { ContentManagerService } from '@app/core/services/content-manager.service';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { Title } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { ApiESaleyardService, MessageService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  imageToShow: any;
  dataSource: any;
  itemsCount: number;
  activeItemsCount: number = 0;
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
    AssetType: 'Banner',
    PageSize: 10,
    PageNumber: 1,
    SortColumn: 'CreatedOn',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };
  transactionId: string;
  pageNum = -1;
  rowIndex: number;
  fileURL;
  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'Document',
            displayName: 'ID',
            width: '8%'
          },
          {
            objectKey: 'FileName',
            displayName: 'File Name',
            width: '25%'
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
            width: '20%'
          },
          {
            objectKey: 'Status',
            displayName: 'Status',
            width: '15%'
          }, {
            objectKey: 'DataID',
            displayName: 'View',
            dataType: 'LinkWithSpecialChar',
            SpecialChar: 'View',
            width: '15%'
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
  isBuyerAccess: boolean=false;

  constructor(
    private contentManager: ContentManagerService,
    private columnFilter: ColumnFilterService,
    private modalService: NgbModal,
    public sanitizer: DomSanitizer,
    private titleService: Title,
    private msg: MessageService,
    private userDetail: UserDetail,
    private api: ApiESaleyardService
  ) { 
    this.dateFormat = environment.Setting.dateFormat;
  }

  ngOnInit() {
    this.isBuyerAccess = this.api.hasBuyerFullAccess;
    this.setDocTitle('Banner');

    if( sessionStorage.getItem("storage_GridSearchConfig")){
      sessionStorage.removeItem("storage_GridSearchConfig");
    } 
    if (sessionStorage.getItem('banner_grid_filter')) {
      this.bodyData = JSON.parse(sessionStorage.getItem('banner_grid_filter'));
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

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  LoadData(bodyData) {    
    this.contentManager.getContentManagerList(bodyData).subscribe(x => {
      this.dataSource = x.ContentManager;
      //this.activeItemsCount = 0;
      if(x.ContentManager.length>0){
        this.activeItemsCount = x.ContentManager[0].ActiveCount;
      }
      this.dataSource.forEach(element => {
        // if (element.Status === 'Active')
        //   this.activeItemsCount++;
        if (element.files.length > 0) {
          element.FileName = element.files[0].FileName;
          element.FileID = element.files[0].FileID;
        }
      });

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
        this.bodyData.SortOrder = 'Asc';
        sessionStorage.setItem('banner_grid_filter', JSON.stringify(this.bodyData));
        this.LoadData(this.bodyData);
        console.log(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'Desc';
        sessionStorage.setItem('banner_grid_filter', JSON.stringify(this.bodyData));
        console.log(this.bodyData);
        this.LoadData(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('banner_grid_filter', JSON.stringify(this.bodyData));
        this.LoadData(this.bodyData);
        break;
      case 'Delete':
        this.openConfirmation(this.dataSource[event.rowIndex].DataID);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        sessionStorage.removeItem('banner_grid_filter');
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'SpecialCharClick':
        this.rowIndex = event.rowIndex;
        const fileData = {
          dataID: this.dataSource[event.rowIndex].DataID,
          fileID: this.dataSource[event.rowIndex].FileID
        };
        this.contentManager.getFile(fileData).subscribe(data => {
          this.createImageFromBlob(data);
          this.openModal(modalId);
        }, err => {
        });

        break;
    }
    console.log(event);
  }

  removeFilter(txtGlobal) {
    this.filters = [];
    txtGlobal.value = '';
    this.pageNum = 1;
    this.generateFilter();
  }

  globalSearch(value) {   
    if(sessionStorage.getItem('banner_grid_filter')){
      sessionStorage.removeItem('banner_grid_filter');
    }

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
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    sessionStorage.setItem('banner_grid_filter', JSON.stringify(this.bodyData));
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

  /* -------------------------Delete Single Record---------------------- */
  openConfirmation(id) {
    this.transactionId = id;
    this.msg.showMessage('Warning', {
      header: 'Delete Banner Record',
      body: 'Are you sure you want to delete this banner?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this banner',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to delete this banner?',
    //   'Delete Banner Record', 'Confirm Delete', this.deleteConfirmation, true, false, true, 'Yes, delete this banner.');
  }
  deleteConfirmation(modelRef: NgbModalRef, Caller: BannerComponent) {
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
  //                  IsConfirmation: boolean, confirmationText: string) {
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
    const modalRef = this.modalService.open(AddEditBannerComponent, { size: 'lg', backdrop: 'static' });
    const modalInstance: AddEditBannerComponent = modalRef.componentInstance;
    modalInstance.activeItemsCount = this.activeItemsCount;   
    if (index !== null) {
      const item = this.dataSource[index];
      modalInstance.addEditData.DataID = item.DataID;
      modalInstance.addEditData.Description = item.Description;
      modalInstance.addEditData.Status = item.Status;      
      modalInstance.fileName = item.files[0].FileName;
      modalInstance.fileId = item.files[0].FileID;
      modalInstance.prevItemStatus = item.Status;
      modalInstance.addEditBanner = 'Edit';
      modalInstance.isShowSave = this.isBuyerAccess === false ? false : true;
    } else {
      modalInstance.addEditBanner = 'Add';
    }
    if (this.activeItemsCount <= 5) {
      modalRef.result.then(Result => {
        if (Result) {
          this.LoadData(this.bodyData);
        }
      })
      .catch(error => error); // In case modal is dismissed when clicked on backdrop;
    }
  }

  openModal(id) {
    this.modalService.open(id, { ariaLabelledBy: 'modal-basic-title', windowClass: 'previewBanner', backdrop: 'static' });
  }

  /* -------------------------Change User Status (active/ inactive)---------------------- */
  openStatus() {  
    if(this.isBuyerAccess === false)    {
      return false;
    }  
    // const count = this.dataSource.filter(x => x.selected === true).length;
    const selectedActive = this.dataSource.filter(item => item.selected && item.Status === 'Active').length;
    const selectedInactive = this.dataSource.filter(item => item.selected && item.Status === 'Inactive').length;
    if (selectedInactive - selectedActive + this.activeItemsCount > 5) {
      this.msg.showMessage('Warning', {body: 'You cannot have more than 5 active banners.<br/> Please change the status of this banner to "Inactive" to save.'});
      // this.showErrorMessage('You cannot have more than 5 active banners.', 'Warning !', 'Ok', null, false, true, false, '');
      return;
    }
    if (selectedActive + selectedInactive > 0) {
      this.msg.showMessage('Warning', {
        header: 'Change Banner Status',
        body: 'Are you sure you want to change this status?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.ChangeStatus,
        caller: this,
      })
      // this.showErrorMessage('Are you sure you want to change this status?', 'Change Banner Status', 'Yes',
      //   this.ChangeStatus, false, true, true, '');
    } else {
      this.msg.showMessage('Warning', {body: 'Please select at least one record'});
      // this.showErrorMessage('Please select at least one record', 'Warning !', 'Ok', null, false, true, false, '');
    }
  }
  ChangeStatus(modelRef: NgbModalRef, Caller: BannerComponent) {
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
