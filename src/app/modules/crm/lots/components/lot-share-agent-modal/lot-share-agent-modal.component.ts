import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { LotService } from '../../services/lot.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { LotSearchService } from '../../services/lot-search.service';
@Component({
  selector: 'app-lot-share-agent-modal',
  templateUrl: './lot-share-agent-modal.component.html',
  styleUrls: ['./lot-share-agent-modal.component.scss']
})
export class LotShareAgentModalComponent implements OnInit {

  addForm = this.fb.group({
    agentName: ['', Validators.required],
    agencyName: ['', Validators.required],
    sharingRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });
  Sap: any = {
    Rate: ''
  };
  AgentAgenyList: any;
  Pid: string;
  body = {
    Agency: '',
    Agent: '',
    TransactionID: ''
  };
  submitted = false;
  formatter = (x: any) => {    
      return x.NAME;    
  }
  formatter1 = (x: {AgentCODE: string, AgentNAME: string}) => x.AgentNAME;
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private lotservice: LotService,
    private lotSearchService: LotSearchService
  ) { }

  ngOnInit() {
    // this.lotservice.getSharedAgentAgency(this.body).subscribe(x => {
    //   this.AgentAgenyList = x;
    // });
  }

  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (!this.addForm.valid) {
      return;
    }
    const submitdata = {
      TransactionID : this.body.TransactionID,
      LotAgentCommissionId: this.Pid,
      AgencySapNo: this.addForm.value.agencyName.SAPNO,
      AgentCode: this.addForm.value.agentName.CODE,
      Rate: this.Sap.Rate
    };
    this.lotservice.addLotAgentAgencyShared(submitdata).subscribe(x=> {
      this.activeModal.close(x);
    });
  }
  searchAgency = (text$: Observable<string>) =>{
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
      return debouncedText$.pipe(
        switchMap(term => {
          if (term !== '' && term.length > 2) {
            let sp = null;
            if (this.addForm.value.agentName && this.addForm.value.agentName.SAPNO) {
              sp = this.addForm.value.agentName.SAPNO;
            }
            return this.lotSearchService.GetAgentAgencyList('Agency', term.toString(), sp);
          } else {
            return [];
          }
        }
        )
      );
  }
  //  text$.pipe(
  //   debounceTime(200),
  //   distinctUntilChanged(),
  //   filter(term => term.length >= 1),
  //   map(term => this.Sap.Agent !== undefined && this.Sap.Agent.AgentCODE ?
  //      this.AgentAgenyList.filter(item => item.AgentCODE === this.Sap.Agent.AgentCODE &&
  //      new RegExp(term, 'mi').test(item.AgencyNAME)).slice(0, 10) :
  //      this.AgentAgenyList.filter(item => new RegExp(term, 'mi').test(item.AgencyNAME)).slice(0, 10))
  // )
  searchAgent = (text$: Observable<string>) =>{
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
      return debouncedText$.pipe(
        switchMap(term => {
          if (term !== '' && term.length > 2) {
            let sp = null;
            if (this.addForm.value.agencyName && this.addForm.value.agencyName.SAPNO) {
              sp = this.addForm.value.agencyName.SAPNO;
            }
            return this.lotSearchService.GetAgentAgencyList('Agent', term.toString(), sp);
          } else {
            return [];
          }
        })
      );
  } 
  // text$.pipe(
  //   debounceTime(200),
  //   distinctUntilChanged(),
  //   filter(term => term.length >= 1),
  //   map(term => this.Sap.Agency !== undefined && this.Sap.Agency.AgencySap ?
  //     this.AgentAgenyList.filter(item => item.AgencySap === this.Sap.Agency.AgencySap &&
  //       new RegExp(term, 'mi').test(item.AgentNAME)).slice(0, 10) :
  //     this.AgentAgenyList.filter(item => new RegExp(term, 'mi').test(item.AgentNAME)).slice(0, 10))
  // )
}
