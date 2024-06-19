import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { SharedModule } from '@app/shared';
import { DmoControlService, NgbDateFRParserFormatter } from '@app/core';

import { SalesFormViewModalComponent } from './sales-form-view-modal.component';

class MockNgbDateFRParserFormatter {
  parse() {
  }

  format() {
  }
}

describe('SalesFormViewModalComponent', () => {
  let component: SalesFormViewModalComponent;
  let fixture: ComponentFixture<SalesFormViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SalesFormViewModalComponent
      ],
      imports: [
        SharedModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        NgbActiveModal,
        FormBuilder,
        DmoControlService,
        {provide: NgbDateFRParserFormatter, useClass: MockNgbDateFRParserFormatter}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesFormViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
