import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EContractsRecordViewComponent } from './e-contracts-record-view.component';

describe('EContractsRecordViewComponent', () => {
  let component: EContractsRecordViewComponent;
  let fixture: ComponentFixture<EContractsRecordViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EContractsRecordViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EContractsRecordViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
