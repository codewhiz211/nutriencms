import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportGridViewConfigComponent } from './export-grid-view-config.component';

describe('ExportGridViewConfigComponent', () => {
  let component: ExportGridViewConfigComponent;
  let fixture: ComponentFixture<ExportGridViewConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportGridViewConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportGridViewConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
