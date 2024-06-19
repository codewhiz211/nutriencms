import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingDocumentLogModalComponent } from './billing-document-log-modal.component';

describe('BillingDocumentLogModalComponent', () => {
  let component: BillingDocumentLogModalComponent;
  let fixture: ComponentFixture<BillingDocumentLogModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingDocumentLogModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingDocumentLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
