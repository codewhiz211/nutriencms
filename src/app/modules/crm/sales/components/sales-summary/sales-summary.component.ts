import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { SalesSummaryGridComponent } from '../sales-summary-grid/sales-summary-grid.component';
import { SalesFeesChargesComponent } from '../sales-fees-charges/sales-fees-charges.component';
import { SaleStage } from '@app/core';

@Component({
  selector: 'app-sales-summary',
  templateUrl: './sales-summary.component.html',
  styleUrls: ['./sales-summary.component.scss']
})
export class SalesSummaryComponent implements OnInit {

  @ViewChild(SalesSummaryGridComponent) private salesSummaryGridComponent: SalesSummaryGridComponent;
  @ViewChild(SalesFeesChargesComponent) private salesFeesChargesComponent: SalesFeesChargesComponent;
  @Input() stage: SaleStage;
  @Input() saleProcessorId: any;
  constructor() { }

  ngOnInit() {}

  reloadData() {
    this.salesSummaryGridComponent.getSaleSummaryData();
    this.salesFeesChargesComponent.getFeesChargesData();
  }


}
