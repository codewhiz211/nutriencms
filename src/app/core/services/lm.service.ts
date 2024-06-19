import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { forkJoin, NEVER, combineLatest, Observable } from 'rxjs';
import { 
  startWith, 
  debounceTime, 
  distinctUntilChanged, 
  tap, 
  switchMap,       
  withLatestFrom, 
  skip, 
  map, 
  filter, 
  takeWhile, 
  combineLatest as combineLatestOperator,
  skipWhile
} from 'rxjs/operators';

import { SearchService } from './search.service';

const CALCULATION_DEBOUNCE = 300;
const SEARCH_INPUT_DEBOUNCE = 1000;
const DROPDOWN_DEBOUNCE = 0;

@Injectable({providedIn: 'root'})
export class LMService implements OnDestroy{
  public lmActive: boolean = true;

  private cattleBreedsGrid: any[] = [];
  private sheepBreedsGrid: any[] = [];
  isTriggerClick: boolean = false;

  constructor(private search: SearchService) {}

  public unsubscribeFromEvents() {
    this.lmActive = false;
  }

  private customPipeforDropdownField(source: Observable<any>) {
    return source.pipe(
      debounceTime(SEARCH_INPUT_DEBOUNCE),
      distinctUntilChanged(),
      filter(value => value && value.trim().length > 0),
      map(value => value.trim()),
    );
  }

  public reactToSAPNoChanges(form: FormGroup) {
    const control = form.get('LMKESaleDMO_SAPAcctNumber');
    return control.valueChanges.pipe(
      startWith(control.value),
      this.customPipeforDropdownField,
      switchMap(value => this.search.getSAPInfo(value)),
    );
  }

  public reactToTradingNameChanges(form: FormGroup) {
    const control = form.get('LMKESaleDMO_TradingName');
    return control.valueChanges.pipe(
      startWith(control.value),
      this.customPipeforDropdownField,
      switchMap(value => this.search.getVendorInfo(value)),
    );
  }

  public reactToPostCodeChange(form: FormGroup) {
    const postcode = form.get('LMKOPESDMO_PostCode');
    return postcode.valueChanges.pipe(
      this.customPipeforDropdownField,
      switchMap(value => this.search.getLocationInfo(value)),
    );
  }

  public reactToTownChange(form: FormGroup) {
    const town = form.get('LMKOPESDMO_Town');
    return town.valueChanges.pipe(
      this.customPipeforDropdownField,
      switchMap(value => this.search.getLocationInfo(value)),
    );
  }

  public reactToListingTypeChange(form: FormGroup) {
    const control = form.get('LMKOPESDMO_LOListingType');

    return control.valueChanges.pipe(
      takeWhile(_ => this.lmActive),
      startWith(control.value),
      debounceTime(DROPDOWN_DEBOUNCE),
      distinctUntilChanged(),
      tap(value => this.disableLMControls(form)),
      switchMap(value => this.search.getProductCategoriesByListingType(value))
    ).subscribe()
  }

  public reactToProductCategoryChange(form: FormGroup) {           
    const listingType = form.get('LMKOPESDMO_LOListingType');
    // if (listingType && listingType.value) {
    const control = form.get('LMKOPESDMO_HdnLotProdCat');
      // if (control && control.value) {
    return control.valueChanges.pipe(
      takeWhile(_ => this.lmActive),
      startWith(control.value),
      debounceTime(DROPDOWN_DEBOUNCE),
      distinctUntilChanged(),
      tap(value => this.calculateNOHMouthed(value, form)),
      tap(value => this.calculateFrameSize(value, form)),
      tap(value => this.calculateSkinType(value, form)),
      //switchMap(value => this.search.getProductCategoryCodeByValue(value)),
      withLatestFrom(listingType.valueChanges.pipe(startWith(listingType.value))),
      switchMap(([category, listingTypeValue]) => {
        return forkJoin([
          this.search.getProductByProdCategoryCode(category, listingTypeValue),
          this.search.getBreedByProdCategoryCode(category, listingTypeValue)
        ]);
      }),
      skip(1),
      tap(next => {
        form.get('LMKOPESDMO_HdnLotProduct').reset();
        form.get('LMKOPESDMO_HdnLotBreed').reset();
        form.get('LMKESale_LOLotSex').reset();
      })
    ).subscribe();
      // }
    // }
  }

