import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { startWith, tap, combineLatest, map, debounceTime } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ApplicationService } from '@app/core';

import { DmogGridEditModalComponent } from '../dmog-grid-edit-modal/dmog-grid-edit-modal.component';
import { MessageComponent } from '../message/message.component';
import { LMService } from '@app/core/services/lm.service';

@Component({
  selector: 'app-dmog-grid-view',
  templateUrl: './dmog-grid-view.component.html',
  styleUrls: ['./dmog-grid-view.component.scss']
})
export class DmogGridViewComponent implements OnInit {

  @Input() data: any;
  @Input() dmogGuid: string;
  @Input() transactionId: string;
  @Input() processName: string;
  @Input() parentForm: FormGroup;
  @Output() gridDataChanged = new EventEmitter();

  selectedAll = false;
  headerMapContainer: any[] = [];
  headerMap: any[] = [];
  dmoGuids = [];
  dmogData: any = [];

  constructor(
    private applicationService: ApplicationService,
    private modalService: NgbModal,
    private lm: LMService,
  ) { }

  ngOnInit() {
    this.data.List.forEach(rowID => {
      this.data.Rows[rowID].Columns.forEach(objCOLUMN => {
        objCOLUMN.List.forEach(dmoGUID => {
          this.headerMapContainer.push({dmoGUID, displayName: objCOLUMN.DataModelObjects[dmoGUID].DisplayName});
          this.dmoGuids.push(dmoGUID);
          if (this.data.Name !== 'LMKOPESDMG_WSWghtDetails') {
            this.headerMap.push({dmoGUID, displayName: objCOLUMN.DataModelObjects[dmoGUID].DisplayName});
          }
        });
      });
    });
    if (this.data.Name === 'LMKOPESDMG_WSWghtDetails') {
      const category = this.parentForm.get('LMKOPESDMO_HdnLotProdCat');
      if (category && category.value) {
        const liveWeightHeader = this.headerMapContainer.find(item => item.dmoGUID === 'lmkopesdmowswdlivewght');
        this.headerMap.push(liveWeightHeader);
        category.valueChanges.pipe(
          startWith(category.value),
          tap(value => {
            if (value === 'Cattle') {
              // Delete sheep related
              this.headerMap = this.headerMap.filter(item => 
                item.dmoGUID !== 'lmkopesdmowswdfatssheep' && item.dmoGUID !== 'lmkopesdmowswdnoofhead' && item.dmoGUID !== 'lmkopesdmowswdtotalwght');
              
              // Add cattle related
              const fatScoreHeader = this.headerMapContainer.find(item => item.dmoGUID === 'lmkopesdmowswdfatscore');
              if (!this.headerMap.find(item => item.dmoGUID === fatScoreHeader.dmoGUID))
                this.headerMap.push(fatScoreHeader);

            } else if (value === 'Sheep') {
              // delete cattle retaled
              this.headerMap = this.headerMap.filter(item => item.dmoGUID !== 'lmkopesdmowswdfatscore');

              // Add sheep related
              const fatScoreHeader = this.headerMapContainer.find(item => item.dmoGUID === 'lmkopesdmowswdfatssheep');
              const nohHeader = this.headerMapContainer.find(item => item.dmoGUID === 'lmkopesdmowswdnoofhead');
              if (!this.headerMap.find(item => item.dmoGUID === fatScoreHeader.dmoGUID))
                this.headerMap.push(fatScoreHeader)
              if (!this.headerMap.find(item => item.dmoGUID === nohHeader.dmoGUID))
                this.headerMap.push(nohHeader)
            } 
          }),
        ).toPromise();
      }
    }
   

    this.getGridDmogData();
  }

  getGridDmogData() {    
    this.selectedAll = false;
    const params = {
      ProcessName: this.processName,
      TransactionID: this.transactionId,
      DmogGuid: this.dmogGuid,
      Columns: this.dmoGuids.toString(),
      SortColumn:'-1',
      SortOrder:'ASC' 
    };
    this.applicationService.getGridDmogData(params).subscribe((response: any[]) => {
      const data = {
        dmoGUID: this.dmogGuid,
        list: response
      };
      this.gridDataChanged.emit(data);
      if (this.data.Name === 'LMKOPESDMG_WSWghtDetails') {
        this.lm.calculateWeightDetails(response, this.parentForm);
      }
      this.dmogData = response;
    });
  }
  
