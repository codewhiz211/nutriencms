import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldAppraisalComponent } from './sold-appraisal.component';

describe('SoldAppraisalComponent', () => {
  let component: SoldAppraisalComponent;
  let fixture: ComponentFixture<SoldAppraisalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoldAppraisalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoldAppraisalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
