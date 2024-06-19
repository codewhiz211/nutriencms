import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';


import { SharedModule  } from '@app/shared';
import { ChildFormViewComponent } from './child-form-view.component';
import { NgbDateFRParserFormatter } from '@app/core';

class MockNgbDateFRParserFormatter {
  parse() {
  }

  format() {
  }
}

describe('FormViewComponent', () => {
  let component: ChildFormViewComponent;
  let fixture: ComponentFixture<ChildFormViewComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildFormViewComponent ],
      imports: [
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        {provide: NgbDateFRParserFormatter, useClass: MockNgbDateFRParserFormatter}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildFormViewComponent);
    router = TestBed.get(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