  // private calculateWeightDetails(data: any[]): void {
  //   const minWeightControl = this.parentForm.get('LMKOPESDMO_Weightslowkg');
  //   const maxWeightControl = this.parentForm.get('LMKOPESDMO_WeightsHighkg');
  //   const averageWeightControl = this.parentForm.get('LMKOPESDMO_Averagekg');
  //   const estAvgDressWeightControl = this.parentForm.get('LMKOPES_EstAvgDrssdWght');
  //   const estAvgLiveDeliveryWeightControl = this.parentForm.get('LMKOPES_EstAvgLiveDelWght');
  //   const estAvgDressDeliveryWeightControl = this.parentForm.get('LMKOPES_EstAvgDrssDelWght');
  //   const numberOfHeadsWeighed = this.parentForm.get('LMKOPES_Numfheadsweighed');
    
  //   if (data.length > 0) {
  //     const categoryControl = this.parentForm.get('LMKOPESDMO_HdnLotProdCat');
  //     const estDressingControl = this.parentForm.get('LMKOPESDMO_Dressing');
  //     const estDaysToDeliveryControl = this.parentForm.get('LMKOPESDMO_EstDaysToDlvry');
  //     const estWeightGainControl = this.parentForm.get('LMKOPESDMO_EstWeightGain');
  //     const deliveryAdjustmentControl = this.parentForm.get('LMKOPES_DelAdjustPercent');
  
  //     if (categoryControl && categoryControl.value) {
  //       categoryControl.valueChanges.pipe(
  //         startWith(categoryControl.value),
  //         combineLatest(
  //           estDressingControl.valueChanges.pipe(startWith(estDressingControl.value)),
  //           estDaysToDeliveryControl.valueChanges.pipe(startWith(estDaysToDeliveryControl.value)),
  //           estWeightGainControl.valueChanges.pipe(startWith(estWeightGainControl.value)),
  //           deliveryAdjustmentControl.valueChanges.pipe(startWith(deliveryAdjustmentControl.value)),
  //         ),
  //         debounceTime(300),
  //         map(([category, estDressing, estDaysToDelivery, estWeightGain, deliveryAdjustment]) => {
  //           return [category, +estDressing / 100, +estDaysToDelivery, +estWeightGain, +deliveryAdjustment / 100]
  //         }),
  //         tap(([category, estDressing, estDaysToDelivery, estWeightGain, deliveryAdjustment]) => {
  //           let minLiveWeight: number = data[0] ? +data[0].lmkopesdmowswdlivewght : 0;
  //           let maxLiveWeight: number = data[0] ? +data[0].lmkopesdmowswdlivewght : 0;
  //           let totalWeight = 0;
  //           let totalNumberOfhead = 0;
  
  //           data.forEach(row => {
  //             row.lmkopesdmowswdfatscore = row.lmkopesdmowswdfatscore || '';
  //             row.lmkopesdmowswdfatssheep = row.lmkopesdmowswdfatssheep || '';
  //             row.lmkopesdmowswdlivewght = row.lmkopesdmowswdlivewght || 0;
  //             row.lmkopesdmowswdnoofhead = row.lmkopesdmowswdnoofhead || 1;
  //             row.lmkopesshbreeddetnumhead = row.lmkopesshbreeddetnumhead || 1;
              
  //             // console.log(row)
  //             if (+row.lmkopesdmowswdlivewght > maxLiveWeight)
  //               maxLiveWeight = +row.lmkopesdmowswdlivewght;
              
  //             if (+row.lmkopesdmowswdlivewght < minLiveWeight)
  //               minLiveWeight = +row.lmkopesdmowswdlivewght;
            
  //             if (category === 'Cattle') {
  //               totalNumberOfhead++;
  //               totalWeight += +row.lmkopesdmowswdlivewght;
  //             } else {
  //               totalNumberOfhead += +row.lmkopesdmowswdnoofhead;
  //               totalWeight += +row.lmkopesdmowswdlivewght * +row.lmkopesdmowswdnoofhead;
  //             }
              
  //           });
  //           // console.log(totalWeight, totalNumberOfhead)
  //           const average = totalWeight / totalNumberOfhead;
  //           const estAverageLiveWeightAtDelivery = 
  //             (((estDaysToDelivery * estWeightGain) + average) * (-deliveryAdjustment)) + (average + (estDaysToDelivery * estWeightGain));
  //           const estAverageDressedWeightAtDelivery = 
  //           // ((estDaysToDelivery * estWeightGain + estAverageLiveWeightAtDelivery) * estDressing); /* FRD version */
  //           ((estDaysToDelivery * estWeightGain + average) * estDressing); /* Excel aka Andrew version */
  
