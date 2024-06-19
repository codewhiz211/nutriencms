import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentGridViewComponent } from './adjustment-grid-view.component';

describe('AdjustmentGridViewComponent', () => {
  let component: AdjustmentGridViewComponent;
  let fixture: ComponentFixture<AdjustmentGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
