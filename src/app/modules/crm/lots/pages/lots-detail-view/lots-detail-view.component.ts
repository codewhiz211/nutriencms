import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { LotSearchService } from '../../services/lot-search.service';
import { LotService } from '../../services/lot.service';
import { ApplicationService, SaleStage } from '@app/core';
import { MessageComponent } from '@app/shared';
import { LotDetailComponent } from '../../components/lot-detail/lot-detail.component';
import { SalesService } from '@app/modules/crm/sales/services/sales.service';

@Component({
  selector: 'app-lots-detail-view',
  templateUrl: './lots-detail-view.component.html',
  styleUrls: ['./lots-detail-view.component.scss']
})
export class LotsDetailViewComponent implements OnInit, OnDestroy {

  stage: SaleStage;
  isNew = false;
  isNavigating = false;
  processName = 'LMKLivestockLots';
  saleId: string;
  isLoaded = false;
  saleData: any;
  currentLotId: any;
  private subscriptions: Subscription[] = [];

  get isFirstLot() {
    return +this.lotSearchService.currentLotId === 1;
  }

  @ViewChild(LotDetailComponent)
  private LotDetailComponent: LotDetailComponent;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    public lotSearchService: LotSearchService,
    public lotService: LotService,
    private applicationService: ApplicationService,
    private modalService: NgbModal,
    private saleservice: SalesService
  ) { }

  ngOnInit() {
    const routerSubscription = this.router.paramMap.subscribe(params => {
      this.isLoaded = false;
      if (params.get('id') === 'new') {
        this.isNew = true;
      } else {
        this.isNew = false;
      }
      this.saleId = params.get('sale_id');
      if (!this.lotSearchService.isNavigateNew) {
        this.lotSearchService.currentLotId = null;
      }

      const sb = this.applicationService.getApplicationData(null, null, 'AdminView', this.saleId).subscribe(data => {
        this.saleData = data;
        if (data.DataInformation.dmgcrmheaderinfosalerev &&
          data.DataInformation.dmgcrmheaderinfosalerev.DMOVAL != null &&
          data.DataInformation.dmgcrmheaderinfosalerev.DMOVAL !== '') {
            if (data.ApplicationInfo[0].StageFriendlyName === SaleStage.Inprocess) {
              this.stage = SaleStage.ReversalProcess;
            } else if (data.ApplicationInfo[0].StageFriendlyName === SaleStage.Finalised) {
              this.stage = SaleStage.ReversalCompleted;
            }
        } else if (data.ApplicationInfo[0].StageFriendlyName === SaleStage.Finalised) {
          this.stage = SaleStage.Finalised;
        } else if (data.ApplicationInfo[0].StageFriendlyName === SaleStage.Invoiced) {
          this.stage = SaleStage.Invoiced;
        } else {
          this.stage = SaleStage.Inprocess;
        }
        this.isLoaded = true;
        if (data.DataInformation 
          && data.DataInformation.dmocrmheaderinfocmpcode
          && data.DataInformation.dmocrmheaderinfocmpcode.DMOVAL !='') {
          this.saleservice.saleCompanyCode = data.DataInformation.dmocrmheaderinfocmpcode.DMOVAL.split(',');
        }
        if (data.DataInformation 
          && data.DataInformation.dmocrmheaderinfocmpcode
          && data.DataInformation.dmocrmheaderinfocmpcode.DMOVAL !=''
          && data.DataInformation.dmocrmhinfocondcmpcode
          && data.DataInformation.dmocrmhinfocondcmpcode.DMOVAL !='') {
        this.saleservice.IsAllowForCondutingBranch(data.DataInformation.dmocrmheaderinfocmpcode.DMOVAL,
          data.DataInformation.dmocrmhinfocondcmpcode.DMOVAL);
        }
      });

      this.subscriptions.push(sb);
    });
    this.subscriptions.push(routerSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe);
  }

  go_back() {
    if (this.LotDetailComponent && this.LotDetailComponent.lotDetailForm.pristine == false && this.LotDetailComponent.isLotSubmit == false) {
      const modalMsgRef = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
      const modalInstance: MessageComponent = modalMsgRef.componentInstance;
      modalInstance.MessagePopup = modalMsgRef;
      modalInstance.IsConfirmation = true;
      modalInstance.Caller = this;
      modalInstance.MessageHeader = 'Confirmation Message';
      modalInstance.Message = 'There is unsaved data in lot details. Are you sure you wish to proceed without saving?';
      modalInstance.ButtonText = 'Yes';
      modalInstance.IsDefaultView = true;
      modalInstance.CallBackMethod = this.homeRedirectionConfirmation;
    } else {
      this.route.navigate(['/crm/sales', this.saleId]);
    }
  }

  homeRedirectionConfirmation(modelRef: NgbModalRef, Caller: LotsDetailViewComponent) {
    Caller.route.navigate(['/crm/sales', Caller.saleId]);
  }

  getLotRecord(lotId: any, opt?: any) {
    lotId = +lotId;

    if (lotId < 0 || (this.isFirstLot && opt === 'prev') || (this.lotSearchService.isNavigateNew && opt === 'next')) {
      return false;
    }

    if (opt === 'prev') {
      lotId -= 1;
    } else if (opt === 'next') {
      lotId += 1;
    }

    const sb = this.lotSearchService.lotNavigation(this.saleId, lotId).subscribe(data => {
      if (data.Data.length < 1) {
        if (this.isNavigating || this.stage === SaleStage.Finalised) {
          if (this.isNavigating) {
            this.lotSearchService.currentLotId = this.currentLotId;
          }
          return false;
        }
        if (lotId <= data.maxLotNo) {
          this.getLotRecord(lotId, opt);
        } else {
          this.lotSearchService.isNavigateNew = true;
          this.lotSearchService.currentLotId = lotId;
          this.route.navigate([`/crm/sales/${this.saleId}/lots`, 'new'], { relativeTo: this.router });
        }
      } else {
        this.lotSearchService.isNavigateNew = false;
        this.isNavigating = false;
        this.lotSearchService.currentLotId = data.Data[0].LotId;
        this.route.navigate([`/crm/sales/${this.saleId}/lots`, data.Data[0].TranctionId]);
      }
    });

    this.subscriptions.push(sb);
  }

  onChangeLotID(searchValue: string) {
    this.isNavigating = true;
    this.currentLotId = this.lotSearchService.currentLotId;
    this.lotSearchService.currentLotId = searchValue;
    this.getLotRecord(searchValue);
  }

  tabSelected(tabName: string) {
    if (tabName === 'Agent') {
      this.lotService.changeNav();
    }
  }
  get SaleDescription() {
    if(this.saleData && this.saleData.DataInformation && this.saleData.DataInformation.dmocrmheaderinfsaledesc) {
      return this.saleData.DataInformation.dmocrmheaderinfsaledesc.DMOVAL.toString().trim();
    }
    return "";
  }

}
