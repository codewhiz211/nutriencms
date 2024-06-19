import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaleDetailModalComponent } from './bale-detail-modal.component';

describe('BaleDetailModalComponent', () => {
  let component: BaleDetailModalComponent;
  let fixture: ComponentFixture<BaleDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaleDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaleDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
