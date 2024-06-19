import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ApiESaleyardService, SaleStage } from '@app/core';
import { MessageComponent } from '@app/shared';
import { UserDetail } from '@app/core/models/user-detail';
import { SalesService } from '../../services/sales.service';

@Component({
  selector: 'app-sales-fees-charges',
  templateUrl: './sales-fees-charges.component.html',
  styleUrls: ['./sales-fees-charges.component.scss']
})
export class SalesFeesChargesComponent implements OnInit {

  @Input() stage: SaleStage;
  @Input() saleProcessorId: any;
  headerMap = [
    {
      objectKey: 'FeeDescription',
      displayName: 'Fees / Charges'
    },
    {
      objectKey: 'CalculationType',
      displayName: 'Basis'
    },
    {
      objectKey: 'Amount',
      displayName: 'Amount'
    },
    {
      objectKey: 'GST',
      displayName: 'GST'
    },
    {
      objectKey: 'AmountInclGST',
      displayName: 'Amount (incl. GST)'
    }
  ];


  dataSource: any;
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions: number[] = [10, 20, 30, 40, 50, 100];
  itemsCount = 0;

  selectedAll = false;

  saleId: string;
  deleteButtonVis: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiESaleyardService,
    private modalService: NgbModal,
    private userDetail: UserDetail,
    private saleServices: SalesService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.saleId = params.get('id');
    //  this.getFeesChargesData();
    });
  }

  getFeesChargesData() {
    this.checkSaleProcessorSaleHeader();
    this.api.post(`crmsales/getSaleFeesCharges?transactionID=${this.saleId}`).subscribe(data => {
      this.dataSource = data;
      this.itemsCount = this.dataSource.Items.length;
    });
  }

  deleteSaleFeesCharges() {
    // Set modal popup configuration
    const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    modalInstance.MessagePopup = modalMsgRef;
    modalInstance.IsConfirmation = true;
    modalInstance.Caller = this;
    modalInstance.ConfirmationText = 'Yes, delete these records.';
    modalInstance.IsDelete = true;
    modalInstance.IsConfirmation = true;
    modalInstance.MessageHeader = 'Delete Sale Fees & Charges Records';
    modalInstance.Message = 'Are you sure you want to delete these?';
    modalInstance.ButtonText = 'Confirm Delete';
    modalInstance.CallBackMethod = this.deleteSelectedConfirmation;
  }

  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: SalesFeesChargesComponent) {
    const body: any = {
      TransactionID: Caller.saleId,
      Items: []
    };
    for (const item of Caller.dataSource.Items) {
      if (item.selected) {
        body.Items.push({
          FeeCode: item.FeeCode,
          CalculationType: item.CalculationType
        });
      }
    }

    Caller.api.post('crmsales/deleteSaleFeesCharges', body).subscribe(data => {
      Caller.currentPage = 1;
      Caller.getFeesChargesData();
    });
  }

  isHaveSelectedItems() {
    if(this.stage === SaleStage.Finalised){
      return false;
    }
    for (const item of this.pageData) {
      if (item.selected) {
        return true;
      }
    }
    return false;
  }

  selectAllItems() {
    if (this.selectedAll) {
      for (const i of this.pageData) {
        i.selected = true;
      }
    } else {
      for (const i of this.pageData) {
        i.selected = false;
      }
    }

  }
  checkIfAllSelected() {
    this.selectedAll = this.pageData.every(chkItem => {
      return chkItem.selected === true;
    });
  }

  // for table pagination
  get pageData() {
    return this.dataSource ? this.dataSource.Items.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize) : [];
  }


  get first(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get last(): number {
    if (this.currentPage * this.pageSize > this.itemsCount) {
      return this.itemsCount;
    } else {
      return this.currentPage * this.pageSize;
    }
  }

  get totalPage(): number {
    return Math.ceil(this.itemsCount / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPage) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
    } else {
      this.currentPage = this.totalPage;
    }
  }

  goToPage(pageselected: number) {
    if (pageselected <= this.totalPage) {
      this.currentPage = parseInt(pageselected.toString());
    }
  }

  pageSizeChange(item) {
    this.pageSize = item;
    this.currentPage = 1;
  }
  checkSaleProcessorSaleHeader(){
    // let currentLoginUser = this.userDetail.UserID;
    // console.log(currentLoginUser , this.saleProcessorId)
    // if(currentLoginUser !== this.saleProcessorId){
    //   return this.deleteButtonVis = false;
    // }
    // else{
    //   return this.deleteButtonVis = true;
    // }
    this.deleteButtonVis = this.saleServices.IsConductingBranchSaleProcessor;
  }

}