  public reactToProductChange(form: FormGroup) {    
    const control = form.get('LMKOPESDMO_HdnLotProduct');
    return control.valueChanges.pipe(
      takeWhile(_ => this.lmActive),
      startWith(control.value),
      debounceTime(DROPDOWN_DEBOUNCE),
      switchMap(value => {
        if (value) {
          return this.search.getProductSexByCategory(value).pipe(
            tap(data => {
              if (data.Data.length > 0) {
                form.get('LMKESale_LOLotSex').setValue(data.Data[0].dmoproductgender)
                form.get('LMKESale_LOLotSex').markAsDirty();
              } else {
                form.get('LMKESale_LOLotSex').reset();
              }
            })
          );
        }
        return NEVER;
      }),
    ).subscribe();
  }

  public populateVendorDetails(item: any, form: FormGroup) {    
    const name = !!item.dmocustmstrcustname2 === false ? item.dmocustmstrcustname1  : `${item.dmocustmstrcustname1} ${item.dmocustmstrcustname2}`;
    const sapNumber = item.dmocustmstrsapno;
    const city = item.dmocustmstraddrcity;
    const zip = item.dmocustmstraddrzip;
    const addressLine1 = item.dmocustmstraddrln1;
    const houseNumber = item.dmocustmstrhouseno;
    const domBranch = item.dmocustmstrcustdombranch;
    form.get('LMKESaleDMO_TradingName').setValue(name, { emitEvent: false });
    form.get('LMKESaleDMO_SAPAcctNumber').setValue(sapNumber, { emitEvent: false});
    form.get('LMKESaleDMO_VendorTown').patchValue(city);
    form.get('LMKESaleDMO_VendrPostcode').patchValue(zip);
    form.get('LMKESaleDMO_Address').patchValue(`${houseNumber} ${addressLine1}`); 
    const ddOptionKey = domBranch.lastIndexOf('(') > -1 ? domBranch.substr(domBranch.lastIndexOf('(') + 1).replace(')', '') : domBranch;                   
    const ddOptionValue =  domBranch.lastIndexOf('(') > -1 ? domBranch.substring(0,domBranch.lastIndexOf('(')) : domBranch;     
      form.get('LMKESale_VendrDomBrch').patchValue({ddOptionValue: ddOptionValue, ddOptionKey: ddOptionKey.replace(')','') });    
   //form.get('LMKESale_VendrDomBrch').patchValue(domBranch);    
    form.get('LMKESaleDMO_VendorPIC').reset();

    form.get('LMKESaleDMO_TradingName').markAsDirty();
    form.get('LMKESaleDMO_SAPAcctNumber').markAsDirty();
    form.get('LMKESaleDMO_VendorTown').markAsDirty();
    form.get('LMKESaleDMO_VendrPostcode').markAsDirty();
    form.get('LMKESaleDMO_Address').markAsDirty();
    form.get('LMKESale_VendrDomBrch').markAsDirty();

    if (sapNumber)
      this.search.getVendorPICs(sapNumber).toPromise();       
  }

  public populatePICField(form: FormGroup) {
    return this.search.PICList.pipe(
      takeWhile(_ => this.lmActive),
      skipWhile(numbers => numbers.length === 0),
      tap(numbers => {
        if (numbers.length === 1)
          form.get('LMKESaleDMO_VendorPIC').patchValue(numbers[0])
          form.get('LMKESaleDMO_VendorPIC').markAsDirty();
      }),
    )
  }

