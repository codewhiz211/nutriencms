import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EContractViewModalComponent } from './e-contract-view-modal.component';

describe('EContractViewModalComponent', () => {
  let component: EContractViewModalComponent;
  let fixture: ComponentFixture<EContractViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EContractViewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EContractViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
