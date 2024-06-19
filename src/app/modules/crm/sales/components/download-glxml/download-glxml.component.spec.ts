import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadGlxmlComponent } from './download-glxml.component';

describe('DownloadGlxmlComponent', () => {
  let component: DownloadGlxmlComponent;
  let fixture: ComponentFixture<DownloadGlxmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadGlxmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadGlxmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
