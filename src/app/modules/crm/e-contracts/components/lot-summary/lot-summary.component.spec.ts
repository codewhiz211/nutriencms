import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotSummaryComponent } from './lot-summary.component';

describe('LotSummaryComponent', () => {
  let component: LotSummaryComponent;
  let fixture: ComponentFixture<LotSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