  public populatePostalDetails(item: any, form: FormGroup) {
    const town = form.get('LMKOPESDMO_Town');
    const postcode = form.get('LMKOPESDMO_PostCode');
    const state = form.get('LMKOPESDMO_TownState');
    town.patchValue(item.dmolcnlcncity, {emitEvent: false, onlySelf: true});
    postcode.patchValue(item.dmolcnlcnpcode, {emitEvent: false, onlySelf: true});
    state.patchValue(item.dmolcnlcnstate, {emitEvent: false, onlySelf: true});
    town.markAsDirty();
    postcode.markAsDirty();
    state.markAsDirty();
  }
  
  private calculateNOHMouthed(category: 'Cattle' | 'Sheep', form: FormGroup) {
    const hm2tControl = form.get('LMKOPESDMO_NoHeadsMouth2T');
    const hm4tControl = form.get('LMKOPESDMO_NoHeadsMouth4T');
    const hm6tControl = form.get('LMKOPESDMO_NoHeadsMouth6T');
    const hmWornControl = form.get('LMKOPESDMO_NoHdsMouthWorn');
    const hmBrokenControl = form.get('LMKOPESDMO_NoHdsMouthBkn');
    /* Cattle Specific */
    const hmMilkControl = form.get('LMKOPESDMO_NoHdsMouthMilk');
    const hm8tControl = form.get('LMKOPESDMO_NoHeadsMouth8T');
    /* Sheep specific */
    const hmLambControl = form.get('LMKOPESDMO_NoHdsMouthLmbs');
    const hmFullMouthControl = form.get('LMKOPESDMO_NoHeadsMouthFM');
    combineLatest(
      hm2tControl.valueChanges.pipe(startWith(hm2tControl.value)),
      hm4tControl.valueChanges.pipe(startWith(hm4tControl.value)),
      hm6tControl.valueChanges.pipe(startWith(hm6tControl.value)),
      hmWornControl.valueChanges.pipe(startWith(hmWornControl.value)),
      hmBrokenControl.valueChanges.pipe(startWith(hmBrokenControl.value)),
      hmMilkControl.valueChanges.pipe(startWith(hmMilkControl.value)),
      hm8tControl.valueChanges.pipe(startWith(hm8tControl.value)),
      hmLambControl.valueChanges.pipe(startWith(hmLambControl.value)),
      hmFullMouthControl.valueChanges.pipe(startWith(hmFullMouthControl.value)),
    ).pipe(
      takeWhile(_ => this.lmActive),
      debounceTime(CALCULATION_DEBOUNCE),
      map(values => values.map(value => +value | 0)), /* Convert to numbers */
      tap(([hm2t, hm4t, hm6t, hmWorn, hmBroken, hmMilk, hm8t, hmLamb, hmFullMouth]) => {
        let total = 0;
        total = hm2t + hm4t + hm6t + hmWorn + hmBroken;
        if (category === 'Cattle')
          total += hmMilk + hm8t;
        else
          total += hmLamb + hmFullMouth;
        form.get('LMKOPESDMO_NoHdsMouthTot').patchValue(total);
        form.get('LMKOPESDMO_NoHdsMouthTot').markAsDirty();
      }),

    ).subscribe();
  }

  private calculateFrameSize(category: 'Cattle' | 'Sheep', form: FormGroup) {
    const a = form.get('LMKOPESDMO_SheepFrameSizA');
    const b = form.get('LMKOPESDMO_SheepFrameSizB');
    const c = form.get('LMKOPESDMO_SheepFrameSizC');
    const d = form.get('LMKOPESDMO_SheepFrameSizD');
    const e = form.get('LMKOPESDMO_SheepFrameSizE');
    combineLatest(
      a.valueChanges.pipe(startWith(a.value)),
      b.valueChanges.pipe(startWith(b.value)),
      c.valueChanges.pipe(startWith(c.value)),
      d.valueChanges.pipe(startWith(d.value)),
      e.valueChanges.pipe(startWith(e.value)),
    ).pipe(
      takeWhile(_ => this.lmActive),
      filter(_ => category === 'Sheep'),
      debounceTime(CALCULATION_DEBOUNCE),
      map(sizes => sizes.map(size => +size | 0)), /* Convert to numbers */
      tap(sizes => {
        let total = 0;
        sizes.forEach(size => total += size);
        form.get('LMKOPESDMO_SheepFrameTot').patchValue(total);
        form.get('LMKOPESDMO_SheepFrameTot').markAsDirty();
      })
    ).subscribe();
  }

