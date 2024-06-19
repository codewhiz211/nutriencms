import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportEConractConfigComponent } from './export-e-conract-config.component';

describe('ExportEConractConfigComponent', () => {
  let component: ExportEConractConfigComponent;
  let fixture: ComponentFixture<ExportEConractConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportEConractConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportEConractConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
