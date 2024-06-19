import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

import { LotSearchService } from '../../services/lot-search.service';
import { LotService } from '../../services/lot.service';
import { MessageComponent } from '@app/shared/components/message';
import { MessageService } from '@app/core';

@Component({
  selector: 'app-agent-information',
  templateUrl: './agent-information.component.html',
  styleUrls: ['./agent-information.component.scss']
})

export class AgentInformationComponent implements OnInit {

  @Input() transactionIds: any = [];

  addForm: FormGroup;
  submitted = false;
  commissionData = [];

  formatter = (x: any) => x.NAME;

  constructor(
    private fb: FormBuilder,
    private lotSearchService: LotSearchService,
    private lotService: LotService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private msg: MessageService,
    ) { }

  ngOnInit() {
    this.addForm = this.fb.group({
      agencyName: ['', Validators.required],
      agentName: ['', Validators.required]
    });
  }

  get f() { return this.addForm.controls; }

  agencySearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term !== '' && term.length > 2) {
          let sp = null;
          if (this.addForm.value.agentName && this.addForm.value.agentName.SAPNO) {
            sp = this.addForm.value.agentName.SAPNO;
          }
          return this.lotSearchService.GetAgentAgencyList('Agency', term.toString(), sp);
        } else {
          return [];
        }
      }
      )
    );
  }

  agentSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    return debouncedText$.pipe(
      switchMap(term => {
        if (term !== '' && term.length > 2) {
          let sp = null;
          if (this.addForm.value.agencyName && this.addForm.value.agencyName.SAPNO) {
            sp = this.addForm.value.agencyName.SAPNO;
          }
          return this.lotSearchService.GetAgentAgencyList('Agent', term.toString(), sp);
        } else {
          return [];
        }
      })
    );

  }

  addAgent() {
    if (this.addForm.value.agencyName == null ||
        this.addForm.value.agencyName === '' ||
        this.addForm.value.agentName == null ||
        this.addForm.value.agentName === '') {
          return;
    }

    this.commissionData.push({
      agency: this.addForm.value.agencyName,
      agent: this.addForm.value.agentName
    });

    this.addForm.reset();
  }
  openConfirmation() {
    this.msg.showMessage('Warning', {
      header: 'Remove Agency Association',
      body: 'Are you sure you want to remove the Agency Association?',
      btnText: 'Confirm Remove',
      checkboxText: 'Yes, remove the Agency Association',
      isDelete: true,
      callback: this.deleteConfirmation,
      caller: this,
    })
    // this.showErrorMessage('Are you sure you want to Remove Agency Association?', 'Remove Agency Association', 'Confirm Remove',
    //  this.deleteConfirmation, true, false, true, 'Yes, Remove Agency Association');
  }
  deleteConfirmation(modelRef: NgbModalRef, Caller: AgentInformationComponent) {
    Caller.commissionData = [];
    Caller.lotService.removeAgencyAssociation(Caller.transactionIds.join(',')).subscribe(x => { });
    modelRef.close();
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
  removeAgents() {
    this.openConfirmation();
  }

  onSubmit() {
    if (this.commissionData.length !== 0) {
      this.msg.showMessage('Success', { body: 'Changes at this level may affect multiple fields in the Sale. Are you sure you want to continue?', btnText: 'Yes', cancelBtnText: 'No', header: ' ', cancelBtn: true, isConfirmation: true })
        .result
        .then(async result => {
          if (result) {
            for (const id of this.transactionIds) {
              for (const item of this.commissionData) {
                const params = {
                  TransactionID: id,
                  AgencySapNo: item.agency.SAPNO,
                  AgentCode: item.agent.CODE,
                  IsBuyerRebate: false
                };
                await this.lotService.addLotAgentAgency(params).toPromise();
              }
            }
            this.activeModal.close(true);
          }
        });
    }
  }


}
