import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubProcessCopyRecordComponent } from './sub-process-copy-record.component';

describe('CopyRecordComponent', () => {
  let component: SubProcessCopyRecordComponent;
  let fixture: ComponentFixture<SubProcessCopyRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubProcessCopyRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubProcessCopyRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
