import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadAgencyglxmlComponent } from './download-agencyglxml.component';

describe('DownloadAgencyglxmlComponent', () => {
  let component: DownloadAgencyglxmlComponent;
  let fixture: ComponentFixture<DownloadAgencyglxmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadAgencyglxmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadAgencyglxmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
