import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

import { MessageService } from '@app/core';

@Component({
  selector: 'app-bulk-upload-lot',
  templateUrl: './bulk-upload-lot.component.html',
  styleUrls: ['./bulk-upload-lot.component.scss']
})
export class BulkUploadLotComponent implements OnInit {

   configLot = {
    transactionIds: [],
    selectedLots: [],
    saleId: '',
    processName: '',
    stage: '',
    isShowAgent: true
  };

  previousSelectedTabName: string;
  confirmedSwitching$ = new BehaviorSubject<boolean>(true);
  tabDirty = false;

  constructor(
    public activeModal: NgbActiveModal,
    private msg: MessageService) { }

  ngOnInit() {
    const cmpCode = [];
    if(this.configLot && this.configLot.selectedLots){
      this.configLot.selectedLots.forEach(element => {
        if(cmpCode.indexOf(element.domlotvinfocompcode) ==-1){
          cmpCode.push(element.domlotvinfocompcode);
        }
        if(cmpCode.indexOf(element.dmolotbinfocompcode) ==-1){
          cmpCode.push(element.dmolotbinfocompcode);
        }
      });
      if(cmpCode.length > 1){
        this.configLot.isShowAgent = false;
      }
    }
  }

  tabSelected(tabName: string) {
    this.confirmedSwitching$.next(false);
    if (!!this.previousSelectedTabName === false) {
      this.previousSelectedTabName = tabName;
    } else if (this.previousSelectedTabName !== tabName) {
      if (this.tabDirty) {
        this.msg.showMessage('Success', { body: 'There are changes that have not applied to the Sale yet. Are you sure you want to switch tabs?', btnText: 'Yes', cancelBtnText: 'No', header: ' ', cancelBtn: true, isConfirmation: true })
          .result
          .then(confirm => {
            if (confirm) {
              this.confirmedSwitching$.next(true);
              this.confirmedSwitching$.next(false);
              this.previousSelectedTabName = tabName;
              this.tabDirty = false;
            }
          });
      } else {
        this.confirmedSwitching$.next(true);
        this.confirmedSwitching$.next(false);
        this.previousSelectedTabName = tabName;
      }
    }
  }

  markTabDirty(e: boolean) {
    this.tabDirty = e;
  }

}
