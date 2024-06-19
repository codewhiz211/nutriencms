import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDataGridComponent } from './import-data-grid.component';

describe('ImportDataGridComponent', () => {
  let component: ImportDataGridComponent;
  let fixture: ComponentFixture<ImportDataGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportDataGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
