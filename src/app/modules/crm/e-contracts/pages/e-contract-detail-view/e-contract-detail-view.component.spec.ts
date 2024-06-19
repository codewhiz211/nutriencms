import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EContractDetailViewComponent } from './e-contract-detail-view.component';

describe('EContractDetailViewComponent', () => {
  let component: EContractDetailViewComponent;
  let fixture: ComponentFixture<EContractDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EContractDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EContractDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
