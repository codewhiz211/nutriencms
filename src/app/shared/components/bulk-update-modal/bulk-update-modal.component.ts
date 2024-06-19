import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { ApplicationService, DmoControlService } from '@app/core';

@Component({
  selector: 'app-bulk-update-modal',
  templateUrl: './bulk-update-modal.component.html',
  styleUrls: ['./bulk-update-modal.component.scss']
})
export class BulkUpdateModalComponent implements OnInit {

  processName: string;
  form: FormGroup;
  dmos = [];
  bmogCondJson = [];
  triggerCondJson = [];
  transactionId: string;
  currentStageGuid: string;
  currentStateGuid: string;
  formSubmitted = false;
  formTriggered = false;
  transactionIds = [];
  tempTransactionID = '';

  constructor(
    private toastr: ToastrService,
    public activeModal: NgbActiveModal,
    private applicationService: ApplicationService,
    private dmoControlService: DmoControlService) { }

  ngOnInit() {
    this.dmoControlService.CurrentStage = '';
    this.dmoControlService.CurrentState = '';
    this.processName = this.processName !== undefined ? this.processName : sessionStorage.getItem('AppName');
    this.applicationService.getBatchUpdateDetails(this.processName).subscribe(data => {
      this.dmos = data;
      this.form = this.dmoControlService.toFormViewGroup(this.dmos);
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.form.valid) {
      let formValue = {...this.form.value};
      formValue = this.dmoControlService.sanitizeFormValue(this.dmos, formValue);

      const BatchUpdate = [];
      Object.keys(formValue).forEach(key => {
        BatchUpdate.push({
          DMOGUID: key,
          DATAVALUE: formValue[key]
        });
      });

      const data = {
        TransactionID: this.transactionIds,
        BatchUpdate
      };

      this.applicationService.batchUpdate(data, this.processName).subscribe(res => {
        this.activeModal.close(true);
      });

    }
  }

}
