import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { SalesFormViewModalComponent } from '../../components/sales-form-view-modal/sales-form-view-modal.component';
import { Title } from '@angular/platform-browser';
import { EContractService } from '@app/modules/crm/e-contracts/services/e-contract.service';
import { SalesService } from '../../services/sales.service';
import { MessageService, DmoControlService, ListviewService } from '@app/core/services';
import { GridViewExportComponent } from '@app/shared';

@Component({
  selector: 'app-sales-grid-view',
  templateUrl: './sales-grid-view.component.html',
  styleUrls: ['./sales-grid-view.component.scss']
})
export class SalesGridViewComponent implements OnInit {

  ProcessName = sessionStorage.getItem('AppName');
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private titleService: Title,
    private eservice: EContractService,
    private salesService: SalesService,
    private msg: MessageService,
    private dmoControlService: DmoControlService,
    private listviewService: ListviewService
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('DisplayName')) {
      if(sessionStorage.getItem('AppName') !== sessionStorage.getItem('processName')){
        sessionStorage.removeItem('gridsort');
      }
      const processtitle = sessionStorage.getItem('DisplayName');
      this.titleService.setTitle('Nutrien | ' + processtitle);
    }
    if (this.salesService.submitDataForCreateSale) {
      this.modalService.open(SalesFormViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
    }
  }

  openFormViewModal() {
    this.modalService.open(SalesFormViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
  }

  navigateDetailPage(obj: any) {
    if (obj.Column === 'Edit') {
      this.router.navigate(['/crm/sales', obj.Id]);
    } else {
      this.eservice.getTranscationId(obj.Id, 'LMKOpportunities', 'lmkopesecdmorecordid').subscribe(Result => {
        window.open('/crm/contract_view/'+encodeURIComponent(Result.TransctionId), '_blank');
      });
    }
  }

  copyRowRecord(ev) {
    this.msg.showMessage('Success',{body:'Are you sure you want to create duplicate sale?',btnText:'Confirm',header:'Create Duplicate Sale',isConfirmation:true}).result.then(Result=>{
     if(Result) {
       this.duplicateSale(ev.id);
     }
    });
  }
  duplicateSale(trnId: any) {
    this.dmoControlService.GetPlasmaId('DMOCRM_HeaderInf_SaleID').subscribe(res1 => {
      const body = {
        transactionID: trnId,
        saleId: res1.PlasmaID,
        saleReversalType: ''
      };
      this.salesService.createDuplicateSale(body).subscribe(res2 => {
        if (res2.status === 'success') {
          this.salesService.copyLots(trnId, res2.transactionID, '-1').subscribe(res3 => {
            this.modalService.dismissAll();
            this.router.navigate(['/crm/sales', res2.transactionID]);
          },
          (err)=> {
            if(err.status === 403 && err.error === 'No row') {
              this.router.navigate(['/crm/sales', res2.transactionID]);
            }
          });
        } else {
          this.modalService.dismissAll();
        }
      });
    });
  }
  exportPopup(ExportBody: any) {
    this.listviewService.dmoListOrderByDMO(this.ProcessName,'AdminView').subscribe(Result=>{
    const modalRef = this.modalService.open(GridViewExportComponent, { backdrop: 'static' });
    const modalInstance: GridViewExportComponent = modalRef.componentInstance;
    modalInstance.ExportType = ExportBody.ExportType.toUpperCase();
    modalInstance.ExportPopup = modalRef;
    modalInstance.ExportUserData.SortColumn = ExportBody.SortColumn;
    modalInstance.ExportUserData.SortOrder = ExportBody.SortOrder;
    modalInstance.ExportUserData.TransactionIDs =!!ExportBody.SelectedRecordIds? ExportBody.SelectedRecordIds.join(','): '';
    modalInstance.ExternalCall = {
      FromURL: true,
      GUID: 'GUID',
      displayValue: 'DisplayName',
      DownloadFileURL: this.eservice.getEndPoint(ExportBody.ExportType)
    };
    modalInstance.FileSetting = {
      FileName: 'Sale',
      IsChangeFileName: true
    };
    modalInstance.ExportUserData.GridFilters = ExportBody.GridFilters;
    modalInstance.ExportUserData.ProcessName = this.ProcessName;
    modalInstance.ExportUserData.columns = ExportBody.columns;
    modalInstance.ExportUserData.configFor = 'SALE';
    modalInstance.setDmoList(Result);
  },
    err => {
      console.log(err);
    });
  }
}
