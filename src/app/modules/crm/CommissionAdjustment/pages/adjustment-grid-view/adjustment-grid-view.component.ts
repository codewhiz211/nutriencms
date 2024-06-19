import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdjustmentFormViewModalComponent } from '../../components/adjustment-form-view-modal/adjustment-form-view-modal.component';
import { Subject } from "rxjs";
import { Router } from '@angular/router';

@Component({
  selector: 'app-adjustment-grid-view',
  templateUrl: './adjustment-grid-view.component.html',
  styleUrls: ['./adjustment-grid-view.component.scss']
})
export class AdjustmentGridViewComponent implements OnInit {

  ProcessName = sessionStorage.getItem('AppName');
  resetFormSubject: Subject<boolean> = new Subject<boolean>();
  constructor(private modalService: NgbModal,
              private router: Router) { }

  ngOnInit() {
  }
  openFormViewModal() {
    this.modalService.open(AdjustmentFormViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false }).result.then(result => {
      if (result) {
        this.resetFormSubject.next(true);
      }
    });
  }
  navigateDetailPage(event) {
    this.router.navigate([`/crm/adjustment-detail`, event.Id]);
  }
  copyRowRecord(event){
    const modalRef = this.modalService.open(AdjustmentFormViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
    const modalInstance: AdjustmentFormViewModalComponent = modalRef.componentInstance;
    modalInstance.transactionId = event.id;
    modalInstance.isCopy = true;
    modalRef.result.then(async (result) => {
      if (result) {
        this.resetFormSubject.next(true);
      }
    }, (reason) => {
    });

  }
}
