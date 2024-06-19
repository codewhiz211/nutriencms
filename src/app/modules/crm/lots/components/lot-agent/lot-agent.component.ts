import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { LotShareAgentModalComponent } from '../lot-share-agent-modal/lot-share-agent-modal.component';
import { LotAddAgentModalComponent } from '../lot-add-agent-modal/lot-add-agent-modal.component';

import { MessageComponent } from '@app/shared';
import { SaleStage, MessageService } from '@app/core';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-lot-agent',
  templateUrl: './lot-agent.component.html',
  styleUrls: ['./lot-agent.component.scss']
})
export class LotAgentComponent implements OnInit, OnDestroy {

  @Input() processName: string;
  @Input() receviedData: any = {};
  @Input() stage: SaleStage;

  transactionId: string;
  newBbrAgent: any = {};
  commissionData = [];
  buyerRebateCommissionData = [];
  AgentId: any;
  subscription: Subscription;
  isVendorAssociationExists = false;
  isBuyerAssociationExists = false;
  formatter = (x: { SAPNO: string, NAME: string }) => x.NAME;

  get isDisabled() {
    return this.stage === SaleStage.ReversalProcess || this.stage === SaleStage.ReversalCompleted || this.stage === SaleStage.Finalised;
  }


  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private lotService: LotService,
    private msg: MessageService,
    ) { }

  ngOnInit() {
    this.subscription = this.lotService.navItem$
      .subscribe(bool => {
        if (bool) {
          this.bindData();
        }
      });

    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('id');
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  bindData() {
    if (this.transactionId) {
      this.lotService.getAgentCommission(this.transactionId).subscribe(result => {
        this.commissionData = result.filter(item => item.IsBuyerRebate === false);
        this.isVendorAssociationExists = result.findIndex(x=> x.Association == 'Vendor') > -1;
        this.isBuyerAssociationExists = result.findIndex(x=> x.Association == 'Buyer') > -1;
        this.buyerRebateCommissionData = result.filter(item => item.IsBuyerRebate === true);
      });
    }
  }


  add_new_agent(category: string) {
    const modalRef = this.modalService.open(LotAddAgentModalComponent, { size: 'lg', backdrop: 'static', keyboard: false  });
    const modalInstance: LotAddAgentModalComponent = modalRef.componentInstance;
    modalInstance.category = category;
    modalInstance.transactionId = this.transactionId;
    modalRef.result.then(result => {
      if (result) {
        this.toastr.success('Success');
        this.bindData();
      }
      else if(result==false){
        this.toastr.warning('The Agency/ Agent association you are adding already exists');
      }
    });
  }

  openremoveAgentConfirmation(item: any) {
    this.AgentId = item;
    this.msg.showMessage('Warning', {
      header: 'Remove Agency',
      body: 'Are you sure you want to remove agency?',
      btnText: 'Confirm Remove',
      checkboxText: 'Yes, remove this agency',
      isDelete: true,
      callback: this.removeAgent,
      caller: this,
    })
    // this.showErrorMessage(
    //   'Are you sure you want to Remove?',
    //   'Remove Agency',
    //   'Confirm Remove',
    //   this.removeAgent,
    //   true,
    //   false,
    //   true,
    //   'Yes, Remove this Agency');
  }

  removeAgent(modelRef: NgbModalRef, Caller: LotAgentComponent) {
    Caller.lotService.deleteLotAgentAgency(Caller.AgentId).subscribe(result => {
      Caller.toastr.success('Success');
      Caller.bindData();
    });
  }

  shareAgent(item: any) {
    // Fix raygun error - Roshan
    if (item.AgencySapNo) {
      const modalRef = this.modalService.open(LotShareAgentModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
      const modalInstance: LotShareAgentModalComponent = modalRef.componentInstance;
      modalInstance.Pid = item.ID;
      modalInstance.body = {
        Agency: item.AgencySapNo,
        Agent: item.AgentCode,
        TransactionID: this.transactionId
      };
      modalRef.result.then(result => {
        if (result) {
          this.bindData();
        } else if (result == false) {
          this.toastr.warning('The Agency/ Agent association you are adding already exists');
        }
      });
    }
  }

  // showErrorMessage(ErrorMsg: string, HeaderMsg: string, buttonText: string, callback: any, IsDelete: boolean, IsDefaultView: boolean, IsConfirmation: boolean, confirmationText: string) {
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

}
