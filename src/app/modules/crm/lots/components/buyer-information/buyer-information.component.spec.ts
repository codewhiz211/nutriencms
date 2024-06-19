import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerInformationComponent } from './buyer-information.component';

describe('BuyerInformationComponent', () => {
  let component: BuyerInformationComponent;
  let fixture: ComponentFixture<BuyerInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
