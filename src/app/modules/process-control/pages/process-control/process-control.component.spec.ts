import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { ProcessControlComponent } from './process-control.component';

@Component({selector: 'app-grid-view', template: ''})
class GridViewComponent {
  @Input() Config: any;
}

describe('ProcessControlComponent', () => {
  let component: ProcessControlComponent;
  let fixture: ComponentFixture<ProcessControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessControlComponent, GridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
