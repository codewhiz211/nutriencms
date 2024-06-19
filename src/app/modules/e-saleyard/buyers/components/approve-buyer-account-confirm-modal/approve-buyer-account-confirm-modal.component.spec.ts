import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveBuyerAccountConfirmModalComponent } from './approve-buyer-account-confirm-modal.component';

describe('ApproveBuyerAccountConfirmModalComponent', () => {
  let component: ApproveBuyerAccountConfirmModalComponent;
  let fixture: ComponentFixture<ApproveBuyerAccountConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveBuyerAccountConfirmModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveBuyerAccountConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
