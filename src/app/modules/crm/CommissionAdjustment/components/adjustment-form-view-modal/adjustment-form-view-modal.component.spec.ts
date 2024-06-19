import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentFormViewModalComponent } from './adjustment-form-view-modal.component';

describe('AdjustmentFormViewModalComponent', () => {
  let component: AdjustmentFormViewModalComponent;
  let fixture: ComponentFixture<AdjustmentFormViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentFormViewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentFormViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
