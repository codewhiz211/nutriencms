import { Injectable } from '@angular/core';
import { ApiLmkService } from '@app/core/services/api-lmk.service';
import { BehaviorSubject } from 'rxjs';
import { element } from 'protractor';



@Injectable({
  providedIn: 'root'
})
export class LotService {

  VendorCartage = ['CV', 'SUV', 'AGV', 'AUCV', 'DIPV', 'FEEV', 'RAFRV', 'SEV', 'STIV', 'STSDV', 'WGHV', 'PASC','PASH','PASS','PASP','PASA','PASO','PASD','DOA','NCVS','PASG','NCVC'];
  BuyerCartage = ['CB', 'SUB', 'AGB', 'DIPB', 'FEEB', 'RAFRB', 'SEB', 'STIB', 'STSDB', 'WGHB','AUCB','SEB'];
        
  private LotControlGuidForTaxAmd: any[];
  private LotControNameForTaxAmd: any[];
  constructor(private lmkservice: ApiLmkService) { 
    this.LotControlGuidForTaxAmd = ['dmolotvinfovendorpic', 'dmolotbinfobuyerid', 'dmolotbinfobuyername', 'dmolotbinfobuyerpic', 'dmolotbinfoinvoiceref', 'dmolotlotinfosalenum',
    'dmolotlotinfoqnty', 'dmolotlotinfopdct', 'dmolotlotinfoproddesc', 'dmolotlotinfopricephd', 'dmolotlotinfopricecpkg', 'dmolotlotinfowtkg', 'dmolotlotinfoturnovaud', 
    'dmolotlotinfolotnum','dmolotlotinfogst'];
    this.LotControNameForTaxAmd = ['DMOLot_VInfo_VendorPic', 'DMOLot_BInfo_BuyerId', 'DMOLot_BInfo_BuyerName', 'DMOLot_BInfo_BuyerPic', 'DMOLot_BInfo_InvoiceRef',
    'DMOLot_LotInfo_Qnty', 'DMOLot_LotInfo_Pdct', 'DMOLot_LotInfo_ProdDesc', 'DMOLot_LotInfo_Price$PHd', 'DMOLot_LotInfo_PriceCPKg', 'DMOLot_LotInfo_WtKg', 'DMOLot_LotInfo_TurnovAUD', 
    'DMOLot_LotInfo_LotNum', 'DMOLot_LotInfo_GST'];
  }
  lotId = '';
  // Observable navItem source
  private _navItemSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  navItem$ = this._navItemSource.asObservable();

  // service command
  changeNav() {
    this._navItemSource.next(true);
  }
  public getAgentCommission(trnId) {
    return this.lmkservice.get(`crmlot/getLotAgentAgency?transactionID=${trnId}`, null);
  }
  public addLotAgentAgency(body: any) {
    return this.lmkservice.post('crmlot/addLotAgentAgency', body, null);
  }
  public addLotAgentAgencyShared(body: any) {
    return this.lmkservice.post('crmlot/addLotAgentAgencyShared', body, null);
  }
  public deleteLotAgentAgency(lotAgentCommissionId: any) {
    return this.lmkservice.post(`crmlot/deleteLotAgentAgency?lotAgentCommissionId=${lotAgentCommissionId}`, null);
  }
  public getSharedAgentAgency(body: any) {
    return this.lmkservice.post('crmlot/getSharedAgentAgency', body, null);
  }
  public saveAutoLotAgentAgency(body: any) {
    return this.lmkservice.post('crmlot/saveAutoLotAgentAgency', body, null);
  }
  public removeAgencyAssociation(TranId: any) {
    return this.lmkservice.post(`crmlot/bulkDeleteLotAgentAgency?lotsTranId=${TranId}`,  null);
  }
  public calculateFeeAndCharges(body: any) {
    return this.lmkservice.post(`crmlot/calcLotFeesChargesById`, body,  null);
  }
  public changeLotStatus(body: any) {
    return this.lmkservice.post(`crmlot/ChangeLotStatusById`, body,  null);
  }
  public getGstRate() {
    return this.lmkservice.get('crmlot/getGstRate', null);
  }
  isChangeValueForNameTaxAmd(term: string) {
    return this.LotControNameForTaxAmd.includes(term);
  }
  isChangeValueForGuidTaxAmd(term: string) {
    return this.LotControlGuidForTaxAmd.includes(term);
  }
  public AddChangesLot(body: any) {
    return this.lmkservice.post(`crmlot/AddChangesLot`, body,  null);
  }
  // Update Lot econtract id with opces lot trnsctnid
  public updateeContractLot(body: any) {
    return this.lmkservice.post(`crmsales/updateEcontractLotTrnsctnId`, body,  null);
  }
  round(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
      return Math.round(value);
  
    value = +value;
    exp = +exp;
  
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
      return NaN;
  
    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
  
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
  }
}
