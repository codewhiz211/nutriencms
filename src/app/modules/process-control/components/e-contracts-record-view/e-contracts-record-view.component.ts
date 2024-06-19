import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-e-contracts-record-view',
  templateUrl: './e-contracts-record-view.component.html',
  styleUrls: ['./e-contracts-record-view.component.scss']
})
export class EContractsRecordViewComponent implements OnInit {

  ProcessName = 'LMKOPECESLot';
  parentTransactionId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.parentTransactionId = params.get('id');
  });
  }

  navigateDetailPage(id: any) {

  }

}
