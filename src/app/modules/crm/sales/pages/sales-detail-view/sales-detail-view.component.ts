import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import {
  AuthenticationService,
  FormViewService,
  ApplicationService,
  ListviewService,
  MessageService,
  DmoControlService,
  SaleStage
} from '@app/core';

import { SalesFormViewModalComponent } from '../../components/sales-form-view-modal/sales-form-view-modal.component';
import { LotsGridViewComponent } from '../../../lots/pages/lots-grid-view/lots-grid-view.component';
import { SalesSummaryComponent } from '../../components/sales-summary/sales-summary.component';
import { SalesVendorTermsComponent } from '../../components/sales-vendor-terms/sales-vendor-terms.component'
import { SalesDocumentsComponent } from '../../components/sales-documents/sales-documents.component'
import { environment } from '@env/environment';
import { LotSearchService } from '@app/modules/crm/lots/services/lot-search.service';
import { SalesService } from '../../services/sales.service';
import { UserDetail } from '@app/core/models/user-detail';
import { split } from 'lodash';
import printJS from 'print-js';
import { resolve } from '@angular/compiler-cli/src/ngtsc/file_system';

@Component({
  selector: 'app-sales-detail-view',
  templateUrl: './sales-detail-view.component.html',
  styleUrls: ['./sales-detail-view.component.scss']
})
export class SalesDetailViewComponent implements OnInit {

  @ViewChild(LotsGridViewComponent) private lotsGridViewComponent: LotsGridViewComponent;
  @ViewChild(SalesSummaryComponent) private salesSummaryComponent: SalesSummaryComponent;
  @ViewChild(SalesVendorTermsComponent) private SalesVendorTermsComponent: SalesVendorTermsComponent;
  @ViewChild(SalesDocumentsComponent) private SalesDocumentsComponent: SalesDocumentsComponent;

  dateFormat: string = environment.Setting.dateFormat;
  currentUser: any;
  transactionId: string;
  processName: string;
  stages: any = [];
  currentStage: SaleStage;
  headerInformations: any = {};
  applicationData: any = {};
  BMJSON: any = {};
  alertMessage: string;
  IsLot = false;
  HeaderInformation: any = {};
  stageName: string;

  isFinalised = false;
  isReversalProcess = false;
  isReversalCompleted = false;
  isInvoiceSaleBtnVisible = false;
  isFinaliseBtnVisible = false;
  isDelBtnActivated = false;
  currentTabselected: any;
  isTriggerRole = false;
  SaleProcessorIds:string;

  CompCode: string;
  CondCompCode: string;
  get selectedRecords() {
    return this.lotsGridViewComponent.SelectedRecordIds;
  }

  get lotsData() {
    return this.lotsGridViewComponent.cachedData;
  }

  get lotKeyColumn() {
    return this.lotsGridViewComponent.keyColumn;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public location: Location,
    private modalService: NgbModal,
    private formViewService: FormViewService,
    private applicationService: ApplicationService,
    private listviewService: ListviewService,
    private lotsearchService: LotSearchService,
    private authenticationService: AuthenticationService,
    private msg: MessageService,
    private titleService: Title,
    private dmoControlService: DmoControlService,
    public saleservice: SalesService,
    private toastr: ToastrService,
    private userDetail: UserDetail
  ) { }

