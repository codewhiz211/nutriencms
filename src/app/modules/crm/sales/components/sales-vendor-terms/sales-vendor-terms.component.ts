import { Component, OnInit, Output, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { ActivatedRoute } from '@angular/router';
import { SalesService } from '../../services/sales.service';
import { NgbModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '@app/shared';
import { NgbDateFRParserFormatter, MessageService, SaleStage } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-sales-vendor-terms',
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}],
  templateUrl: './sales-vendor-terms.component.html',
  styleUrls: ['./sales-vendor-terms.component.scss']
})
export class SalesVendorTermsComponent implements OnInit {

  @Input() stage: SaleStage;
  @Input() CompCode: string;
  @Input() CondCompCode: string;  
  transactionId: string;
  filters: any = {};
  dataSource: any;
  itemsCount: number;
  pageNum = -1;
  datemodel;
  isBulkUpdate:boolean=false;
  errorMessage='';
  constructor(
    private saleServices: SalesService,
    private columnFilter: ColumnFilterService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private msg: MessageService,
    private userDetail: UserDetail) { }

  bodyData = {
    ProcessName: '',
    PageSize: 10,
    PageNumber: '0',
    SortColumn: '-1',
    SortOrder: '-1',
    TimeZone: '-330',
    ParentTransactionID: '',
    ColumnList: '',
    GridFilters: [

    ],
    ViewName: ''
  };
  bodyDataVendor = {
    SaleTransactionID:'',
    VendorTermsTranId: '-1',
    DueDate: '-1'
  };

  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'VendorId',
            displayName: 'Vendor ID',
            width: '25%'
          }, {
            objectKey: 'VendorName',
            displayName: 'Vendor Name',
            width: '25%'
          }, {
            objectKey: 'Terms',
            displayName: ' Vendor Terms',
            width: '25%'
          }, {
            objectKey: 'DueDate',
            displayName: 'Due Date',
            width: '25%',
            dataType: 'Date',
            format: 'dd/MM/yyyy',
            timeZone: this.userDetail.TimeZone.toString()
          }
        ],
        action: {
          Edit: false,
          Delete: false,
          Checkbox: true,
          Placement: '',
          DropDown: false
        },
        columnFilter: []
      },
      paging: true
    }
  };

  ngOnInit() {
   /* this.saleServices.vendor.subscribe(x => {
      this.bodyData.ParentTransactionID = x;
      this.bind(this.bodyData);
    });
    this.bodyData.ParentTransactionID = this.route.snapshot.params.id;
    this.transactionId = this.route.snapshot.params.id;
    this.bind(this.bodyData);*/
  }
  reloadData() {
    this.saleServices.vendor.subscribe(x => {
      this.bodyData.ParentTransactionID = x;
      this.bind(this.bodyData);
    });
    this.bodyData.ParentTransactionID = this.route.snapshot.params.id;
    this.transactionId = this.route.snapshot.params.id;
    this.bind(this.bodyData);
  }
  private bind(bodyData) {
    this.saleServices.GridVendorTermsData(bodyData).subscribe(x => {
      this.dataSource = x.Data;
      this.itemsCount = x.RecordsCount;
    },
      err => {
        console.log(err);
      });
  }

  pageChange(event) {
    this.bodyData.PageNumber = (event.currentPage == 0 ? 0 : parseInt(event.currentPage) -1).toString();
    this.bodyData.PageSize = event.pageSize;
    this.bind(this.bodyData);
  }
  actionClick(event) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Edit':
        console.log(this.dataSource[event.rowIndex]);
        const EmailAddress = this.dataSource[event.rowIndex].EmailAddress;
        // this.router.navigate(['/e-saleyard/edit-buyer', EmailAddress]);
        break;
      case 'Filter_Click':
        if (!this.validate(event)) {
          break;
        }
        this.bodyData.PageNumber = '0';
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
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: this.datePipe.transform(event.filterData.filterValue1, 'MM/dd/yyyy')
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: event.filterData.filterValue1
            });
          }
        }
        if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
          if (event.colData.dataType === 'Date') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: this.datePipe.transform(event.filterData.filterValue2, 'MM/dd/yyyy')
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: event.filterData.filterValue2
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
        this.bind(this.bodyData);
        console.log(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        console.log(this.bodyData);
        this.bind(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.bind(this.bodyData);
        break;
      case 'Delete':
       // this.openConfirmation(this.dataSource[event.rowIndex].UserName);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
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
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = '0';
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    this.bind(this.bodyData);
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
    this.generateFilter();
  }
  openBulkUpdate(bulkUpdate) {
    this.modalService.open(bulkUpdate, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false });
  }
  updateDueDate() {
    const VendorTerms = this.dataSource.filter(x => x.selected === true);
    const VendorTermsTranId = VendorTerms.map(x => x.VId).join(',');
    if (VendorTermsTranId.length <= 0) {
      this.msg.showMessage('Warning', {
        header: 'Update Vendor Terms',
        body: 'Please select at least one vendor terms',
      })
      // this.showErrorMessage('please select atleast one vendor terms.',
      //   'Update Vendor Terms', 'Confirm Update', null, false, false, false, '');
      this.modalService.dismissAll();
    } else {
      if (this.datemodel != '' && this.datemodel != null && this.datemodel != undefined) {
        this.bodyDataVendor.DueDate = this.datemodel.month + '/' + this.datemodel.day + '/' + this.datemodel.year;

        if (this.saleServices.isFutureDate(this.saleServices.SaleDate, this.bodyDataVendor.DueDate)) {
          this.bodyDataVendor.SaleTransactionID = this.route.snapshot.params.id;
          this.bodyDataVendor.VendorTermsTranId = VendorTermsTranId;

          this.saleServices.UpdateVendorTerms(this.bodyDataVendor).subscribe(x => {
            this.bind(this.bodyData);
            this.datemodel = '';
            this.errorMessage = '';
            this.modalService.dismissAll();
          });
        } else {
          this.msg.showMessage('Fail', {body: 'Payment date cannot be in the past'});
          // this.showErrorMessage('Payment date cannot be in the past ',
          //   'Error', 'Ok', null, false, false, false, '');
        }
      } else {
        this.errorMessage = 'Please Input Valid Date.';
      }
    }
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
  isDate(date: any) {
    if (date !== undefined && date !== null && date !== '') {
      let DueDate = `${date.month}/${date.day}/${date.year}`;
      const regex = "(0?[1-9]|1[012])/(0?[1-9]|[12][0-9]|3[01])/((19|20)\\d\\d)";
      if (DueDate.match(regex)) return true; else return false;
    }
  }

  ValidateDueDate(date: any) {
    const duedate = this.isDate(date);
    if (duedate == false) {
      this.errorMessage = 'Please input valid date.';
    }
    else
      this.errorMessage = '';
  }
  isSelected() {
    const VendorTerms = this.dataSource.filter(x => x.selected === true);
    if (VendorTerms.length > 0 && SaleStage.Finalised !== this.stage)
      return true;
    else
      return false;
  }
 
  get hasFilter() {
    return Object.keys(this.filters).length > 0 ? true : false;
  }
  IsCondutingBranchUser() {
    return this.saleServices.IsAllowForCondutingBranch(this.CompCode, this.CondCompCode);
  }
}
