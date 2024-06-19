import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleStage, ApiESaleyardService, IHeaderMap, ColumnFilterService, MessageService } from '@app/core';

import { BillingDocumentLogModalComponent } from '../billing-document-log-modal/billing-document-log-modal.component';
import { SalesService } from '../../services/sales.service';
import printJS from 'print-js'

@Component({
  selector: 'app-sales-documents',
  templateUrl: './sales-documents.component.html',
  styleUrls: ['./sales-documents.component.scss']
})
export class SalesDocumentsComponent implements OnChanges {

  @Input() stage: SaleStage;
  @Input() transactionId: string;

  reportColumns = ['Frequently Used', 'Additional Documents', 'Reports'];
  reportsData: any;
  iterateArray = [];

  documentsData: any = [];
  documentBodyData = {
    SaleTransactionID: '',
    PageSize: 10,
    PageNumber: 0,
    SortColumn: '-1',
    SortOrder: 'desc',
    TimeZone: 0,
    GridFilters: []
  };
  documentsCount = 0;
  documentHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'DocumentNumber',
            displayName: 'Document Number',
            dataType: 'Link'
          }, {
            objectKey: 'DocumentType',
            displayName: 'Document Type'
          }, {
            objectKey: 'CustomerType',
            displayName: 'Customer Type'
          }, {
            objectKey: 'CustomerID',
            displayName: 'Customer ID'
          }, {
            objectKey: 'CustomerName',
            displayName: 'Customer Name'
          }, {
            objectKey: 'DeliveryMode',
            displayName: 'Delivery Mode'
          }
        ],
        action: {
          Checkbox: true
        },
        columnFilter: []
      },
      paging: true
    }
  };

  filters: any = {};

  constructor(
    private api: ApiESaleyardService,
    private columnFilter: ColumnFilterService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private msg: MessageService,
    private saleService: SalesService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    
  }
  reloadData(){
    this.getCRMReports();
    this.getDocumentsData();
  }
  getCRMReports() {
    let stage = '';
    if (this.stage === SaleStage.Inprocess) {
      stage = 'InProcess';
    } else if (this.stage === SaleStage.Invoiced) {
      stage = 'Invoiced';
    } else if (this.stage === SaleStage.Finalised) {
      stage = 'Finalised';
    } else if (this.stage === SaleStage.ReversalProcess) {
      stage = 'DraftReversalInstance';
    } else if (this.stage === SaleStage.ReversalCompleted) {
      stage = 'ReversedSale';
    }
    this.api.post(`report/getCRMReports?saleTransactionID=${this.transactionId}&stage=${stage}`).subscribe(res => {
      if(this.saleService.IsConductingBranchSaleProcessor == false){
        const indexCompletion = res.findIndex(x => x.Name == 'CompletionReport');
        res.splice(indexCompletion, 1);
      }
      const amended = res.find(x => x.Amended === true);
      this.reportsData = _.groupBy(res, 'Type');
      if (amended && this.reportsData && this.stage === SaleStage.Finalised) {
        this.reportsData['Frequently Used'].push({
          ID: 0,
          Title: "Tax Invoice - Amended",
          Name: "TaxInvoice",
          Stage: "Finalised",
          Type: "Frequently Used",
          Amended: true
        });
    
      }
      if (amended) {
        const TaxInv = this.reportsData['Frequently Used'].find(x => x.Title == 'Tax Invoice');
        const TaxInvIndex = this.reportsData['Frequently Used'].findIndex(x => x.Title == 'Tax Invoice');

        if (TaxInvIndex > -1) {
          this.reportsData['Frequently Used'].splice(TaxInvIndex, 1);
        }

        const TaxInvAmd = this.reportsData['Frequently Used'].find(x => x.Title == 'Tax Invoice - Amended' || x.Title == 'Tax Invoice - Amended - Draft');
        const TaxInvAmdIndex = this.reportsData['Frequently Used'].findIndex(x => x.Title == 'Tax Invoice - Amended' || x.Title == 'Tax Invoice - Amended - Draft');

        if (TaxInvAmdIndex > -1) {
          this.reportsData['Frequently Used'].splice(TaxInvAmdIndex, 1);
          this.reportsData['Frequently Used'] = this.insert(this.reportsData['Frequently Used'], 0, TaxInvAmd);
        }
        if (TaxInvIndex > -1) {
          const lnth = this.reportsData['Frequently Used'].length;
          this.reportsData['Frequently Used'] = this.insert(this.reportsData['Frequently Used'], lnth, TaxInv);
        }
       
      }
      const TaxInvNew = this.reportsData['Frequently Used'].find(x => x.Name == 'TaxInvoiceNew');
      if (TaxInvNew) {
        TaxInvNew.Name = 'TaxInvoice';
        TaxInvNew.NewBuyer = true
      }
      const arr: any[] = Object.values(this.reportsData);
      this.iterateArray = _.maxBy(arr, _.size);
   
    });
  }

  insert(arr, index, newItem){
    return [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index)
    ]
  }
  runReport(data: any) {
    let stage = '';
    switch (this.stage) {
      case SaleStage.Inprocess:
        stage = 'InProcess';
        break;
      case SaleStage.Invoiced:
        stage = 'Invoiced';
        break;
      case SaleStage.Finalised:
        stage = 'Finalised';
        break;
      case SaleStage.ReversalProcess:
        stage = 'DraftReversalInstance';
        break;
      case SaleStage.ReversalCompleted:
        stage = 'ReversedSale';
        break;
    }
    if (data && !data.IsSent && data.Name === 'VendorPriceAdvice') {

      let msgBody = 'Do you want to send the "Interim Vendor Price Advice" ?';
      if (stage === 'Finalised') {
        msgBody = 'Do you want to send the "Final Vendor Price Advice" ?';
      }
      this.msg.showMessage('Success', { body: msgBody, btnText: 'Yes', cancelBtnText: 'No', header: ' ', cancelBtn: true, isConfirmation: true })
        .result
        .then(result => {
          if (result) {
            this.api.post(`report/sendVendorPriceAdvice?saleTransactionID=${this.transactionId}&stage=${stage}`).subscribe(res => {
              this.getCRMReports();
              this.getDocumentsData();
              this.DownloadReport(data, stage);
            });
          } else if(result === false) { // check false if user does not want to do any think then click on X button. and it will return null value
            this.DownloadReport(data, stage);
          }
        });
    } else {
      this.DownloadReport(data, stage);
    }
  }

  DownloadReport(data: any, stage: string) {
    let reportURL = `report/runReport?SaleTransactionID=${this.transactionId}&ReportName=${data.Name}&Stage=${stage}`;
    if ((data.ID === 0 && data.Amended === true) || (stage==='Invoiced' && data.Amended === true)) {
      reportURL = reportURL + '&Amended=true';
    }
    if(data.NewBuyer){
      reportURL = reportURL + '&NewBuyer=true';
    }
    this.api.postGetFile(reportURL, null, 'Blob')
      .subscribe((res: Blob) => {
        if (res.type === 'application/pdf') {
          const fileURL = URL.createObjectURL(res);
          window.open(fileURL, '_blank');
        } else {
          this.toastr.warning('There is no data for this report.');
        }
      }, err => {
        console.log(err);
      });
  }

  get hasFilter() {
    return Object.keys(this.filters).length > 0 ? true : false;
  }

  getDocumentsData() {
    this.documentBodyData.SaleTransactionID = this.transactionId;
    this.api.post('report/getBillingDocuments', this.documentBodyData).subscribe(res => {
      this.documentsData = res.Data;
      this.documentsCount = res.RecordsCount;
    });
  }

  pageChange(event) {
    this.documentBodyData.PageNumber = event.currentPage - 1;
    this.documentBodyData.PageSize = event.pageSize;
    this.getDocumentsData();
  }

  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
    } else {
      this.documentHeaderMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }

  private generateFilter() {
    this.documentBodyData.GridFilters = [];
    this.documentBodyData.PageNumber = 0;
    this.documentBodyData.SortColumn = '-1';
    Object.keys(this.filters).forEach(key => {
      this.documentBodyData.GridFilters.push(this.filters[key]);
    });
    this.getDocumentsData();
  }

  actionClick(event) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        this.documentBodyData.PageNumber = 0;
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
        this.documentBodyData.SortColumn = event.colData.objectKey;
        this.documentBodyData.SortOrder = 'asc';
        this.getDocumentsData();
        break;
      case 'desc':
        this.documentBodyData.SortColumn = event.colData.objectKey;
        this.documentBodyData.SortOrder = 'desc';
        this.getDocumentsData();
        break;
      case 'Remove Sort':
        this.documentBodyData.SortColumn = '-1';
        this.documentBodyData.SortOrder = 'desc';
        this.getDocumentsData();
        break;
      case 'Delete':
        // this.openConfirmation(this.dataSource[event.rowIndex].UserName);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'Link':
        this.api.postGetFile(`report/downloadBillingDocument?SaleTransactionID=${this.transactionId}&documentNumber=${this.documentsData[event.rowIndex].DocumentNumberEncrypted}&Stage=${this.stage}`, null, 'Blob')
          .subscribe((res: Blob) => {
            if (res.type === 'application/pdf') {
              const fileURL = URL.createObjectURL(res);
              window.open(fileURL, '_blank');
            } else {
              this.toastr.warning('There is no data for this report.');
            }
          }, err => {
            console.log(err);
          });
        break;
    }
  }

  openDocumentsLogModal() {
    const selectedDocs: any[] = this.documentsData.filter(item => item.selected);
    if (selectedDocs.length === 0) {
      this.msg.showMessage('Warning', { body: 'At least one document needs to be selected.', header: ' ' });
      return;
    }

    const modalRef = this.modalService.open(BillingDocumentLogModalComponent, { size: 'xl' });
    const modalInstance: BillingDocumentLogModalComponent = modalRef.componentInstance;
    modalInstance.bodyData.DocumentNumbers = selectedDocs.map(item => item.DocumentNumberEncrypted).join();
  }
  resendDoc() {
    const selectedDoc = this.documentsData.filter(x => x.selected === true);
    if (selectedDoc && selectedDoc.length > 0) {
      this.msg.showMessage('Success', { body: 'Are you sure you want to resend?', btnText: 'Yes', isConfirmation: true, header: ' ' }).result.then(result => {
        if (result) {
          this.api.post(`report/resendBillingDocuments?documentNumbers=${selectedDoc.map(x => x.DocumentNumberEncrypted).join(',')}&stage=${this.stage}`).subscribe(res => {
            this.toastr.success('The selected document(s) have been re-sent.');
            this.documentsData.map(x => x.selected = false);

            if(res) printJS({ printable: res, type: 'pdf', base64: true });
          });
        }
      })
    } else {
      this.msg.showMessage('Warning', { body: 'At least one document needs to be selected.', header: ' ' });
    }
  }
  reviewDoc() {
    const selectedDoc = this.documentsData.filter(x => x.selected === true);
    if (selectedDoc && selectedDoc.length > 0) {
      this.api.postGetFile(`report/reviewBillingDocuments?documentNumbers=${selectedDoc.map(x => x.DocumentNumberEncrypted).join(',')}&stage=${this.stage}`, null, 'Blob')
        .subscribe((res: Blob) => {
          if (res.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(res);
            window.open(fileURL, '_blank');
          } else {
            this.toastr.warning('There is no data for this report.');
          }
        }, err => {
          console.log(err);
        });
    } else {
      this.msg.showMessage('Warning', { body: 'At least one document needs to be selected.', header: ' ' });
    }
  }

  removeFilter() {
    this.filters = {};
    this.generateFilter();
  }
}
