import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { WoolSearchService } from '../wool-search.service';

import { ReceivalsComponent } from '../grids/receivals/receivals.component';
import { UnsoldWoolComponent } from '../grids/unsold-wool/unsold-wool.component';
import { AppraisalComponent } from '../grids/appraisal/appraisal.component';
import { InterimSalePriceAdviceComponent } from '../grids/interim-sale-price-advice/interim-sale-price-advice.component';
import { TestResultComponent } from '../grids/test-result/test-result.component';
import { SoldWoolComponent } from '../grids/sold-wool/sold-wool.component';
import { SaleSummaryComponent } from '../grids/sale-summary/sale-summary.component';
import { BaleDetailModalComponent } from '../bale-detail-modal/bale-detail-modal.component';
import { SoldRehandleWoolComponent } from '../grids/sold-rehandle-wool/sold-rehandle-wool.component';
import { SoldAppraisalComponent } from '../grids/sold-appraisal/sold-appraisal.component';
import { SoldTestResultComponent } from '../grids/sold-test-result/sold-test-result.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-wool-search',
  templateUrl: './wool-search.component.html',
  styleUrls: ['./wool-search.component.scss']
})
export class WoolSearchComponent implements OnInit {

  @ViewChild(ReceivalsComponent) private receivalsComponent: ReceivalsComponent;
  @ViewChild(UnsoldWoolComponent) private unsoldWoolComponent: UnsoldWoolComponent;
  @ViewChild(AppraisalComponent) private appraisalComponent: AppraisalComponent;
  @ViewChild(InterimSalePriceAdviceComponent) private interimSalePriceAdviceComponent: InterimSalePriceAdviceComponent;
  @ViewChild(TestResultComponent) private testResultComponent: TestResultComponent;
  @ViewChild(SoldWoolComponent) private soldWoolComponent: TestResultComponent;
  @ViewChild(SaleSummaryComponent) private saleSummaryComponent: SaleSummaryComponent;
  @ViewChild(SoldRehandleWoolComponent) private soldRehandleComponent: SoldRehandleWoolComponent;
  @ViewChild(SoldAppraisalComponent) private soldAppraisalComponent: SoldAppraisalComponent;
  @ViewChild(SoldTestResultComponent) private soldTestResultComponent: SoldTestResultComponent;

  searchForm: FormGroup;
  showSearchForm = false;
  isSearched = false;
  isActiveTab: string = 'Receivals'; // For Date Range Filters
  pageSizeOptions: number;

  regionOptions = [];
  divisionOptions = [];
  branchNameOptions = [];
  wamOptions = [];
  agentOptions = [];
  storageCenterOptions = [];
  activeGrid: any;
  globalSearchValue = '';
  appRoleCheck =0;
  formatter = (x: any) => x.dmocustmstrcustname2 === '' ? x.dmocustmstrcustname1  + ' (' + x.dmocustmstrsapno + ')' : x.dmocustmstrcustname1 +' (' + x.dmocustmstrcustname2 + ')' + ' (' + x.dmocustmstrsapno + ')';
  

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private woolSearchService: WoolSearchService,
    private router: Router) { }

  ngOnInit() {
    this.pageSizeOptions = 20;
    this.searchForm = this.fb.group({
      TradingName: [null],
      WoolNumber: [''],
      Brand: [''],
      SaleNumberId: [''],
      // LMK_Agent: [null],
      // LMK_Region: [null],
      // LMK_Division: [null],
      // LMK_BranchCode: [null],
      // LMK_WAM: [null],
      // LMK_Season: [null],
      // LMK_Sale_center: [''],
      // LMK_Storage_Center: [null],
      AgentCode: [null],
      Region: [null],
      Division: [null],
      BranchCode: [null],
      WAMCODE: [null],
      SaleSeason: [null],
      SaleNbrSellingCntr: [''],
      SaleNbrStorageCntr: [null],
      fromDate: [null],
      toDate: [null]
    });
    const url = (this.router.url).split('/');
    if (url[1] === 'wool' && url[2] === 'search') {
      this.woolSearchService.checkAppRole('LMKWoolSales').subscribe(data =>{
        this.appRoleCheck = data;
        if(this.appRoleCheck > 0){
          this.bindingDropDownLists();
        }
      });
    } 
    
  }

  bindingDropDownLists() {
    this.woolSearchService.getRegion()
      .subscribe(
        data => this.regionOptions = data
      );
    this.woolSearchService.getDivision()
      .subscribe(
        data => this.divisionOptions = data
      );
    this.woolSearchService.getLandmarkBranchName()
      .subscribe(
        data => this.branchNameOptions = data
      );
    this.woolSearchService.getWAM()
      .subscribe(
        data => this.wamOptions = data
      );
    this.woolSearchService.getAgent()
      .subscribe(
        data => this.agentOptions = data
      );
    this.woolSearchService.getStorageCenter()
      .subscribe(
        data => this.storageCenterOptions = data
      );
  }

  tradingNameSearch = (text$: Observable<string>) => {
    return this.woolSearchService.tradingNameSearch(text$);
  }

  toggle_search_form_show() {
    this.showSearchForm = !this.showSearchForm;
  }

  get filters() {
    return this.activeGrid && this.activeGrid.filters;
  }
