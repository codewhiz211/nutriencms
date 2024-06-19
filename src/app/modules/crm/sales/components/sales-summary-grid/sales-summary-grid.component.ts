import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiESaleyardService } from '@app/core';

@Component({
  selector: 'app-sales-summary-grid',
  templateUrl: './sales-summary-grid.component.html',
  styleUrls: ['./sales-summary-grid.component.scss']
})
export class SalesSummaryGridComponent implements OnInit {

  dataSource: any = {};
  ColumnMap=["Cents/Kg","$/Head","Total"];
  columnList=["AveragePerHead","TotalCommission"];
  headerMap = [
    {
      objectKey: 'Summary',
      displayName: 'Summary'
    },
    {
      objectKey: 'LotsCount',
      displayName: '# Lots'
    },
    {
      objectKey: 'HeadCount',
      displayName: '# Head'
    },
    {
      objectKey: 'Weight',
      displayName: 'Weight'
    },
    {
      objectKey: 'Turnover',
      displayName: 'Turnover'
    },
    {
      objectKey: 'AverageCPerKG',
      displayName: 'Average C/kg'
    },
    {
      objectKey: 'AveragePerHead',
      displayName: 'Average $/Hd'
    },
    {
      objectKey: 'AvgCommissionRate',
      displayName: 'Avg Commission %'
    },
    {
      objectKey: 'TotalCommission',
      displayName: 'Total Commission'
    }
  ];
  saleId: string;

  constructor(
    private route: ActivatedRoute,
    private api: ApiESaleyardService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.saleId = params.get('id');
     // this.getSaleSummaryData();
    });
  }

  getSaleSummaryData() {
    this.api.post('crmsales/salesSummary', {SaleTransactionID: this.saleId}).subscribe(data => {
      this.dataSource = data;
    });
  }

  checkIfDecimal(num:any){
    const regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
    if (!String(num).match(regex)) {
      return true;
    }
   }



}
