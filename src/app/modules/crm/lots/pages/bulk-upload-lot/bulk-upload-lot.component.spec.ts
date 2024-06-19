import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadLotComponent } from './bulk-upload-lot.component';

describe('BulkUploadLotComponent', () => {
  let component: BulkUploadLotComponent;
  let fixture: ComponentFixture<BulkUploadLotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUploadLotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadLotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
