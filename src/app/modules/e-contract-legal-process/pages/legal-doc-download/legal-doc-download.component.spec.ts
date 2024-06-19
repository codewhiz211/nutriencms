import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalDocDownloadComponent } from './legal-doc-download.component';

describe('LegalDocDownloadComponent', () => {
  let component: LegalDocDownloadComponent;
  let fixture: ComponentFixture<LegalDocDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalDocDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalDocDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
