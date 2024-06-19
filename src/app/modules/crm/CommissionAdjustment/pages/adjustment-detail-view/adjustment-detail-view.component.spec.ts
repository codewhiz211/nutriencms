import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentDetailViewComponent } from './adjustment-detail-view.component';

describe('AdjustmentDetailViewComponent', () => {
  let component: AdjustmentDetailViewComponent;
  let fixture: ComponentFixture<AdjustmentDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
