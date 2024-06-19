import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { LotSearchService } from '../../services/lot-search.service';
import { LotService } from '../../services/lot.service';


@Component({
  selector: 'app-lot-add-agent-modal',
  templateUrl: './lot-add-agent-modal.component.html',
  styleUrls: ['./lot-add-agent-modal.component.scss']
})
export class LotAddAgentModalComponent implements OnInit {

  addForm: FormGroup;
  submitted = false;
  category: string;
  transactionId: string;
  buyerRebrateAgencyList = [];

  formatter = (x: any) => {
    if (this.category === 'agencyCommission') {
      return x.NAME;
    } else if (this.category === 'buyerBranchRebate') {
      return x.AgencyName ? x.AgencyName : x.AgentName;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private lotSearchService: LotSearchService,
    private lotService: LotService
  ) { }

  ngOnInit() {
    this.addForm = this.fb.group({
      agencyName: ['', Validators.required],
      agentName: ['', Validators.required]
    });
    if (this.category === 'buyerBranchRebate') {
      this.lotSearchService.getBuyerRebateAgencyList(this.transactionId).subscribe(data => {
        this.buyerRebrateAgencyList = data;
      });
    }
  }

  get f() { return this.addForm.controls; }

  agencySearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    if (this.category === 'agencyCommission') {
      return debouncedText$.pipe(
        switchMap(term => {
          if (term !== '' && term.length > 2) {
            let sp = null;
            if (this.addForm.value.agentName && this.addForm.value.agentName.SAPNO) {
              sp = this.addForm.value.agentName.SAPNO;
            }
            // Changes for lot agent agency associations
            return this.lotSearchService.GetAgentAgencyList('Agency', term.toString(), sp,this.transactionId);
          } else {
            return [];
          }
        }
        )
      );
    } else if (this.category === 'buyerBranchRebate') {
      return debouncedText$.pipe(
        map(term => {
          return term === ''
            ? this.buyerRebrateAgencyList
              .filter(item => item.AgencySapNo !== '' && item.AgencySapNo != null)
            : this.buyerRebrateAgencyList
              .filter(item => item.AgencyName.toLowerCase().indexOf(term.toLowerCase()) > -1);
        })
      );
    }
  }

  agentSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    if (this.category === 'agencyCommission') {
      return debouncedText$.pipe(
        switchMap(term => {
          if (term !== '' && term.length > 2) {
            let sp = null;
            if (this.addForm.value.agencyName && this.addForm.value.agencyName.SAPNO) {
              sp = this.addForm.value.agencyName.SAPNO;
            }
            // Changes for lot agent agency associations
            return this.lotSearchService.GetAgentAgencyList('Agent', term.toString(), sp,this.transactionId);
          } else {
            return [];
          }
        })
      );
    } else if (this.category === 'buyerBranchRebate') {
      return debouncedText$.pipe(
        switchMap(term => {
          if (term === '') {
            // Fix raygun error - Roshan
            if (this.addForm.value.agencyName.AgencySapNo) {
              return this.lotSearchService.getBuyerRebateAgentList(this.transactionId, this.addForm.value.agencyName.AgencySapNo);
            } else {
              return [];
            }
          } else {
            if (this.addForm.value.agencyName.AgencySapNo) {
              return this.lotSearchService.getBuyerRebateAgentList(this.transactionId, this.addForm.value.agencyName.AgencySapNo)
                .pipe(
                  map((res: any) => res.filter(item => item.AgentName.toLowerCase().indexOf(term.toLowerCase()) > -1))
                );
            } else {
              return [];
            }
          }
        })
      );
    }

  }

  onSubmit() {
    this.submitted = true;
    if (!this.addForm.valid) {
      return;
    }

    if (this.category === 'agencyCommission') {
      const params = {
        TransactionID: this.transactionId,
        AgencySapNo: this.addForm.value.agencyName.SAPNO,
        AgentCode: this.addForm.value.agentName.CODE,
        IsBuyerRebate: false
      };
      this.lotService.addLotAgentAgency(params).subscribe(result => {
        this.activeModal.close(result);
      });
    } else if (this.category === 'buyerBranchRebate') {
      // Fix raygun error - Roshan
      if (this.addForm.value.agencyName.AgencySapNo) {
        const params = {
          TransactionID: this.transactionId,
          AgencySapNo: this.addForm.value.agencyName.AgencySapNo,
          AgentCode: this.addForm.value.agentName.AgentCode,
          IsBuyerRebate: true
        };
        this.lotService.addLotAgentAgency(params).subscribe(result => {
          this.activeModal.close(result);
        });
      }
    }

  }

}