  private calculateSkinType(category: 'Cattle' | 'Sheep', form: FormGroup) {
    const plainControl = form.get('LMKOPES_SheepSkinTypePln');
    const lightControl = form.get('LMKOPES_ShpSkinTypeLight');
    const mediumControl = form.get('LMKOPES_SheepSkinTypeMed');
    const heavyControl = form.get('LMKOPES_SheepSkinTypeMed');
    combineLatest(
      plainControl.valueChanges.pipe(startWith(plainControl.value)),
      lightControl.valueChanges.pipe(startWith(lightControl.value)),
      mediumControl.valueChanges.pipe(startWith(mediumControl.value)),
      heavyControl.valueChanges.pipe(startWith(heavyControl.value)),
    ).pipe(
      takeWhile(_ => this.lmActive),
      filter(_ => category === 'Sheep'),
      debounceTime(CALCULATION_DEBOUNCE),
      map(types => types.map(type => +type | 0)), /* Convert to numbers */
      tap(types => {
        let total = 0;
        types.forEach(type => total += type);

      })
    ).subscribe();
  } 

  public calculateWeightDetails(data: any[], form: FormGroup): void {    
    const minWeightControl = form.get('LMKOPESDMO_Weightslowkg');
    const maxWeightControl = form.get('LMKOPESDMO_WeightsHighkg');
    const averageWeightControl = form.get('LMKOPESDMO_Averagekg');
    const estAvgDressWeightControl = form.get('LMKOPES_EstAvgDrssdWght');
    const estAvgLiveDeliveryWeightControl = form.get('LMKOPES_EstAvgLiveDelWght');
    const estAvgDressDeliveryWeightControl = form.get('LMKOPES_EstAvgDrssDelWght');
    const numberOfHeadsWeighed = form.get('LMKOPES_Numfheadsweighed');
    
    const categoryControl = form.get('LMKOPESDMO_HdnLotProdCat');
    const estDressingControl = form.get('LMKOPESDMO_Dressing');
    const estDaysToDeliveryControl = form.get('LMKOPESDMO_EstDaysToDlvry');
    const estWeightGainControl = form.get('LMKOPESDMO_EstWeightGain');
    const deliveryAdjustmentControl = form.get('LMKOPES_DelAdjustPercent');
    if (data.length > 0) {
  
      if (categoryControl && categoryControl.value) {
        categoryControl.valueChanges.pipe(
          takeWhile(_ => this.lmActive),
          startWith(categoryControl.value),
          combineLatestOperator(
            estDressingControl.valueChanges.pipe(startWith(estDressingControl.value)),
            estDaysToDeliveryControl.valueChanges.pipe(startWith(estDaysToDeliveryControl.value)),
            estWeightGainControl.valueChanges.pipe(startWith(estWeightGainControl.value)),
            deliveryAdjustmentControl.valueChanges.pipe(startWith(deliveryAdjustmentControl.value))
          ),
          debounceTime(CALCULATION_DEBOUNCE),
          map(([category, estDressing, estDaysToDelivery, estWeightGain, deliveryAdjustment]) => {
            return [category, +estDressing / 100, +estDaysToDelivery, +estWeightGain, +deliveryAdjustment / 100]
          }),
          tap(([category, estDressing, estDaysToDelivery, estWeightGain, deliveryAdjustment]) => {
            let minLiveWeight: number = data[0] ? +data[0].lmkopesdmowswdlivewght : 0;
            let maxLiveWeight: number = data[0] ? +data[0].lmkopesdmowswdlivewght : 0;
            let totalWeight = 0;
            let totalNumberOfhead = 0;
  
            data.forEach(row => {
              row.lmkopesdmowswdfatscore = row.lmkopesdmowswdfatscore || '';
              row.lmkopesdmowswdfatssheep = row.lmkopesdmowswdfatssheep || '';
              row.lmkopesdmowswdlivewght = row.lmkopesdmowswdlivewght || 0;
              row.lmkopesdmowswdnoofhead = row.lmkopesdmowswdnoofhead || 1;
              row.lmkopesshbreeddetnumhead = row.lmkopesshbreeddetnumhead || 1;
              
              // console.log(row)
              if (+row.lmkopesdmowswdlivewght > maxLiveWeight)
                maxLiveWeight = +row.lmkopesdmowswdlivewght;
              
              if (+row.lmkopesdmowswdlivewght < minLiveWeight)
                minLiveWeight = +row.lmkopesdmowswdlivewght;
            
              if (category === 'Cattle') {
                totalNumberOfhead++;
                totalWeight += +row.lmkopesdmowswdlivewght;
              } else {
                totalNumberOfhead += +row.lmkopesdmowswdnoofhead;
                totalWeight += +row.lmkopesdmowswdlivewght * +row.lmkopesdmowswdnoofhead;
              }
              
            });
            // console.log(totalWeight, totalNumberOfhead)
            const average = totalWeight / totalNumberOfhead;
            const estAverageLiveWeightAtDelivery = 
              (((estDaysToDelivery * estWeightGain) + average) * (-deliveryAdjustment)) + (average + (estDaysToDelivery * estWeightGain));
            const estAverageDressedWeightAtDelivery = 
            // ((estDaysToDelivery * estWeightGain + estAverageLiveWeightAtDelivery) * estDressing); /* FRD version */
            ((estDaysToDelivery * estWeightGain + average) * estDressing); /* Excel aka Andrew version */                       
            numberOfHeadsWeighed.patchValue(totalNumberOfhead);
            minWeightControl.patchValue(minLiveWeight.toFixed(2));
            maxWeightControl.patchValue(maxLiveWeight.toFixed(2));
            averageWeightControl.patchValue(average.toFixed(2));// No need to convert from number to string
            estAvgDressWeightControl.patchValue(this.convertCalc(+(average * estDressing)));
            estAvgLiveDeliveryWeightControl.patchValue(this.convertCalc(+estAverageLiveWeightAtDelivery));
            estAvgDressDeliveryWeightControl.patchValue(this.convertCalc(+estAverageDressedWeightAtDelivery));

            numberOfHeadsWeighed.markAsDirty();
            minWeightControl.markAsDirty();
            maxWeightControl.markAsDirty();
            averageWeightControl.markAsDirty();
            estAvgDressWeightControl.markAsDirty();
            estAvgLiveDeliveryWeightControl.markAsDirty();
            estAvgDressDeliveryWeightControl.markAsDirty();
          })
        ).subscribe();
      }
      
    } else {      
      numberOfHeadsWeighed.reset('');
      minWeightControl.reset('');
      maxWeightControl.reset('');
      averageWeightControl.reset('');
      estAvgDressWeightControl.reset('');
      estAvgLiveDeliveryWeightControl.reset('');
      estAvgDressDeliveryWeightControl.reset('');
      numberOfHeadsWeighed.markAsDirty();
      minWeightControl.markAsDirty();
      maxWeightControl.markAsDirty();
      averageWeightControl.markAsDirty();
      estAvgDressWeightControl.markAsDirty();
      estAvgLiveDeliveryWeightControl.markAsDirty();
      estAvgDressDeliveryWeightControl.markAsDirty();
    }
  }

