import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { GridViewComponent } from '@app/shared';
import { LMService } from '@app/core/services/lm.service';

@Component({
  selector: 'app-process-control',
  templateUrl: './process-control.component.html',
  styleUrls: ['./process-control.component.scss']
})
export class ProcessControlComponent implements OnInit {

  @ViewChild('detailViewModal') detailViewModal: ElementRef;
  @ViewChild(GridViewComponent) gridCaller: GridViewComponent;
  ProcessName = sessionStorage.getItem('AppName');
  HideDeleteIcon = false;
  transactionId: string;
  processUrlName: string;
  detailPageLink: string;

  constructor(
    private modalService: NgbModal,
    private location: Location,
    private lm: LMService
  ) { }

  ngOnInit() {
    if (this.ProcessName === 'LMKLivestockLots') {
      this.HideDeleteIcon = true;
    }
  }

  showDetailPage(event) {
    this.transactionId = event.id;
    this.processUrlName = event.processUrlName;
    this.detailPageLink = `/process_control/${this.processUrlName}/detail_view/${this.transactionId}`;
    this.location.replaceState(`/process_control/${this.processUrlName}/detail_view/${encodeURIComponent(this.transactionId)}`);
    this.modalService.open(this.detailViewModal, { backdrop: 'static', scrollable: true, windowClass : 'detail-view-modal' });
  }

  close(modal: any) {
    modal.dismiss();
    this.location.replaceState(`/process_control/${this.processUrlName}`);
    if(this.lm.isTriggerClick === true){        
    this.gridCaller.getGridData();
    }
  }

}