  //           numberOfHeadsWeighed.patchValue(totalNumberOfhead);
  //           minWeightControl.patchValue(minLiveWeight);
  //           maxWeightControl.patchValue(maxLiveWeight);
  //           averageWeightControl.patchValue(this.convertCalc(+average));
  //           estAvgDressWeightControl.patchValue(this.convertCalc(+(average * estDressing)));
  //           estAvgLiveDeliveryWeightControl.patchValue(this.convertCalc(+estAverageLiveWeightAtDelivery));
  //           estAvgDressDeliveryWeightControl.patchValue(this.convertCalc(+estAverageDressedWeightAtDelivery));
  //         })
  //       ).toPromise();
  //     }
      
  //   } else {
  //     numberOfHeadsWeighed.reset();
  //     minWeightControl.reset();
  //     maxWeightControl.reset();
  //     averageWeightControl.reset();
  //     estAvgDressWeightControl.reset();
  //     estAvgLiveDeliveryWeightControl.reset();
  //     estAvgDressDeliveryWeightControl.reset();
  //   }
  // }

  // /* Converts any number to this format: 5 => 5.00, 234.1 => 234.10, => 1.234345 => 1.23 */
  // private convertCalc(number: number) {
  //   if (number)
  //     return number.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  // }

  selectAllCheckBox(event) {
    this.dmogData.forEach(item => item.checked = this.selectedAll);
  }

  checkIfAllSelected(item: any) {
    if (!item.checked) {
      this.selectedAll = false;
    } else {
      this.selectedAll = this.dmogData.every(chkItem => {
        return chkItem.checked === true;
      });
    }
  }

  addNewRecord() {
    const modalRef = this.modalService.open(DmogGridEditModalComponent, { size: 'lg',backdrop:'static' });
    const modalInstance: DmogGridEditModalComponent = modalRef.componentInstance;
    modalInstance.title = this.data.DisplayName;
    modalInstance.data = this.data;
    modalInstance.dmogGuid = this.dmogGuid;
    modalInstance.transactionId = this.transactionId;
    modalInstance.processName = this.processName;
    modalInstance.parentForm = this.parentForm;
    modalRef.result.then(result => {
      if (result) {
        this.getGridDmogData();
      }
    }, (reason) => {
    });
  }

  showDeleteMessage() {
    const selectedItems = this.dmogData.filter(x => x.checked === true);

    // Set modal popup configuration
    const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
    const modalInstance: MessageComponent = modalMsgRef.componentInstance;
    modalInstance.MessagePopup = modalMsgRef;
    modalInstance.IsConfirmation = true;
    modalInstance.Caller = this;
    if (selectedItems.length > 0) {
      modalInstance.ConfirmationText = 'Yes, delete selected items.';
      modalInstance.IsDelete = true;
      modalInstance.IsConfirmation = true;
      modalInstance.MessageHeader = 'Delete Selected Items';
      modalInstance.Message = 'Do you want to delete selected items.';
      modalInstance.ButtonText = 'Confirm Delete';
      modalInstance.CallBackMethod = this.deleteSelectedConfirmation;
    } else {
      modalInstance.MessageHeader = 'Warning !';
      modalInstance.Message = 'Select at least one record to delete.';
      modalInstance.ButtonText = 'Ok';
    }
  }

  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: DmogGridViewComponent) {
    const selectedItems = Caller.dmogData.filter(x => x.checked === true).map(item => item.DATAID);
    if (selectedItems) {
      Caller.applicationService.deleteGridDmogData(selectedItems.toString()).subscribe(data => {
        Caller.getGridDmogData();
      });
    } else {
      modelRef.close();
    }
  }

  editRecord(index: number) {
    const modalRef = this.modalService.open(DmogGridEditModalComponent, { size: 'lg',backdrop:'static' });
    const modalInstance: DmogGridEditModalComponent = modalRef.componentInstance;
    modalInstance.title = this.data.DisplayName;
    modalInstance.data = this.data;
    modalInstance.dmogGuid = this.dmogGuid;
    modalInstance.transactionId = this.transactionId;
    modalInstance.processName = this.processName;
    modalInstance.editData = this.dmogData[index];
    modalInstance.parentForm = this.parentForm;
    modalRef.result.then(result => {
      if (result) {
        this.getGridDmogData();
      }
    }, (reason) => {
    });
  }

}
