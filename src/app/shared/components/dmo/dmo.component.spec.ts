import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';


import { DmoControlService } from '@app/core';
import { DmoControlMockService } from '@app/testing';

import { DmoComponent } from './dmo.component';

describe('DmoComponent', () => {
  let component: DmoComponent;
  let fixture: ComponentFixture<DmoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmoComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule
      ],
      providers: [
        {provide: DmoControlService, useClass: DmoControlMockService}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmoComponent);
    component = fixture.componentInstance;
    component.dmo = {};
    component.parentForm = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
