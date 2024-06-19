import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSummaryGridComponent } from './sales-summary-grid.component';

describe('SalesSummaryGridComponent', () => {
  let component: SalesSummaryGridComponent;
  let fixture: ComponentFixture<SalesSummaryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesSummaryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesSummaryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
