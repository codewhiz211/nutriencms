import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { LotsGridViewComponent } from './lots-grid-view.component';

@Component({selector: 'app-grid-view', template: ''})
class GridViewComponent {
  @Input() Config: any;
  @Output() navigateDetailPage = new EventEmitter<any>();
}

describe('LotsGridViewComponent', () => {
  let component: LotsGridViewComponent;
  let fixture: ComponentFixture<LotsGridViewComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LotsGridViewComponent,
        GridViewComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotsGridViewComponent);
    router = TestBed.get(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
