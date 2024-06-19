import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';

import { DmoControlService, ApplicationService } from '@app/core';
import { startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dmog-grid-edit-modal',
  templateUrl: './dmog-grid-edit-modal.component.html',
  styleUrls: ['./dmog-grid-edit-modal.component.scss']
})
export class DmogGridEditModalComponent implements OnInit, AfterViewInit {

  submitted = false;
  title = 'Add New Record';
  data: any;
  editData: any;
  processName: string;
  transactionId: string;
  dmogGuid: string;
  dmos = [];
  dmoMapping: any = {};
  form: FormGroup;
  parentForm: FormGroup;


  constructor(
    public activeModal: NgbActiveModal,
    private dmoControlService: DmoControlService,
    private applicationService: ApplicationService,
  ) {}

  ngOnInit() {
    this.data.List.forEach(rowID => {
      this.data.Rows[rowID].Columns.forEach(objCOLUMN => {
        objCOLUMN.List.forEach(dmoGUID => {
          const dmoData = { ...objCOLUMN.DataModelObjects[dmoGUID] };
          dmoData.DMOGuid = dmoGUID;
          this.dmos.push(dmoData);
          this.dmoMapping[dmoGUID] = objCOLUMN.DataModelObjects[dmoGUID].Name;
        });
      });
    });
   
    this.generateForm();
  }

  ngAfterViewInit() {
    if (this.data && this.data.Name === 'LMKOPESDMG_WSWghtDetails') {
      const category = this.parentForm.get('LMKOPESDMO_HdnLotProdCat');
      if (category && category.value) {
        category.valueChanges.pipe(
          startWith(category.value),
          tap(value => {
            let controlsToHide = this.dmos.filter(dmo => dmo.DMOGuid === 'lmkopesdmowswdtotalwght');
            if (value === 'Cattle') {
              controlsToHide = [...controlsToHide, ...this.dmos.filter(dmo => dmo.DMOGuid === 'lmkopesdmowswdnoofhead' || dmo.DMOGuid === 'lmkopesdmowswdfatssheep')];
              const {lmkopesdmowswdnoofhead, lmkopesdmowswdfatssheep, lmkopesdmowswdtotalwght, ...rest} = this.dmoMapping;
              this.dmoMapping = rest;
            } else if (value === 'Sheep') {
              controlsToHide = [...controlsToHide, ...this.dmos.filter(dmo => dmo.DMOGuid === 'lmkopesdmowswdfatscore')];
              const {lmkopesdmowswdfatscore, ...rest} = this.dmoMapping;
              this.dmoMapping = rest;
            }
            // There's no other clean way to hide the controls, so there.
            controlsToHide.forEach(dmo => {
              const el = document.getElementById(`MyTr_${dmo.DMOGuid}`);
              if (el) {
                el.style.display = 'none';
              }
            });
          }),
        ).toPromise();
      }
    }
  }

  private generateForm() {
    if (this.editData) {
      const appData = {
        ApplicationInfo: [],
        DataInformation: {}
      };
      Object.keys(this.editData).forEach(key => {
        appData.DataInformation[key] = {
          DMOVAL: this.editData[key]
        };
      });
      
      this.form = this.dmoControlService.toAdminViewFormGroup(this.dmos, appData);
    } else {
      this.form = this.dmoControlService.toFormViewGroup(this.dmos);
    }
  }

  onSubmit() {
    if (this.data.Name === 'LMKOPESDMG_WSWghtDetails') {
      const category = this.parentForm.get('LMKOPESDMO_HdnLotProdCat');
      const weight = +this.form.get('LMKOPESDMO_WSWDLiveWght').value;
      if (category && category.value && category.value === 'Sheep') {
        this.form.get('LMKOPESDMO_WSWDFatSCat').patchValue('Fat Score 1 (0-2mm)');
        const noh = +this.form.get('LMKOPESDMO_WSWDNoOfHead').value;
        this.form.get('LMKOPESDMO_WSWDTotalWght').patchValue(noh * weight);
      } else if (category && category.value && category.value === 'Cattle') {
        this.form.get('LMKOPESDMO_WSWDNoOfHead').patchValue(1);
        this.form.get('LMKOPESDMO_WSWDTotalWght').patchValue(weight);
        this.form.get('LMKOPESDMO_WSWDFatSSheep').patchValue('Score 1 (0-5mm)');
      }
    }
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }

    const submitValue = {};
    Object.keys(this.dmoMapping).forEach(key => {
      submitValue[key] = this.form.value[this.dmoMapping[key]];
    });

    const params: any = {
      ProcessName: this.processName,
      TransactionID: this.transactionId,
      DmogGuid: this.dmogGuid,
      ActionItemsData: submitValue,
      Columns: Object.keys(this.dmoMapping).toString()
    };

    if (this.editData) {
      params.DataID = this.editData.DATAID;
    }
    this.applicationService.insertUpdateGridDmogData(params).subscribe(response => {
      this.activeModal.close(true);
    });
  }

}
