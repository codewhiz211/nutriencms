import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterimSalePriceAdviceComponent } from './interim-sale-price-advice.component';

describe('InterimSalePriceAdviceComponent', () => {
  let component: InterimSalePriceAdviceComponent;
  let fixture: ComponentFixture<InterimSalePriceAdviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterimSalePriceAdviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterimSalePriceAdviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