  ngOnInit() {
    this.currentUser = this.userDetail;
    sessionStorage.setItem('AppName', 'LMKLivestockSales');
    sessionStorage.setItem('DisplayName', 'Livestock Sales');
    this.processName = sessionStorage.getItem('AppName');
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('id');

      this.formViewService.getBmWfJson(this.processName, 'AdminView', this.transactionId).subscribe(response => {
        this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
        this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).subscribe(applicationData => {
          this.applicationData = applicationData;
          if (applicationData.DataInformation 
            && applicationData.DataInformation.dmocrmheaderinfocmpcode
            && applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL !='') {
            this.saleservice.saleCompanyCode = applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL.split(',');
          }
          if (applicationData.DataInformation 
            && applicationData.DataInformation.dmocrmheaderinfocmpcode
            && applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL !=''
             && applicationData.DataInformation.dmocrmhinfocondcmpcode) {
              // if(applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL == this.userDetail.UserID){
              //   this.saleservice.IsAllowInvoiceFinalize = true;
              // }
              this.saleservice.IsAllowInvoiceFinalize = 
              this.saleservice.IsAllowForCondutingBranch(applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL,
                applicationData.DataInformation.dmocrmhinfocondcmpcode.DMOVAL);

              // var CompCode=applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL;
              // var conductingBranchCompCode=applicationData.DataInformation.dmocrmhinfocondcmpcode.DMOVAL;
              // if(CompCode.indexOf(',')>-1){       
              //   const distinctCompCode = CompCode.split(',').reduce((acc, value) => {
              //     return !acc.includes(value) ? acc.concat(value) : acc
              // }, []).join(',');  
              // if(distinctCompCode==conductingBranchCompCode){
              //   this.saleservice.IsAllowInvoiceFinalize = true;
              // } else if(distinctCompCode.split(',').indexOf(conductingBranchCompCode)>-1){    
              //   this.userDetail.ListRole.forEach(role => {
              //     if(role=='lmklivestockconductingbranchsales')
              //     this.saleservice.IsAllowInvoiceFinalize = true;
              //   });
              // }               
              // }else if(CompCode==conductingBranchCompCode){
              //   this.saleservice.IsAllowInvoiceFinalize = true;
              // }
              this.CompCode = applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL;
              this.CondCompCode = applicationData.DataInformation.dmocrmhinfocondcmpcode.DMOVAL;

          }
          this.saleservice.setSaleTransactionType(this.applicationData.DataInformation.dmocrmheaderinftrantype.DMOVAL.split('~~~')[0]);
          this.checkIfBuyerBranchRebateUpdatedOnSaleHeader();
          // get stages
          this.get_stages();
          // get header informations
          this.get_header_informations();
        }
        );
      }
      );

    });
    if (sessionStorage.getItem('DisplayName')) {
      const processtitle = sessionStorage.getItem('DisplayName');
      this.titleService.setTitle('Nutrien | ' + processtitle);
    }
    this.checkRoleExists();
  }
  checkRoleExists() {
    this.userDetail.ListRole.forEach(role => {
      if(environment.saleTriggerRole.indexOf(role) > -1){
        this.isTriggerRole = true;
      }
    })
  }

  isDate(value: string) {
    const regex = /([0-9]){1,2}\/([0-9]{2})\/([0-9]){4}/;
    return value.match(regex);
  }

  show_delete_msg() {
    this.msg.showMessage('Warning', {
      header: 'Delete Sale Record',
      body: 'Are you sure you want to delete this sale?',
      btnText: 'Confirm Delete',
      checkboxText: 'Yes, delete this sale',
      isDelete: true,
      callback: this.deleteSelectedConfirmation,
      caller: this,
    })
  }

  deleteSelectedConfirmation(modelRef: NgbModalRef, Caller: SalesDetailViewComponent) {
    Caller.listviewService.deleteGridData(Caller.transactionId).subscribe(data => {
      Caller.router.navigate(['/crm/sales']);
    });
  }

  edit_sale_header() {
    const modalRef = this.modalService.open(SalesFormViewModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
    const modalInstance: SalesFormViewModalComponent = modalRef.componentInstance;
    modalInstance.data = this.applicationData;
    modalInstance.transactionId = this.transactionId;
    modalInstance.stage = this.currentStage;
    modalInstance.CompCode = this.applicationData.DataInformation.dmocrmheaderinfocmpcode.DMOVAL;
    modalInstance.CondCompCode = this.applicationData.DataInformation.dmocrmhinfocondcmpcode.DMOVAL;
    modalRef.result.then((result: boolean) => {
      if (result) {
        this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).subscribe(applicationData => {
          this.applicationData = applicationData;
          this.checkIfBuyerBranchRebateUpdatedOnSaleHeader();
          this.get_header_informations();
        });
      }
    }, (reason) => {
    }
    );
  }

  checkIfBuyerBranchRebateUpdatedOnSaleHeader() {
    if (this.applicationData.DataInformation.dmocrmintbuybrcrebrate && this.applicationData.DataInformation.dmocrmintbuybrcrebrate.DMOVAL) {
      this.saleservice.isBuyerBranchRebateUpdatedOnSaleHeader = true;
    } else {
      this.saleservice.isBuyerBranchRebateUpdatedOnSaleHeader = false;
    }
  }

  save_record() {
    this.lotsGridViewComponent.triggerSave();
  }

  get_stages() {
    this.listviewService.stageList(this.processName).subscribe(data => {
      this.stages = data;
      if (this.applicationData.DataInformation.dmgcrmheaderinfosalerev &&
        this.applicationData.DataInformation.dmgcrmheaderinfosalerev.DMOVAL != null &&
        this.applicationData.DataInformation.dmgcrmheaderinfosalerev.DMOVAL !== '') {
        if (this.applicationData.ApplicationInfo[0].StageFriendlyName === SaleStage.Inprocess) {
          this.currentStage = SaleStage.ReversalProcess;
        } else if (this.applicationData.ApplicationInfo[0].StageFriendlyName === SaleStage.Finalised) {
          this.currentStage = SaleStage.ReversalCompleted;
        }
      } else {
        this.currentStage = this.applicationData.ApplicationInfo[0].StageFriendlyName;
        this.stages.forEach(stage => {
          if (stage.GUID === this.applicationData.ApplicationInfo[0].StagGuid) {
            stage.active = true;
          }
        });
      }

      this.check_btns_status();
    });

  }

  check_btns_status() {
    this.isFinalised = this.currentStage === SaleStage.Finalised;
    this.isReversalProcess = this.currentStage === SaleStage.ReversalProcess;
    this.isReversalCompleted = this.currentStage === SaleStage.ReversalCompleted;
    this.isInvoiceSaleBtnVisible = this.currentStage === SaleStage.Inprocess;
    this.isFinaliseBtnVisible = this.currentStage === SaleStage.Inprocess || this.currentStage === SaleStage.Invoiced;
    this.isDelBtnActivated = this.currentStage === SaleStage.Inprocess;
  }

  Update_Stage_Confirmation(stageName: SaleStage) {
    if(stageName == SaleStage.Finalised || stageName == SaleStage.Invoiced) {
      let BodyMsg = '';
      if(stageName == SaleStage.Finalised){
        BodyMsg = 'Please complete all mandatory fields in order to "Finalise" this sale';
      } else {
        BodyMsg = 'Please complete all mandatory fields in order to "Invoice" the sale';
      }
      if(this.applicationData['DataInformation']['dmocrmheaderinftrantype']['DMOVAL'] == '' || this.applicationData['DataInformation']['dmocrmheaderinfsaletype']['DMOVAL'] == ''){
        this.msg.showMessage('Fail', {
          header: ' ',
          body: BodyMsg,
          btnText: 'Ok',
          isConfirmation: true,
          caller: this,
        })
        return;
      }
    }
    if (this.lotsGridViewComponent.IsAddNewRow === true || this.lotsGridViewComponent.tableData.filter(rowItem => rowItem.isEdit).length) {
      this.msg.showMessage('Warning', {
        header: 'Confirmation Message',
        body: 'There is unsaved data. Are you sure you want to move forward?',
        btnText: 'Yes',
        isConfirmation: true,
        caller: this,
      }).result.then(result => {
        if (result)
          this.update_stage(stageName);
      });
    } else {
      this.update_stage(stageName);
    }
  }
  update_stage(stageName: SaleStage) {


    this.stageName = stageName;
    if (this.stageName === SaleStage.ReversalCompleted) {
      this.msg.showMessage('Warning', {
        body: 'Are you sure you want to complete the reversal for this sale?',
        btnText: 'Yes',
        isConfirmation: true,
        isDelete: false,
        callback: this.complete_reversal,
        caller: this,
      });
    } else if (stageName === SaleStage.Invoiced) {
      this.msg.showMessage('Warning', {
        body: 'Are you sure you want to invoice this sale?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.confirme_update_stage,
        caller: this,
      });
    } else if (stageName === SaleStage.Finalised) {
      this.msg.showMessage('Warning', {
        body: 'Are you sure you want to finalise this sale?',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.confirme_update_stage,
        caller: this,
      });
    }
  }
  confirme_update_stage(modelRef: NgbModalRef, Caller: SalesDetailViewComponent) {
    Caller.lotsearchService.getsaleStageData(Caller.transactionId).subscribe(
      result => {
        if (result.IsAnyBlockCustomer) {
          Caller.msg.showMessage('Warning', { body: 'This Sale contains customers with blocked accounts', header: ' ' });
          Caller.lotsGridViewComponent.getGridData();
          return;
        }
        if (result.IsHobbyFarmer) {
          Caller.msg.showMessage('Warning', { body: 'Conflicting Hobby farmer and GST flags. Please review', header: ' ' });
          return;
        }
        if (result.Count > 0) {
          const params: any = {
            Identifier: {
              Name: null,
              Value: null,
              TrnsctnID: Caller.transactionId
            },
            ProcessName: Caller.processName,
            UserName: Caller.currentUser.UserName,
            Data: [{}]
          };
       
          if (Caller.stageName === SaleStage.Invoiced && result.LotStatus == false) {
            params.TriggerName = 'TRGR_PreProcessing_InvoiceSale';
            Caller.IsLot = true;
          } else if (Caller.stageName === SaleStage.Finalised && result.LotStatus == false) {
            Caller.IsLot = true;
            if (Caller.currentStage === SaleStage.Inprocess) {
              params.TriggerName = 'TRGR_PreProcessing_FinaliseSale';
            } else if (Caller.currentStage === SaleStage.Invoiced) {
              params.TriggerName = 'TRGR_Invoiced_FinaliseSale';
            }
          }
          if (Caller.IsLot === true) {
            let UpdateSaleTrack = false;
            if(Caller.headerInformations['DMOCRM_HeaderInf_ContID'] && Caller.headerInformations['DMOCRM_HeaderInf_ContID'].DMOVAL){
              UpdateSaleTrack = true;
            }
            let trgName = ''
            if (Caller.stageName === SaleStage.Invoiced && result.LotStatus == false) {
              trgName = 'TRGR_PreProcessing_InvoiceSale';
              Caller.IsLot = true;
            } else if (Caller.stageName === SaleStage.Finalised && result.LotStatus == false) {
              Caller.IsLot = true;
              if (Caller.currentStage === SaleStage.Inprocess) {
                trgName = 'TRGR_PreProcessing_FinaliseSale';
              } else if (Caller.currentStage === SaleStage.Invoiced) {
                trgName = 'TRGR_Invoiced_FinaliseSale';
              }
            }
            const fBody = {
              userName: Caller.currentUser.UserName,
              saleTransactionID: Caller.transactionId,
              stage: Caller.stageName,
              IsUpdateSaleTrack: UpdateSaleTrack,
              TriggerName: trgName
            }
            Caller.saleservice.finalizeProcess(fBody).subscribe(res=>{
              Caller.applicationService.getApplicationData(null, null, 'AdminView', Caller.transactionId).subscribe(
                applicationData => {
                  Caller.applicationData = applicationData;
                  Caller.currentStage = Caller.applicationData.ApplicationInfo[0].StageFriendlyName;
                  Caller.SalesDocumentsComponent.stage = Caller.currentStage;
                  Caller.SalesVendorTermsComponent.stage = Caller.currentStage;
                  Caller.check_btns_status();
                  Caller.stages.forEach(stage => {
                    stage.active = false;
                    if (stage.GUID === Caller.applicationData.ApplicationInfo[0].StagGuid) {
                      stage.active = true;
                    }
                  });
                  
                  if (Caller.currentTabselected === 'Vendor Terms') {
                    Caller.SalesVendorTermsComponent.reloadData();
                  }
                  if (Caller.currentTabselected === 'Documents') {
                    Caller.SalesDocumentsComponent.reloadData();
                  }
                });              

                if(res) printJS({ printable: res, type: 'pdf', base64: true });
            });
            // Caller.applicationService.updateApplication(params).subscribe(
            //   response => {
           
            //     Caller.applicationService.getApplicationData(null, null, 'AdminView', Caller.transactionId).subscribe(
            //       applicationData => {
            //         Caller.applicationData = applicationData;
            //         Caller.currentStage = Caller.applicationData.ApplicationInfo[0].StageFriendlyName;

            //         Caller.stages.forEach(stage => {
            //           stage.active = false;
            //           if (stage.GUID === Caller.applicationData.ApplicationInfo[0].StagGuid) {
            //             stage.active = true;
            //           }
            //         });
            //         const bodyDataVendor = {
            //           SaleTransactionID: Caller.transactionId,
            //           LotTransactionID: 0
            //         };
            //         Caller.saleservice.AddVendorTermsData(bodyDataVendor).subscribe(x => {
            //           Caller.check_btns_status();
            //           if (Caller.stageName === SaleStage.Invoiced && result.LotStatus == false) {
            //             Caller.saleservice.invoiceReport(Caller.transactionId).subscribe(d => {
            //               const bodyGlData= {
            //                 saleTransactionID: Caller.transactionId,
            //                 documentNumber: "",
            //                 regenerateXML: true,
            //                 isPingTest: false,
            //                 saleStage: SaleStage.Invoiced
            //               }
            //               //Caller.saleservice.PostGLXmlForSale(bodyGlData).toPromise();
            //               if (Caller.currentTabselected === 'Documents') {
            //                 Caller.SalesDocumentsComponent.reloadData();
            //               }
            //             });
            //           } else if (Caller.stageName === SaleStage.Finalised && result.LotStatus == false) {
            //             Caller.saleservice.finalizeReport(Caller.transactionId).subscribe(d => {
            //               if (Caller.currentTabselected === 'Documents') {
            //                 Caller.SalesDocumentsComponent.reloadData();
            //               }
            //               if(Caller.headerInformations['DMOCRM_HeaderInf_ContID'] && Caller.headerInformations['DMOCRM_HeaderInf_ContID'].DMOVAL){
            //                 Caller.saleservice.updateSaleTrack(Caller.transactionId).subscribe(x => { });
            //               }
            //               const bodyGlData= {
            //                 saleTransactionID: Caller.transactionId,
            //                 documentNumber: "",
            //                 regenerateXML: true,
            //                 isPingTest: false,
            //                 saleStage: SaleStage.Finalised
            //               }
            //              // Caller.saleservice.PostGLXmlForSale(bodyGlData).toPromise();
            //             });                        
            //           }
            //           if (Caller.currentTabselected === 'Vendor Terms') {
            //             Caller.SalesVendorTermsComponent.reloadData();
            //           }

            //         });
            //       });
            //   });

            Caller.IsLot = false;
          } else {
            Caller.msg.showMessage('Warning', { body: 'All lots must be complete in order to proceed' });
          }
        } else {
          Caller.msg.showMessage('Warning', { body: 'This sale should have at least one lot' });
        }
      });
  }

  complete_reversal(modelRef: NgbModalRef, Caller: SalesDetailViewComponent) {
    const loginUser = Caller.userDetail;

    const submitData: any = {
      Identifier: {
        Name: null,
        Value: null,
        TrnsctnID: Caller.transactionId
      },
      ProcessName: Caller.processName,
      TriggerName: 'TRG_PreProcessing_Revers',
      UserName: Caller.currentUser.UserName,
      Data: [{}]
    };
    submitData.Data = [{ DMOCRMHIFinalizeDate: Caller.saleservice.getCurrentDateTime(loginUser.TimeZone) }]
    Caller.applicationService.updateApplication(submitData).subscribe(res => {
      Caller.saleservice.confirmReversal(Caller.transactionId).subscribe(
        result => {
          Caller.saleservice.completeReversal(Caller.transactionId).subscribe(x=>{
          Caller.applicationService.getApplicationData(null, null, 'AdminView', Caller.transactionId).subscribe(applicationData => {
            Caller.applicationData = applicationData;
            Caller.currentStage = SaleStage.ReversalCompleted;           
            Caller.check_btns_status();
            Caller.lotsGridViewComponent.SelectedRecordIds = [];
            Caller.lotsGridViewComponent.selectedAll = false;
            Caller.lotsGridViewComponent.getGridData();
            Caller.SalesDocumentsComponent.stage = SaleStage.ReversalCompleted;
            const bodyGlData= {
              saleTransactionID: Caller.transactionId,
              documentNumber: "",
              regenerateXML: true,
              isPingTest: false,
              saleStage: SaleStage.ReversalCompleted
            }
            // Caller.saleservice.PostGLXmlForReversalSale(bodyGlData).toPromise();
            Caller.SalesDocumentsComponent.reloadData();

          });
          });
        });
    });
  }

  get_header_informations() {
    this.BMJSON.List.forEach(bmoGuid => {
      this.BMJSON.BusinessModelObjects[bmoGuid].List.forEach(dmogGuid => {
        if (this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].DisplayName === 'Header Information') {
          this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].List.forEach(rowID => {
            this.BMJSON.BusinessModelObjects[bmoGuid].DataModelObjectGroups[dmogGuid].Rows[rowID].Columns.forEach(objCOLUMN => {
              objCOLUMN.List.forEach(dmoGUID => {
                if (this.applicationData.DataInformation[dmoGUID]) {
                  this.headerInformations[objCOLUMN.DataModelObjects[dmoGUID].Name] = {
                    DisplayName: objCOLUMN.DataModelObjects[dmoGUID].DisplayName,
                    DMOVAL: this.applicationData.DataInformation[dmoGUID].DMOVAL.toString().indexOf('~~~') > -1 ?
                      this.applicationData.DataInformation[dmoGUID].DMOVAL.split('~~~')[1] :
                      this.applicationData.DataInformation[dmoGUID].DMOVAL
                  };
                }
              });
            });
          });
        }
      });
    });

    if (this.headerInformations['DMOCRM_HeaderInf_SaleDate'] && this.headerInformations['DMOCRM_HeaderInf_SaleDate'].DMOVAL) {
      this.saleservice.SaleDate = this.headerInformations.DMOCRM_HeaderInf_SaleDate.DMOVAL;
    }
    if (this.headerInformations['DMOCRM_HeaderInf_SaleProc'] && this.headerInformations['DMOCRM_HeaderInf_SaleProc'].DMOVAL) {
      this.SaleProcessorIds = this.headerInformations.DMOCRM_HeaderInf_SaleProc.DMOVAL;
    }
  }

  go_back() {
    if (this.lotsGridViewComponent.IsAddNewRow === true || this.lotsGridViewComponent.tableData.filter(rowItem => rowItem.isEdit).length) {
      this.msg.showMessage('Warning', {
        header: 'Confirmation Message',
        body: 'There is unsaved data prior to directing them to the Livestock Sales data grid',
        btnText: 'Yes',
        isConfirmation: true,
        callback: this.homeRedirectionConfirmation,
        caller: this,
      })
    } else {
      this.router.navigate(['/crm/sales']);
    }

  }

  homeRedirectionConfirmation(modelRef: NgbModalRef, Caller: SalesDetailViewComponent) {
    Caller.router.navigate(['/crm/sales']);
  }

  ReverseSalePopup(ReverseSaleModel) {
    if (this.selectedRecords.length > 0) {
      for (const id of this.selectedRecords) {
        const selectedLot = this.lotsData.filter(item => item[this.lotKeyColumn] === id)[0];
        if (selectedLot.dmolotlotinfostatus === 'skyblue') {
          this.msg.showMessage('Warning', { body: 'The selected lot(s) cannot be reversed' });
          // this.msg.showErrorMessage('The selected lot(s) cannot be reversed', 'Message', 'Ok', null, false, true, false, '');
          return false;
        }
      }
      this.modalService.open(ReverseSaleModel, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false, size: 'lg' });
    }
  }

  ReverseSale(formvalue: any) {
    this.dmoControlService.GetPlasmaId('DMOCRM_HeaderInf_SaleID').subscribe(res1 => {
      const body = {
        transactionID: this.transactionId,
        saleId: res1.PlasmaID,
        saleReversalType: formvalue.ReverseType
      };
      this.saleservice.createDuplicateSale(body).subscribe(res2 => {
        if (res2.status === 'success') {
          this.saleservice.copyLots(this.transactionId, res2.transactionID, this.selectedRecords.toString()).subscribe(res3 => {
            this.modalService.dismissAll();
            this.lotsGridViewComponent._bodyData.ParentTransactionId = res2.transactionID;
            this.lotsGridViewComponent._bodyData.PageNumber = 0;
            this.lotsGridViewComponent.SelectedRecordIds = [];
            this.lotsGridViewComponent.selectedAll = false;
            this.lotsGridViewComponent.getGridData();
            this.router.navigate(['/crm/sales', res2.transactionID]);
          });
        } else {
          this.toastr.error('There is an error!');
          this.modalService.dismissAll();
        }
      });
    });
  }
  public textSepratorHover(data, separator) {
    if (data) {
      const ar = data.split(separator);
      if (ar.length > 1) {
        return ar;
      }
      return data;
    }
  }

  tabSelected(tabName: string) {
    this.currentTabselected = tabName;
    if (tabName === 'Sale Summary') {
      this.salesSummaryComponent.reloadData();
    }
    if (tabName === 'Vendor Terms') {
      this.SalesVendorTermsComponent.reloadData();
    }
    if (tabName === 'Documents') {
      this.SalesDocumentsComponent.reloadData();
    }
  }
  CalculateSale() {
    this.msg.showMessage('Warning',{body: 'Are you sure you want to calculate sale.',header: ' ', isConfirmation: true,btnText: 'Yes'}).result.then(async result=> {
      if (result) {
        const bodyData = {
          SaleTransactionID: this.transactionId,
          RecalcCharges: true,
          RecalcVendorCommission: true,
          isCalculateSale: this.currentStage === SaleStage.Inprocess ? 0 : 1
        };
        this.saleservice.calculateSale(bodyData).subscribe(x => {
            this.toastr.success('Calculate sale successfully.');
            if (this.currentTabselected === 'Vendor Terms') {
              this.SalesVendorTermsComponent.reloadData();
            }
            if (this.currentTabselected === 'Sale Summary') {
              this.salesSummaryComponent.reloadData();
            }
            if (this.currentTabselected == undefined || this.currentTabselected === 'Lot Summary') {
              this.lotsGridViewComponent.getGridData();
            }
          })
      }
    })
  }
}

