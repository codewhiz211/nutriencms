import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';

import { IHeaderMap, ColumnFilterService, ApiESaleyardService } from '@app/core';

import { CustomizedGridComponent } from '@app/shared';
import { environment } from '@env/environment';
import { LivestockService } from '../../services/livestock.service';
import { map } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { UserDetail } from '@app/core/models/user-detail';
import { Router } from '@angular/router';

@Component({
  selector: 'app-livestock-search',
  templateUrl: './livestock-search.component.html',
  styleUrls: ['./livestock-search.component.scss']
})
export class LivestockSearchComponent implements OnInit {

  @ViewChild(CustomizedGridComponent)
  private gridView: CustomizedGridComponent;

  searchForm: FormGroup;
  showSearchForm = false;
  isSearched = false;
  globalSearchValue = '';
  formatter = (x: any) => x.dmocustmstrcustname2 === '' ? x.dmocustmstrcustname1  + ' (' + x.dmocustmstrsapno + ')' : x.dmocustmstrcustname1 +' (' + x.dmocustmstrcustname2 + ')' + ' (' + x.dmocustmstrsapno + ')';

  dataSource: any = [];
  itemsCount: number;
  pageIndex:number=1;
  bodyData = {
    PageSize: 20,
    PageNumber: 1,
    SortColumn: 'TRNSCTNID',
    SortOrder: 'desc',
    GridFilters: []
  };
  appRoleCheck = 0;

