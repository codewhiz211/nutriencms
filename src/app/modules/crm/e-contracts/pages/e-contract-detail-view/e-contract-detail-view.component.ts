import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';

import { AuthenticationService, FormViewService, ApplicationService, ListviewService, MessageService } from '@app/core';
import { LotsGridViewComponent } from '../../../lots/pages/lots-grid-view/lots-grid-view.component';
import { environment } from '@env/environment';
import { EContractViewModalComponent } from '../../components/e-contract-view-modal/e-contract-view-modal.component';
import { EContractService } from '../../services/e-contract.service';
import { Title } from '@angular/platform-browser';
import { UserDetail } from '@app/core/models/user-detail';

@Component({
  selector: 'app-e-contract-detail-view',
  templateUrl: './e-contract-detail-view.component.html',
  styleUrls: ['./e-contract-detail-view.component.scss']
})
export class EContractDetailViewComponent implements OnInit {
  @ViewChild(LotsGridViewComponent)
  private lotsGridViewComponent: LotsGridViewComponent;
  dateFormat: string = environment.Setting.dateFormat;
  currentUser: any;
  transactionId: string;
  processName: string;
  stages: any = [];
  headerInformations: any = {};
  applicationData: any = {};
  BMJSON: any = {};
  topCornerDetails = [];
  isClosed = false;
  currentState: any;
  constructor(
    private msg: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    public location: Location,
    private modalService: NgbModal,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private econtractservice: EContractService,
    private listviewService: ListviewService,
    private titleService: Title,
    private authenticationService: AuthenticationService,
    private userDetail: UserDetail) { }

  ngOnInit() {
    this.stages.push({
      DisplayName: 'Open',
      active: false
    });
    this.stages.push({
      DisplayName: 'Closed',
      active: false
    });
    this.currentUser = this.userDetail;
    this.processName = sessionStorage.getItem('AppName');
    if (this.processName !== 'LMKOpportunities') {
      this.processName = 'LMKOpportunities';
    }
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('id');
      this.formViewService.getBmWfJson(this.processName, 'View2', this.transactionId).subscribe(response => {
        this.BMJSON = response.BM.BusinessModelObjectGroup.View2;
        this.applicationService.getApplicationData(null, null, 'View2', this.transactionId).subscribe(applicationData => {
          this.applicationData = applicationData;
          this.applicationService.getTopCornerDetail(null, null, 'View2', this.transactionId).subscribe(topDetails => {
            // this.topCornerDetails = topDetails;           
            if(topDetails){
              topDetails.forEach(element => {
                this.topCornerDetails[element.DisplayName] = element.Value;
              });
            }           
            //this.topCornerDetails['State'] = this.applicationData.ApplicationInfo[0] ? this.applicationData.ApplicationInfo[0].StageFriendlyName : '';
            if (applicationData.DataInformation.lmkopecdmotranstype && applicationData.DataInformation.lmkopecdmotranstype.DMOVAL.indexOf('~~~') > -1) {
              this.topCornerDetails['Transaction Type'] = this.applicationData.DataInformation.lmkopecdmotranstype.DMOVAL.split('~~~')[1];
            }
            if (applicationData.DataInformation.lmkopecdmosaletype && applicationData.DataInformation.lmkopecdmosaletype.DMOVAL.indexOf('~~~') > -1) {
              this.topCornerDetails['Sale Type'] = this.applicationData.DataInformation.lmkopecdmosaletype.DMOVAL.split('~~~')[1];
            }
          });
          this.currentState = this.applicationData.ApplicationInfo[0] ? this.applicationData.ApplicationInfo[0].StateFriendlyName : '';
          // get stages
          this.get_stages();
        }
        );
      }
      );

    });
    this.titleService.setTitle('Nutrien | E-contract');
  }

  isDate(value: string) {
    if (value !== undefined) {
      const regex = /([0-9]){1,2}\/([0-9]{2})\/([0-9]){4}/;
      return value.match(regex);
    }
  }

  show_close_msg() {
    this.msg.showMessage('Warning', {
      header: 'Close Sale',
      body: 'Are you sure you want to close this record?',
      btnText: 'Close Sale',
      isConfirmation: true,
      callback: this.deleteSelectedConfirmation,
      caller: this,
    })
    // Set modal popup configuration
    // const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    // const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    // modalInstance.MessagePopup = modalMsgRef;
    // modalInstance.IsDefaultView = true;
    // modalInstance.Caller = this;
    // modalInstance.ConfirmationText = 'Yes, close this record.';
    // modalInstance.IsDelete = false;
    // modalInstance.IsConfirmation = true;
    // modalInstance.MessageHeader = 'Close Sale';
    // modalInstance.Message = 'Are you sure you want to close this record?';
    // modalInstance.ButtonText = 'Close Sale';
    // modalInstance.CallBackMethod = this.deleteSelectedConfirmation;
  }

  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: EContractDetailViewComponent) {
    Caller.econtractservice.closeContract(Caller.transactionId).subscribe(data => {
      if (data == true) {
        Caller.applicationData.DataInformation.lmkopecdmowfstate.DMOVAL = "Closed";
        Caller.get_stages();
      }
      Caller.isClosed = false;
      modelRef.close(true);
    });
  }

  get_stages() {
    if (this.applicationData.DataInformation.lmkopecdmowfstate.DMOVAL === "") {
      this.isClosed = true;
      this.stages[0].active = true;
      this.stages[1].active = false;
    }
    else if (this.applicationData.DataInformation.lmkopecdmowfstate.DMOVAL === "Closed") {
      this.stages[0].active = false;
      this.isClosed = true;
      this.stages[1].active = true;
    } else if (this.applicationData.DataInformation.lmkopecdmowfstate.DMOVAL === "Open") {
      this.stages[0].active = true;
      this.isClosed = true;
      this.stages[1].active = false;
    }
    this.topCornerDetails['State'] = this.stages.find(x=> x.active == true).DisplayName;
  }

  go_back() {
    this.router.navigate(['/crm/e-contract/LMKCRMEContractsRecords']);
  }

  Create_New_Sale() {
    if (this.applicationData.DataInformation.lmkopecdmotranstype && this.applicationData.DataInformation.lmkopecdmotranstype.DMOVAL.indexOf('~~~') > -1) {
      const trnstype = this.applicationData.DataInformation.lmkopecdmotranstype.DMOVAL.split('~~~');
      const saletype = this.applicationData.DataInformation.lmkopecdmosaletype.DMOVAL.split('~~~');
      const modalRef = this.modalService.open(EContractViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: EContractViewModalComponent = modalRef.componentInstance;
      modalInstance.processName = 'LMKOpportunities';
      modalInstance.SelectedRecordIds = [this.transactionId];
      modalInstance.ContractId = this.topCornerDetails['Record ID'];
      modalInstance.transactionTypeKeyValue = trnstype[1] + ' (' + trnstype[0] + ')';
      modalInstance.saleTypeValue = saletype[1] + ' (' + saletype[0] + ')';
      modalRef.result.then(async (result) => {
      }, (reason) => {
      }
      );
    }
  }
}
