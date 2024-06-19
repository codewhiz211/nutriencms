import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotFeesChargesComponent } from './lot-fees-charges.component';

describe('LotFeesChargesComponent', () => {
  let component: LotFeesChargesComponent;
  let fixture: ComponentFixture<LotFeesChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotFeesChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotFeesChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