// Change Advanced Search Control Condition -EQUAL - #725
// Change Condition for Date - #1081
  search() {
    this.isSearched = true;
    setTimeout(() => {
      if (!this.activeGrid) {
        this.activeGrid = this.receivalsComponent;
      }

      let global_filter = null;
      if (this.globalSearchValue === '') {
        delete this.filters['Global_Search~$~dmoName'];
      } else {
        global_filter = {
          GridConditions: [{
            Condition: 'CONTAINS',
            ConditionValue: this.globalSearchValue
          }
          ],
          DataField: 'dmoName',
          LogicalOperator: 'Or',
          FilterType: 'Global_Search'
        };
      }
      if (global_filter && Object.keys(global_filter).length !== 0) {
        this.filters['Global_Search~$~dmoName'] = global_filter;
      }

      for (let i in this.searchForm.value) {
        let advanced_filter = null;
        if (this.searchForm.value[i] != null && this.searchForm.value[i] !== '') {
          if (i === 'fromDate') {
            if(this.isActiveTab ==='Receivals'){
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'GREATER_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['fromDate'])
                }
              ],
              DataField: 'ReceivalDate',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
              };
            }
            else if(this.isActiveTab ==='Unsold'){
              advanced_filter = {
                GridConditions: [
                  {
                    Condition: 'GREATER_THAN_OR_EQUAL',
                    ConditionValue: this.formatDate(this.searchForm.value['fromDate'])
                  }
                ],
                DataField: 'SR_DateLotted',
                LogicalOperator: 'OR',
                FilterType: 'Column_Filter'
                };
              }else if(this.isActiveTab ==='SoldRehandle'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'GREATER_THAN_OR_EQUAL',
                      ConditionValue: this.formatDate(this.searchForm.value['fromDate'])
                    }
                  ],
                  DataField: 'SR_SaleDate',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                  };
                }else{
              advanced_filter = {
                GridConditions: [
                  {
                    Condition: 'GREATER_THAN_OR_EQUAL',
                    ConditionValue: this.formatDate(this.searchForm.value['fromDate'])
                  }
                ],
                DataField: 'SD_SaleDate',
                LogicalOperator: 'OR',
                FilterType: 'Column_Filter'
                };
            }
          } else if (i === 'toDate') {
            if(this.isActiveTab ==='Receivals'){
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'LESS_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['toDate'])
                }
              ],
              DataField: 'ReceivalDate',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          }
          else if(this.isActiveTab ==='Unsold'){
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'LESS_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['toDate'])
                }
              ],
              DataField: 'SR_DateLotted',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          }else if(this.isActiveTab ==='SoldRehandle'){
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'LESS_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['toDate'])
                }
              ],
              DataField: 'SR_SaleDate',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          }else{
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'LESS_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['toDate'])
                }
              ],
              DataField: 'SD_SaleDate',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
            }
          } else if (i === 'TradingName') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'CONTAINS',
                  ConditionValue: this.searchForm.value[i].dmocustmstrsapno
                }
              ],
              DataField: 'LMK_SAPNO',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else {
            if(this.isActiveTab ==='Receivals'){
              if(i === 'WoolNumber'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_WoolNo',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Brand'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_ClipBrand',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleSeason' || i === 'SaleNbrSellingCntr' || i === 'SaleNumberId' || i === 'SaleNbrStorageCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_WoolNo',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'BranchCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_BranchCode',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Region'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Region',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Division'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Division',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'AgentCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Agent_Code',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'WAMCODE'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_WAMCODE',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
            }
            if(this.isActiveTab ==='Unsold'){
              if(i === 'WoolNumber'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_WoolNumber',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Brand'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_ClipBrand',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleSeason'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_Season',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNbrSellingCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_SellingCentre',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNumberId'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_Number',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNbrStorageCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_StorageCentre',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'BranchCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_BranchCode',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Region'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Region',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Division'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Division',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'AgentCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Agent_Code',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'WAMCODE'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_WAMCODE',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
            }
            if(this.isActiveTab ==='Sold' || this.isActiveTab ==='SoldAppraisal' || this.isActiveTab ==='SoldTR'){
              if(i === 'WoolNumber'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_WoolNo',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Brand'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_ClipBrand',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleSeason'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_Season',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNbrSellingCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_SaleCentre',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNumberId'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_Number',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNbrStorageCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'EN_SD_StorageCentre',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'BranchCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_BranchCode',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Region'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Region',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Division'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Division',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'AgentCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Agent_Code',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'WAMCODE'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_WAMCODE',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
            }
            if(this.isActiveTab ==='SoldRehandle'){
              if(i === 'WoolNumber'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_WoolNo',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Brand'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'CL_ClipBrand',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleSeason'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'SR_SD_Season',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNbrSellingCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'SR_SD_SellingCentre',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNumberId'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'SR_SD_Number',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'SaleNbrStorageCntr'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'SR_SD_StorageCentre',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'BranchCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_BranchCode',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Region'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Region',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'Division'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Division',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'AgentCode'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_Agent_Code',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
              if(i === 'WAMCODE'){
                advanced_filter = {
                  GridConditions: [
                    {
                      Condition: 'EQUAL',
                      ConditionValue: this.searchForm.value[i]
                    }
                  ],
                  DataField: 'LMK_WAMCODE',
                  LogicalOperator: 'OR',
                  FilterType: 'Column_Filter'
                };
              }
            }
            // advanced_filter = {
            //   GridConditions: [
            //     {
            //       Condition: 'EQUAL',
            //       ConditionValue: this.searchForm.value[i]
            //     }
            //   ],
            //   DataField: i,
            //   LogicalOperator: 'OR',
            //   FilterType: 'Column_Filter'
            // };
          }
  
          this.filters['Advnaced_Filter~$~' + i] = advanced_filter;
        } else {
          delete this.filters['Advnaced_Filter~$~' + i];
        }
      }
  
      this.activeGrid.generateFilter();
    });
  }

  clear_all() {
    this.searchForm.reset();
    this.globalSearchValue = '';
    this.activeGrid.filters = {};
    this.activeGrid.pageNum = 1;
    for (const column of this.activeGrid.headerMap.config.header.columns) {
      const form = this.activeGrid.gridView.elRef.nativeElement.querySelector('#frm_' + column.objectKey);
      if (form.logicalOpt.type === 'hidden') {
          const allInput = form.getElementsByTagName('input');
          for (let i = 0; i < allInput.length; i++) {
              if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                  allInput[i].checked = false;
              }
          }
      } else {
          form.logicalOpt.value = 'Select...';
          form.filterValue1.value = '';
          form.filterValue2.value = '';
          form.ConditionOpt1.value = 'Select...';
          form.ConditionOpt2.value = 'Select...';
      }
    }
    this.activeGrid.generateFilter();
  }

  isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length > 0 ? false : true;
  }

  FilterList(item): string {
    return item.map(e => e.ConditionValue).join(',');
  }

  formatDate(date: any) {
    if (date) {
      return `${date.year}-${date.month}-${date.day}`;
    } else {
      return '';
    }
  }

  onFilterClear(columnName, filterType) {
    if (filterType === 'Global_Search') {
      this.globalSearchValue = '';
    } else if (filterType === 'Column_Filter') {
      const form = this.activeGrid.gridView.elRef.nativeElement.querySelector('#frm_' + columnName);
      if (form.logicalOpt.type === 'hidden') {
          const allInput = form.getElementsByTagName('input');
          for (let i = 0; i < allInput.length; i++) {
              if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                  allInput[i].checked = false;
              }
          }
      } else {
          form.logicalOpt.value = 'Select...';
          form.filterValue1.value = '';
          form.filterValue2.value = '';
          form.ConditionOpt1.value = 'Select...';
          form.ConditionOpt2.value = 'Select...';
      }
    }
    delete this.filters[filterType + '~$~' + columnName];
    this.activeGrid.generateFilter();
  }

  onAdvancedFilterClear(filterKey:any) {      
    delete this.filters[filterKey];
    this.searchForm.get(filterKey.split('Advnaced_Filter~$~')[1]).patchValue(null);  
    // if(dataField === 'SAPNO')
    //   dataField = 'TradingName';
    // delete this.filters['Advnaced_Filter~$~' + dataField];
    //   this.searchForm.get(dataField).patchValue(null);

    this.activeGrid.generateFilter();
  }


  tabSelected(tabName: string) {
    switch (tabName) {
      case 'Receivals':
        this.activeGrid = this.receivalsComponent;
        this.isActiveTab = 'Receivals';
        break;
      case 'Unsold Wool':
        this.activeGrid = this.unsoldWoolComponent;
        this.isActiveTab = 'Unsold';
        break;
      case 'Unsold Test Result':
        this.activeGrid = this.testResultComponent;
        this.isActiveTab = 'Unsold';
        break;
      case 'Unsold Appraisal':
        this.activeGrid = this.appraisalComponent;
        this.isActiveTab = 'Unsold';
        break;
      case 'Interim Sale Price Advice':
        this.activeGrid = this.interimSalePriceAdviceComponent;
        this.isActiveTab = 'Unsold';
        break;
      case 'Sold Wool':
        this.activeGrid = this.soldWoolComponent;
        this.isActiveTab = 'Sold';
        break;
      case 'Sale Summary':
        this.activeGrid = this.saleSummaryComponent;
        this.isActiveTab = 'Sold';
        break;
      case 'Sold Rehandle Wool':
        this.activeGrid = this.soldRehandleComponent;
        this.isActiveTab = 'SoldRehandle';
        break;
        
      case 'Sold Appraisal':
        this.activeGrid = this.soldAppraisalComponent;
        this.isActiveTab = 'SoldAppraisal';
        break;
        
      case 'Sold Test Result':
        this.activeGrid = this.soldTestResultComponent;
        this.isActiveTab = 'SoldTR';
        break;
    }
    this.search();
    //this.clear_all();
  }

  openBaleDetailModal(data: any) {
    const modalRef = this.modalService.open(BaleDetailModalComponent, { size: 'lg' });
    const modalInstance: BaleDetailModalComponent = modalRef.componentInstance;
    modalInstance.data = data;
  }
  WAMFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmowamwamfname.toLocaleLowerCase().indexOf(term) > -1 || item.dmowamwamlname.toLocaleLowerCase().indexOf(term) > -1 || item.dmowamwamcode.toLocaleLowerCase().indexOf(term) > -1;
  }
  BranchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmobranchbrname.toLocaleLowerCase().indexOf(term) > -1 || item.dmobranchbrcode.toLocaleLowerCase().indexOf(term) > -1 ;
  }
  StrogeCentreFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmowoolstrwoolstrdscr.toLocaleLowerCase().indexOf(term) > -1 || item.dmowoolstrwoolstrcode.toLocaleLowerCase().indexOf(term) > -1 ;
  }
  AgentFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmoagentagntname.toLocaleLowerCase().indexOf(term) > -1 || item.dmoagentagntid.toLocaleLowerCase().indexOf(term) > -1 ;
  }
  dateMasks(event: any) {
    var v = event.target.value;
    if (v.match(/^\d{2}$/) !== null) {
      event.target.value = v + '/';
    } else if (v.match(/^\d{2}\/\d{2}$/) !== null) {
      event.target.value = v + '/';
    } else if(v > 7){
      event.target.value = v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }
  }			
}