  /* Converts any number to this format: 5 => 5.00, 234.1 => 234.10, => 1.234345 => 1.23 */
  private convertCalc(number: number) {
    if (number)
      return number.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  public disableLMControls(form: FormGroup) {
      /* Lot sex */
      const sex = form.get('LMKESale_LOLotSex');
      if (sex)
        sex.disable();
      /* Weight details */
      const average = form.get('LMKOPESDMO_Averagekg');
      const lowWeight = form.get('LMKOPESDMO_Weightslowkg');
      const highWeight = form.get('LMKOPESDMO_WeightsHighkg');
      const estAvgDressWeight = form.get('LMKOPES_EstAvgDrssdWght');
      const estAvgLiveDeliveryWeight = form.get('LMKOPES_EstAvgLiveDelWght');
      const estAvgDressDeliveryWeight = form.get('LMKOPES_EstAvgDrssDelWght');
      const quantity = form.get('LMKOPES_Numfheadsweighed');
      if (average)
        average.disable();
      if (lowWeight)  
        lowWeight.disable();
      if (highWeight)
        highWeight.disable();
      if (estAvgDressWeight)
        estAvgDressWeight.disable();
      if (estAvgLiveDeliveryWeight)
        estAvgLiveDeliveryWeight.disable();
      if (estAvgDressDeliveryWeight)
        estAvgDressDeliveryWeight.disable();
        if (quantity)
        quantity.disable();
      /* Landmark agent details */
      const agentName = form.get('LMKOPESDMO_AgentName');
      const agentEmail = form.get('LMKOPESDMO_AgentEmail');
      const agentPhone = form.get('LMKOPESDMO_AgentPhone');
      if (agentName)
        agentName.disable();
      if (agentEmail)
        agentEmail.disable();
      if (agentPhone)
        agentPhone.disable();
  }

  public enableLMControlsOnSubmit(form: FormGroup) {    
    form.get('LMKOPESDMO_Averagekg').enable();

    if (form.get('LMKOPESDMO_LOListingType').value === 'Classified') {
      const lowWeight = form.get('LMKOPESDMO_LDWghtRanLow').value;
      const highWeight = form.get('LMKOPESDMO_LDWghtRanHigh').value;
      if (lowWeight || highWeight) {
        form.get('LMKOPESDMO_Averagekg').setValue((+lowWeight + +highWeight) / 2);
        form.get('LMKOPESDMO_Averagekg').markAsDirty();
      }
    } else {
      //E-Saleyard ticket- #1730      
        // const startingPrice = form.get('LMKOPES_StartgPriceexGST').value;
        // form.get('LMKOPESDMO_CurrBidPrice').setValue(startingPrice);        
        // form.get('LMKOPESDMO_CurrBidPrice').markAsDirty();          
      /* Weight summary section fields must be enabled to be able to save them */
      form.get('LMKOPESDMO_Weightslowkg').enable();
      form.get('LMKOPESDMO_WeightsHighkg').enable();
      form.get('LMKOPES_EstAvgDrssdWght').enable();
      form.get('LMKOPES_EstAvgLiveDelWght').enable();
      form.get('LMKOPES_EstAvgDrssDelWght').enable();
      form.get('LMKOPES_Numfheadsweighed').enable();
    }
  }

  public retrieveGridData(data: any) {
    if (data.dmoGUID === 'lmkopesdmgsheepbrdngdet')
      this.sheepBreedsGrid = data.list;
    if (data.dmoGUID === 'lmkopesdmgcatlebrdngdet')
      this.cattleBreedsGrid = data.list;
  }

  public weightAndBreedGridsVerified(form: FormGroup) {
    const category = form.get('LMKOPESDMO_HdnLotProdCat').value;
    const quantity = form.get('LMKOPES_Numfheadsweighed').value;
    if (category === 'Sheep') {
      return quantity > 0 && this.sheepBreedsGrid.length > 0;
    } else if (category === 'Cattle') {
      return quantity > 0 && this.cattleBreedsGrid.length > 0;
    }
    return false;
  }

  ngOnDestroy() {
    this.lmActive = false;
  }
}