  headerMap: IHeaderMap;
  agentHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'SAPNo',
            displayName: 'SAP #'
          },
          {
            objectKey: 'Agency',
            displayName: 'Agency'
          },
          {
            objectKey: 'Agents',
            displayName: 'Agents',
          },
          {
            objectKey: 'Activity',
            displayName: 'Activity'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };

  accountHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'dmocustmstrsapno',
            displayName: 'SAP#',
            width: '90px'
          },
          {
            objectKey: 'dmocustmstrprmsref',
            displayName: 'PRMS#',
            width: '90px'
          },
          {
            objectKey: 'dmocustmstrcustname1',
            displayName: 'Cust Name 1',
            width: '120px'
          },
          {
            objectKey: 'dmocustmstrcustname2',
            displayName: 'Cust Name2',
            width: '120px'
          },
          {
            objectKey: 'dmocustmstrsapactivflag',
            displayName: 'SAP Active',
            width: '120px'
          },
          {
            objectKey: 'dmocustmstrblockflg',
            displayName: 'Customer Block',
            width: '120px'
          },
          {
            objectKey: 'dmobranchbrname',
            displayName: 'Branch',
            width: '100px'
          },
          {
            objectKey: 'dmocustmstrcustabn',
            displayName: 'ABN',
            width: '90px'
          },
          {
            objectKey: 'dmocustmstremail',
            displayName: 'email',
            width: '120px'
          },
          {
            objectKey: 'dmocustmstrmobile',
            displayName: 'mobile phone no',
            width: '120px'
          },
          {
            objectKey: 'STREET',
            displayName: 'Street',
            width: '90px'
          },
          {
            objectKey: 'dmocustmstraddrcity',
            displayName: 'Suburb',
            width: '90px'
          },
          {
            objectKey: 'dmocustmstraddrstate',
            displayName: 'state',
            width: '100px'
          },
          {
            objectKey: 'dmocustmstraddrzip',
            displayName: 'post code',
            width: '100px'
          },
          {
            objectKey: 'dmocuspiccustpic',
            displayName: 'PIC#',
            dataType: 'TextWithSeparator',
            separator: ',',
            width: '100px'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };
   // Add new Form Livestock Documents Ticket - #1002
  livestockDocumentHeaderMap: IHeaderMap = {
    config: {
      header: {
        columns: [
          {
            objectKey: 'dmocrmheaderinfsaleid',
            displayName: 'Sale #'
          },
          {
            objectKey: 'dmocrmheaderinfsaledate',
            displayName: 'Sale Date',
            dataType: 'Date',
            format: environment.Setting.dateFormat,
            timeZone: this.userDetail.TimeZone.toString()
          },
          {
            objectKey: 'DocumentNumber',
            displayName: 'Document #',
            dataType: 'Link',
          },
          {
            objectKey: 'DocumentType',
            displayName: 'Document Type'
          },
          {
            objectKey: 'CustomerID',
            displayName: 'Sap No'
          },
          {
            objectKey: 'CustomerName',
            displayName: 'Trading Name'
          },
          {
            objectKey: 'dmocustmstrcustabn',
            displayName: 'ABN'
          },
          {
            objectKey: 'dmocrmheaderinftrantype_val',
            displayName: 'Transaction Type'
          },
          {
            objectKey: 'TotalAmountIncludingGST',
            displayName: 'Document Value'
          },
          {
            objectKey: 'DeliveryMode',
            displayName: 'Delivery Mode'
          },
          {
            objectKey: 'dmocrmheaderinfcndbrnc_val',
            displayName: 'Branch'
          }
        ],
        action: {
        },
        columnFilter: []
      },
      paging: true
    }
  };

  // livestockSaleHeaderMap: IHeaderMap = {
  //   config: {
  //     header: {
  //       columns: [
  //         {
  //           objectKey: 'TRANNSCTIONTYPEDESC',
  //           displayName: 'Transaction Type',
  //           width: '120px'
  //         },
  //         {
  //           objectKey: 'SALETYPEDESC',
  //           displayName: 'Sale Type',
  //           width: '110px'
  //         },
  //         {
  //           objectKey: 'SALEPROCESSOR',
  //           displayName: 'Sale Processor',
  //           width: '110px'
  //         },
  //         {
  //           objectKey: 'CONDUCTINGBRANCHNAME',
  //           displayName: 'Conducting Branch',
  //           width: '140px'
  //         },
  //         {
  //           objectKey: 'SALEYARDNAME',
  //           displayName: 'Sale Yard',
  //           width: '80px'
  //         },
  //         {
  //           objectKey: 'SALENUMBER',
  //           displayName: 'Sale Number',
  //           width: '80px'
  //         },
  //         {
  //           objectKey: 'STAGE',
  //           displayName: 'Stage',
  //           width: '90px'
  //         },
  //         // {
  //         //   objectKey: 'SAPNO',
  //         //   displayName: 'Sap Number',
  //         //   width: '110px'
  //         // },
  //         // {
  //         //   objectKey: 'VENDORTRDNAME',
  //         //   displayName: 'Vendor Trading Name',
  //         //   width: '150px'
  //         // },
  //         // {
  //         //   objectKey: 'BUYERTRDNAME',
  //         //   displayName: 'Buyer Trading Name',
  //         //   width: '150px'
  //         // },
  //         // {
  //         //   objectKey: 'VENDORBRANCH',
  //         //   displayName: 'Vendor Branch Name',
  //         //   width: '150px'
  //         // },
  //         // {
  //         //   objectKey: 'BUYERBRANCH',
  //         //   displayName: 'Buyer Branch',
  //         //   width: '110px'
  //         // },
  //         // {
  //         //   objectKey: '3RDPARTY',
  //         //   displayName: 'Third-Party',
  //         //   width: '110px'
  //         // },
  //         // {
  //         //   objectKey: 'AGENCY',
  //         //   displayName: 'Agency',
  //         //   width: '100px'
  //         // },
  //         // {
  //         //   objectKey: 'AGENT',
  //         //   displayName: 'Agent',
  //         //   width: '100px'
  //         // },
  //         // {
  //         //   objectKey: 'VENDORPIC',
  //         //   displayName: 'Vendor PIC',
  //         //   width: '110px'
  //         // },
  //         {
  //           objectKey: 'SALEDATE',
  //           displayName: 'Sale Date',
  //           dataType: 'Date',
  //           format: environment.Setting.dateFormat,
  //           timeZone: this.userDetail.TimeZone.toString(),
  //           width: '100px'
  //         }
  //         // {
  //         //   objectKey: 'QUANTITY',
  //         //   displayName: 'Quantity',
  //         //   width: '110px'
  //         // }
  //       ],
  //       action: {
  //       },
  //       columnFilter: []
  //     },
  //     paging: true
  //   }
  // };



  filters: any = {};
  selectedCategory = 'Livestock Document';


  // for Agent Search Form
  agentOptions = [];
  agencyOptions = [];
  activityOptions = ['Livestock', 'Wool', 'Insurance'];

  // for Account Search Form
  branchNameOptions = [];
  stateOptions = [];
  postCodeOptions = [];
  suburbOptions = [];

  // for livestock Sales Form
  transactionTypeOptions = [];
  saleTypeOptions = [];
  saleprocessorOptions = [];
  conductingBranchOptions = [];
  stageOptions = ['In Process', 'Invoiced', 'Finalised'];
  vendorBranchOptions = [];
  buyerBranchOptions = [];
 // vendorTradingNameOptions = [];
 // buyerTradingNameOptions = [];
  thirdPartyOptions = [];
  saleyardOptions = [];

  //For Livestock Documents Ticket #1002
  documentBranchOptions = [];
  documentTransactionTypeOptions=[];
  documenttypeOptions = [];

  formLoaded = {};


  constructor(
    private fb: FormBuilder,
    private columnFilter: ColumnFilterService,
    private livestockService: LivestockService,
    private apiESaleyardService: ApiESaleyardService,
    private toastr: ToastrService,
    private userDetail: UserDetail,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  populateForm(category: string) {
    if (category === 'Agent') {
      this.searchForm = this.fb.group({
        Agents: [null],
        SAPNo: [null],
        Activity: [null]
      });

      // populate dropdown options for Agent search form
      // Add new Form Livestock Documents Ticket - #1002
      if (this.formLoaded[category] !== true) {
        this.livestockService.getAgent()
          .subscribe(
            data => {
              this.agentOptions = data;
            }
          );

        this.livestockService.getAgency()
          .subscribe(
            data => {
              this.agencyOptions = data.map(x=>({
                dmoagencyagncname1: x['dmoagencyagncname1'].indexOf('(') > -1 ? x['dmoagencyagncname1'].substr(x['dmoagencyagncname1'].indexOf('(') + 1).replace(')', '') : x['dmoagencyagncname1'], 
                dmoagencyagncsapno: x['dmoagencyagncsapno'].indexOf('(') > -1 ? x['dmoagencyagncsapno'].split('(')[1].replace(')', '') : x['dmoagencyagncsapno']
                }));
            }
          )

        this.formLoaded[category] = true;
      }

      this.headerMap = this.agentHeaderMap;

    } else if (category === 'Account') {
      this.searchForm = this.fb.group({
        // SAPNO: [''],
        dmocustmstrsapno: [null],
        dmocustmstrlstkbranch: [null],
        dmocustmstremail: [''],
        dmocustmstraddrstate: [null],
        dmocustmstraddrzip: [null],
        dmocustmstrprmsref: [null],
        dmocustmstrcustabn: [null],
        dmocustmstrmobile: [''],
        dmocustmstraddrcity: [null],
        dmocuspiccustpic: ['']
      });

      // populate dropdown options for Account search form
      // Vendor & Buyer Trading Name Serarch Control Fix - #819
      if (this.formLoaded[category] !== true) {
        this.livestockService.getLandmarkBranchName()
          .subscribe(
            data => {
              this.branchNameOptions = data;
            }
          );
        this.livestockService.getLandmarkStatehName()
          .subscribe(
            data => {
              this.stateOptions = data;
            }
          );
        this.livestockService.getLandmarkPostCode()
          .subscribe(
            data => {
              this.postCodeOptions = data;
            }
          );
        this.livestockService.getLandmarkSuburb()
          .subscribe(
            data => {
              this.suburbOptions = data;
            }
          );
        this.formLoaded[category] = true;
      }

      this.headerMap = this.accountHeaderMap;

    } else if (category === 'Livestock Document') {
      this.searchForm = this.fb.group({
        SALEDOCUMENTFROMDATE: [''],
        SALEDOCUMENTTODATE: [''],
        TRADINGNAME: [null],
        CustomerID: [null],
        dmocustmstrcustabn: [null],
        dmocrmheaderinfsaleid: [null],
        dmocrmheaderinfcndbrnc: [null],
        dmocrmheaderinftrantype: [null],
        DOCUMENTNUMBER: [''],
        DOCUMENTTYPE: ['']
      });

      if (this.formLoaded[category] !== true) {
        this.livestockService.getLandmarkBranchName()
          .subscribe(
            data => {
              this.documentBranchOptions = data;
            }
          );
          this.livestockService.getTransactionTypes()
          .subscribe(
            data => {
              this.documentTransactionTypeOptions = data;
            }
          );
          this.livestockService.getDocType()
          .subscribe(
            data => {
              this.documenttypeOptions = data;
            }
          );
        this.formLoaded[category] = true;
      }

      this.headerMap = this.livestockDocumentHeaderMap;

    } 
//     else if (category === 'Livestock Sales') {
//       this.searchForm = this.fb.group({
//         TRANNSCTIONTYPE: [null],
//         SALETYPE: [null],
//         SALEPROCESSOR: [null],
//         CONDUCTINGBRANCH: [null],
//         STAGE: [null],
//         VENDORSAPNO: [null],
//         BUYERSAPNO: [null],
//         '3RDPARTY': [null],
//         VENDORBRANCH: [null],
//         BUYERBRANCH: [null],
//         AGENCY: [null],
//         AGENT: [null],
//         SALEYARD: [null],
//         SALEFROMDATE: [null],
//         SALETODATE: [null],
//       });

//       // populate dropdown options for livestock sales search form
//       if (this.formLoaded[category] !== true) {
//         this.livestockService.getTransactionTypes()
//           .subscribe(
//             data => {
//               this.transactionTypeOptions = data;
//             }
//           );

//         this.livestockService.getSaleTypes()
//           .subscribe(
//             data => {
//               this.saleTypeOptions = data;
//             }
//           );

//         this.livestockService.getLandmarkBranchName()
//           .subscribe(
//             data => {
//               this.vendorBranchOptions = data;
//               this.buyerBranchOptions = data;
//               this.conductingBranchOptions = data;
//             }
//           );
//           //DropDown Bind User By Role Ticket - #966 - Biresh
//           this.livestockService.getUserByRole()
//           .subscribe(
//             data => {
//               console.log(data);
//               this.saleprocessorOptions = data;
//             }
//           );
// // Commneted due to Change Control DDL to Autocomplete Search Box - #819
//         // this.livestockService.getVendorTradingNames()
//         //   .subscribe(
//         //     data => {
//         //       this.vendorTradingNameOptions = data;
//         //     }
//         //   );
      
      

//         // this.livestockService.getBuyerTradingNames()
//         //   .subscribe(
//         //     data => {
//         //       this.buyerTradingNameOptions = data;
//         //     }
//         //   );
// // #819
//         this.livestockService.getThirdParty()
//           .subscribe(
//             data => {
//               this.thirdPartyOptions = data;
//             }
//           );

//         this.livestockService.getSaleyard()
//           .subscribe(
//             data => {
//               this.saleyardOptions = data;
//             }
//           );
//         this.formLoaded[category] = true;
//       }

//       this.headerMap = this.livestockSaleHeaderMap;
//     }
  }

  categorySelect(category: string) {
    // Fix raygun error 
    // when change category set sort column and sort order to default
    // Roshan - 29-Sep-2020
    if(this.selectedCategory !== category) {
      this.bodyData.SortColumn = 'TRNSCTNID';
      this.bodyData.SortOrder = 'desc';
    }
    this.isSearched = false;
    this.filters = {};
    this.globalSearchValue = '';
    this.dataSource = [];
    this.selectedCategory = category;
    this.searchForm.reset();
    this.search();
    this.populateForm(category);
  }

  // sapNoSearch = (text$: Observable<string>) => {
  //   return this.livestockService.sapNoSearch(text$);
  // }
  // Vendor & Buyer Trading Name Serarch Control Fix - #819
  vendortrdnameSearch = (text$: Observable<string>) => {
    return this.livestockService.vendortrdnameSearch(text$);
  }
  buyertrdnameSearch = (text$: Observable<string>) => {
    return this.livestockService.buyertrdnameSearch(text$);
  }
  // End - #819
  tradingNameSearch = (text$: Observable<string>) => {
    return this.livestockService.tradingNameSearch(text$);
  }

  prmsSearch = (text$: Observable<string>) => {
    return this.livestockService.prmsSearch(text$);
  }

  abnSearch = (text$: Observable<string>) => {
    return this.livestockService.abnSearch(text$);
  }

  suburbSearch = (text$: Observable<string>) => {
    return this.livestockService.suburbSearch(text$);
  }

  postCodeSearch = (text$: Observable<string>) => {
    return this.livestockService.postCodeSearch(text$);
  }

  agencySearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmoagencyagncname1.toLocaleLowerCase().indexOf(term) > -1 || item.dmoagencyagncsapno.toLocaleLowerCase().indexOf(term) > -1;
  }

  agenctSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmoagentagntname.toLocaleLowerCase().indexOf(term) > -1 || item.dmoagentagntid.toLocaleLowerCase().indexOf(term) > -1;
  }

  branchNameSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmobranchbrname.toLocaleLowerCase().indexOf(term) > -1 || item.dmobranchbrcode.toLocaleLowerCase().indexOf(term) > -1;
  }

  SaleYardNameSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmosaleyardsyname.toLocaleLowerCase().indexOf(term) > -1 || item.dmosaleyardsycode.toLocaleLowerCase().indexOf(term) > -1;
  }

  stateSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmolcnlcnstate.toLocaleLowerCase().indexOf(term) > -1;
  }
  
  transactionTypeSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmotrnstyptranstypedscr.toLocaleLowerCase().indexOf(term) > -1 || item.dmotrnstyptranstypecode.toLocaleLowerCase().indexOf(term) > -1;
  }

  saleTypeSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.dmosaletypesaletypedscr.toLocaleLowerCase().indexOf(term) > -1 || item.dmosaletypesaletypecode.toLocaleLowerCase().indexOf(term) > -1;
  }
  //DropDown Filter Ticket - #966 - Biresh
  saleprocessorSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.UserName.toLocaleLowerCase().indexOf(term) > -1 || item.Name.toLocaleLowerCase().indexOf(term) > -1;
  }
  //for Livestock Document Ticket - #1002
  saleNoSearch = (text$: Observable<string>) => {
    return this.livestockService.saleNoSearch(text$);
  }
  sapNoSearch = (text$: Observable<string>) => {
    return this.livestockService.sapNoSearch(text$);
  }
  docNoSearch = (text$: Observable<string>) => {
    return this.livestockService.docNoSearch(text$);
  }
  documentTypeSearchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item.DocumentType.toLocaleLowerCase().indexOf(term) > -1;
  }
  ngOnInit() {
    const url = (this.router.url).split('/');
    if (url[1] === 'livestock' && url[2] === 'search') {
      this.livestockService.checkAppRole('LMKLivestockSearch').subscribe(data =>{
        this.appRoleCheck = data;
        if(this.appRoleCheck > 0){
    this.populateForm('Livestock Document');
        }
      });
    } 
    
  }

  toggle_search_form_show() {
    this.showSearchForm = !this.showSearchForm;
  }

  clear_all() {
    this.filters = {};
    this.searchForm.reset();
    this.globalSearchValue = '';
    for (const column of this.headerMap.config.header.columns) {
      const form = this.gridView.elRef.nativeElement.querySelector('#frm_' + column.objectKey);
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
    this.generateFilter();
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length > 0 ? false : true;
  }

  transformDate(date) {
    try{
    const dates = date.split('/');
    const newDate = dates[2]+'-'+dates[1]+'-'+dates[0];
    return formatDate(newDate, 'yyyy-MM-dd', this.locale);
    }
    catch(error){
      return  formatDate(date, 'yyyy-MM-dd', this.locale);
    }
  }

  formatDate(date: NgbDateStruct) {
    if (date) {
      return `${date.year}-${date.month}-${date.day}`;
    } else {
      return '';
    }
  }
// Change Advanced Search Control Condition -EQUAL - #725
// Vendor & Buyer Trading Name Serarch Control Fix - #819
 // Add new Form Livestock Documents Ticket - #1002
  search() {
    this.isSearched = true;
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

    // tslint:disable-next-line: forin
    for (const i in this.searchForm.value) {
      let advanced_filter = null;
      if (Array.isArray(this.searchForm.value[i])) {
        if (this.searchForm.value[i].length > 0) {
          advanced_filter = {
            GridConditions: [],
            DataField: i,
            LogicalOperator: 'Or',
            FilterType: 'Column_Filter'
          };

          for (const item of this.searchForm.value[i]) {
            advanced_filter.GridConditions.push({
              Condition: 'EQUAL',
              ConditionValue: item
            });
          }

          this.filters['Advnaced_Filter~$~' + i] = advanced_filter;
        } else {
          delete this.filters['Advnaced_Filter~$~' + i];
        }
      } else {
        if (this.searchForm.value[i] != null && this.searchForm.value[i] !== '') {
          if (i === 'SALEFROMDATE') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'GREATER_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['SALEFROMDATE'])
                }
              ],
              DataField: 'SALEDATE',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'SALETODATE') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'LESS_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['SALETODATE'])
                }
              ],
              DataField: 'SALEDATE',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'SALEDOCUMENTFROMDATE') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'GREATER_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['SALEDOCUMENTFROMDATE'])
                }
              ],
              DataField: 'dmocrmheaderinfsaledate',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'SALEDOCUMENTTODATE') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'LESS_THAN_OR_EQUAL',
                  ConditionValue: this.formatDate(this.searchForm.value['SALEDOCUMENTTODATE'])
                }
              ],
              DataField: 'dmocrmheaderinfsaledate',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'TRADINGNAME') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'EQUAL',
                  ConditionValue: this.searchForm.value[i].dmocustmstrsapno
                }
              ],
              DataField: 'CustomerID',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'dmocustmstrsapno') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'EQUAL',
                  ConditionValue: this.searchForm.value[i].dmocustmstrsapno
                }
              ],
              DataField: 'dmocustmstrsapno',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'VENDORSAPNO') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'EQUAL',
                  ConditionValue: this.searchForm.value[i].dmocustmstrsapno
                }
              ],
              DataField: 'VENDORSAPNO',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else if (i === 'BUYERSAPNO') {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'EQUAL',
                  ConditionValue: this.searchForm.value[i].dmocustmstrsapno
                }
              ],
              DataField: 'BUYERSAPNO',
              LogicalOperator: 'OR',
              FilterType: 'Column_Filter'
            };
          } else {
            advanced_filter = {
              GridConditions: [
                {
                  Condition: 'EQUAL',
                  ConditionValue: this.searchForm.value[i]
                }
              ],
              DataField: i,
              LogicalOperator: 'Or',
              FilterType: 'Column_Filter'
            };
          }

          this.filters['Advnaced_Filter~$~' + i] = advanced_filter;
        } else {
          delete this.filters['Advnaced_Filter~$~' + i];
        }
      }
    }

    this.generateFilter();
  }
 // Add new Form Livestock Documents Ticket - #1002
  async getSearchData(params: any) {
    let response: any;
    if (this.selectedCategory === 'Agent') {
      response = await this.livestockService.agentSearch(params).toPromise();
    } else if (this.selectedCategory === 'Account') {
      response = await this.livestockService.accountSearch(params).toPromise();
    } else if (this.selectedCategory === 'Livestock Document') {
      response = await this.livestockService.livestockDocumentSearch(params).toPromise();
    } 
    // else if (this.selectedCategory === 'Livestock Sales') {
    //   response = await this.livestockService.livestockSaleSearch(params).toPromise();
    // }
    this.dataSource = response.Data;
    this.itemsCount = response.RecordsCount;
  }

  pageChange(event) {
    this.bodyData.PageNumber = event.currentPage;
    this.bodyData.PageSize = event.pageSize;
    this.getSearchData(this.bodyData);
  }

  bindColumnFilterDdl(item) {
    let type = '';
    if (item.colData.dataType === 'Date') {
      type = 'DateEditBox';
    }
    const FilterData = this.columnFilter.GetFilterByDataType(type); // Calling Function to get ColumnFilter Condition data
    if (FilterData.length === 0) { // Check if Array is empty then call API for options data
    } else {
      this.headerMap.config.header.columnFilter['colData_' + item.colIndex] = FilterData;
    }
  }

  FilterList(item): string {
    return item.map(e => e.ConditionValue).join(',');
  }

  onFilterClear(columnName, filterType) {
    if (filterType === 'Global_Search') {
      this.globalSearchValue = '';
    } else if (filterType === 'Column_Filter') {
      const form = this.gridView.elRef.nativeElement.querySelector('#frm_' + columnName);
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
    this.generateFilter();
  }

  onAdvancedFilterClear(filterKey: string) {
    delete this.filters[filterKey];

    this.searchForm.get(filterKey.split('Advnaced_Filter~$~')[1]).patchValue(null);
    this.generateFilter();
  }

  private async generateFilter() {
    this.bodyData.GridFilters = [];
    this.bodyData.PageNumber = 1;
    Object.keys(this.filters).forEach(key => {
      this.bodyData.GridFilters.push(this.filters[key]);
    });
    await this.getSearchData(this.bodyData);
    this.gridView.currentPage = 1;
  }
 // Add new Form Livestock Documents Ticket - #1002
  actionClick(event: any) {
    switch (event.action) {
      case 'Filter_Header':
        this.bindColumnFilterDdl(event);
        break;
      case 'Filter_Click':
        let filter: any = {};
        filter = {
          GridConditions: [],
          DataField: event.colData.objectKey,
          LogicalOperator: event.filterData.logicalOpt.Value === 'Select...' ? '' : event.filterData.logicalOpt.Value,
          FilterType: 'Column_Filter'
        };
        if (event.filterData.filterValue1 && event.filterData.filterValue1 !== '') {
          debugger
          if (event.colData.dataType === 'Date') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: this.transformDate(event.filterData.filterValue1)
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt1.Value,
              ConditionValue: event.filterData.filterValue1
            });
          }
        }
        if (event.filterData.filterValue2 && event.filterData.filterValue2 !== '') {
          if (event.colData.dataType === 'Date') {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: this.transformDate(event.filterData.filterValue2)
            });
          } else {
            filter.GridConditions.push({
              Condition: event.filterData.ConditionOpt2.Value,
              ConditionValue: event.filterData.filterValue2
            });
          }
        }
        if (filter && Object.keys(filter).length !== 0) {
          this.filters['Column_Filter~$~' + event.colData.objectKey] = filter;
        }
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
      case 'asc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'asc';
        this.getSearchData(this.bodyData);
        break;
      case 'desc':
        this.bodyData.SortColumn = event.colData.objectKey;
        this.bodyData.SortOrder = 'desc';
        this.getSearchData(this.bodyData);
        break;
      case 'Remove Sort':
        this.bodyData.SortColumn = '-1';
        this.bodyData.SortOrder = 'desc';
        this.getSearchData(this.bodyData);
        break;
      case 'FilterClear_Click':
        delete this.filters['Column_Filter~$~' + event.colData.objectKey];
        this.generateFilter();
        event.ColumnFilterDropdown.close();
        break;
        case 'Link':
          this.downloadFile(this.dataSource[event.rowIndex].TRNSCTNID,this.dataSource[event.rowIndex].EncDocumentNumber)
          break;
    }
  }

  SaveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    fileName = sessionStorage.AppName
      + '_' + this.selectedCategory
      + '_' + (curDate.getMonth() + 1).toString()
      + '_' + curDate.getDate()
      + '_' + curDate.getFullYear()
      + '_' + curDate.getHours()
      + '_' + curDate.getMinutes()
      + '_' + curDate.getSeconds()
      + '.xlsx';
    saveAs(FileData, fileName);
  }
 // Add new Form Livestock Documents Ticket - #1002
  getExcelData() {
    const bodyData = {
      PageSize: -1,
      PageNumber: -1,
      SortColumn: 'TRNSCTNID',
      SortOrder: 'desc',
      GridFilters: []
    };
    Object.keys(this.filters).forEach(key => {
      bodyData.GridFilters.push(this.filters[key]);
    });
    let url: string;
    if (this.selectedCategory === 'Agent') {
      url = 'livestocksearch/ExportToExcelAgent';
    } else if (this.selectedCategory === 'Account') {
      url = 'livestocksearch/ExportToExcelAccount';
    } else if (this.selectedCategory === 'Livestock Document') {
      url = 'livestocksearch/getLiveStockDcumentExportExcel';
    } 
    // else if (this.selectedCategory === 'Livestock Sales') {
    //   url = 'livestocksearch/ExportToExcelLiveStock';
    // }
    this.apiESaleyardService.postGetFile(url, bodyData, 'blob')
      .subscribe(
        (resultBlob: Blob) => {
          this.SaveExportFile(resultBlob);
        }
      );
  }
  // Reset agent DDL based on Agency
  restAgentDDL(event) {
    this.agentOptions = [];
    if (event !== undefined) {
      this.livestockService.getAgentBasedOnAgency(event.dmoagencyagncsapno)
        .subscribe(
          data => {
            this.agentOptions = data;
          }
        );
    } else {
      this.searchForm.controls.Agents.setValue(null);
      this.livestockService.getAgent()
        .subscribe(
          data => {
            this.agentOptions = data;
          }
        );
    }
  }
  // Reset PostCode DDL in Account Search
  resetPostCodeDDL(event) {
      this.searchForm.controls.dmocustmstraddrzip.setValue(null);
      this.searchForm.controls.dmocustmstraddrcity.setValue(null);
    if (event !== undefined) {
      this.livestockService.stateSelected = event.dmolcnlcnstate;
    }else{
      this.livestockService.stateSelected = '';
      this.livestockService.postCodeSelected = '';
    }
  }
  // Reset Suburb DDL in Account Search
   resetSuburbDDL(event) {
    this.searchForm.controls.dmocustmstraddrcity.setValue(null);
  if (event !== '') {
    this.livestockService.postCodeSelected = event;
  }else{
    this.livestockService.postCodeSelected = '';
  }
   }
 // Add new Form Livestock Documents Ticket - #1002
  downloadFile(TransactionID, DocumentNumber) {
    this.apiESaleyardService.postGetFile(`report/downloadBillingDocument?saleTransactionID=${TransactionID}&documentNumber=${DocumentNumber}`, null, 'blob')
    .subscribe(
      (res: Blob) => {
        if (res.type === 'application/pdf') {
          const fileURL = URL.createObjectURL(res);
          window.open(fileURL, '_blank');
        } else {
         this.toastr.warning('There is no data for this report.');
        }
      }, err => {
        console.log(err);
      }
    );
    
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
