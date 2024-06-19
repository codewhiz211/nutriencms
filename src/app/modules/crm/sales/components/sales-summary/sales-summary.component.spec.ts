import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { SalesSummaryComponent } from './sales-summary.component';

@Component({selector: 'app-sales-summary-grid', template: ''})
class SalesSummaryGridComponent {
  @Input() dataSource: any;
}

@Component({selector: 'app-sales-fees-charges', template: ''})
class SalesFeesChargesComponent {
  @Input() dataSource: any;
}

describe('SalesSummaryComponent', () => {
  let component: SalesSummaryComponent;
  let fixture: ComponentFixture<SalesSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SalesSummaryComponent,
        SalesSummaryGridComponent,
        SalesFeesChargesComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
