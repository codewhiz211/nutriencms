import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadWoolglxmlComponent } from './download-woolglxml.component';

describe('DownloadWoolglxmlComponent', () => {
  let component: DownloadWoolglxmlComponent;
  let fixture: ComponentFixture<DownloadWoolglxmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadWoolglxmlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadWoolglxmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
