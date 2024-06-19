import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';


import { SalesGridViewComponent } from './sales-grid-view.component';
import { Router } from '@angular/router';

@Component({selector: 'app-grid-view', template: ''})
class GridViewComponent {
  @Input() Config: any;
  @Output() openFormViewModal = new EventEmitter<any>();
  @Output() navigateDetailPage = new EventEmitter<any>();
}

describe('SalesGridViewComponent', () => {
  let component: SalesGridViewComponent;
  let fixture: ComponentFixture<SalesGridViewComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SalesGridViewComponent,
        GridViewComponent
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesGridViewComponent);
    router = TestBed.get(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
