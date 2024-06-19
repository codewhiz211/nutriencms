import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFormViewComponent } from './process-form-view.component';

describe('ProcessFormViewComponent', () => {
  let component: ProcessFormViewComponent;
  let fixture: ComponentFixture<ProcessFormViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessFormViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessFormViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
