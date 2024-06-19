import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { SearchService } from '@app/core/services/search.service';
import { ColumnFilterService } from '@app/core/services/column-filter.service';
import { IHeaderMap } from '@app/core/models/plasmaGridInterface';
import { environment } from '@env/environment';
import { GenericGirdService } from '@app/core/services/generic-gird.service';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GridViewExportComponent } from '@app/shared';
import { TableRowState } from '@app/core/models/table-row-state.model';

@Component({
  selector: 'app-bids',
  templateUrl: './bids.component.html',
  styleUrls: ['./bids.component.scss']
})
export class BidsComponent implements OnInit {
  @Input() transactionId: string;
  filters: any = {};
  dataSource: any;
  itemsCount: number;
  pageNum = -1;

  public rowState: TableRowState = {
    success: {property: 'BidStatus', values: ['Bid Won', 'Highest Bid']},
    fail: {property: '', values: []},
  };

  constructor(
    private search: SearchService,
    private columnFilter: ColumnFilterService,
    private router: Router,
    private gridservice:GenericGirdService,private modalService: NgbModal
  ) { 
    this.dateFormat = environment.Setting.dateFormat;
  }

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
    TransactionId: '',
    PageSize: 10,
    PageNumber: 0,
    SortColumn: '-1',
    SortOrder: 'desc',
    TimeZone: new Date().getTimezoneOffset(),
    GridFilters: []
  };

  HeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'BuyerName',
            displayName: 'Buyer Name',
            width: '15%',
            // dataType: 'TextWithOtherColumn',
            // OtherColumn: 'LastName'
          },  {
            objectKey: 'AccountNumber',
            displayName: 'Account Number',
            // dataType: 'TextWithSeparator',
            // separator: ',',
            width: '10%'
          },{
            objectKey: 'TradingName',
            displayName: 'Trading Name',
            // dataType: 'TextWithSeparator',
            // separator: ',',
            width: '15%'
          },{
            objectKey: 'State',
            displayName: 'State',
            width: '8%'
          }, {
            objectKey: 'BidStatus',
            displayName: 'Bid Status',
            width: '8%'
          // }, {
          //   objectKey: 'ActiveStatus',
          //   displayName: 'Bid Lost',
          //   width: '8%'
          },{
            objectKey: 'BidAmount',
            displayName: 'Bid Amount',
            dataType: 'Currency',
            // dataType: 'TextWithSeparator',
            // separator: ',',
            width: '10%'
          }, {
            objectKey: 'BidDate',
            displayName: 'Bid Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: new Date().getTimezoneOffset(),
            width: '10%'
          },{
            objectKey: 'BidDate',
            displayName: 'Bid Time',
            dataType: 'Date',
            format: 'hh:mm:ss a',
            timeZone: new Date().getTimezoneOffset(),
            width: '10%'
          }
        ],
        action: {
          Edit: false,
          Delete: false,
          Checkbox: false,
          Placement: 'IsExternalShow',
          DropDown: false
        },
        columnFilter: []
      },
      paging: true
    }
  };

  ngOnInit() {
    this.bodyData.TransactionId = this.transactionId;

    if (sessionStorage.getItem('faq_grid_filter')) {
      this.bodyData = JSON.parse(sessionStorage.getItem('faq_grid_filter'));
      if (this.bodyData.GridFilters != undefined) {
        if (this.bodyData.GridFilters.length > 0) {          
          if (this.bodyData.GridFilters[0].FilterType == 'Global_Search') {
            if (this.bodyData.GridFilters[0].GridConditions.length > 0) {
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
    // console.log(bodyData);
    this.search.getListingBidHistory(bodyData).subscribe((x: any) => {
      // console.log("x", x);
      this.dataSource = x.Data;
      this.itemsCount = x.RecordsCount;
    },
      err => {
        console.log(err);
      });
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
        sessionStorage.setItem('faq_grid_filter', JSON.stringify(this.bodyData));
        this.bindUser(this.bodyData);
        console.log(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('faq_grid_filter', JSON.stringify(this.bodyData));
        console.log(this.bodyData);
        this.bindUser(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        sessionStorage.setItem('faq_grid_filter', JSON.stringify(this.bodyData));
        this.bindUser(this.bodyData);
        break;
      case 'Delete':
        // this.openConfirmation(this.dataSource[event.rowIndex].UserName);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        sessionStorage.removeItem('faq_grid_filter');
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
        case 'Export Excel':
          this.openNewExportPopup('excel');
          break;
        case 'Export PDF':
          this.openNewExportPopup('pdf');
          break;
    }
    console.log(event);
  }


  private generateFilter() {
    sessionStorage.removeItem('faq_grid_filter');
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 0;
    this.bodyData.SortColumn = '-1';
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    sessionStorage.setItem('faq_grid_filter', JSON.stringify(this.bodyData));
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
    if (item.colData.dataType === 'Date' || item.colData.dataType === 'Currency') {
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
  removeFilter() {
    this.filters = [];
    this.pageNum = 1;
    this.generateFilter();
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage - 1;
    this.bodyData.PageSize = event.pageSize;
    this.bindUser(this.bodyData);
  }

  openNewExportPopup(ExportType: string) {
    const bids = this.dataSource.filter(x => x.selected === true).map(x => x.BidLogId).join(',');
    this.gridservice.getBidsColumns().subscribe(Result => {
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
        DownloadFileURL: this.gridservice.getEndPoint(ExportType)
      };
      modalInstance.ExportUserData.GridFilters = this.bodyData.GridFilters;
      modalInstance.ExportUserData.UserIds = bids;
      modalInstance.ExportUserData.ProcessName = 'BidsHistory';
      modalInstance.ExportUserData.TransactionID = this.transactionId;
      modalInstance.setDmoList(Result);
    },
      err => {
        console.log(err);
      });
    // modalInstance.ExportUserData.TransactionIDs = this.SelectedRecordIds.length > 0 ? this.SelectedRecordIds.join(',') : '';
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
    var d = new Date(dateValue);
    var localOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() + localOffset);    
  }
}
