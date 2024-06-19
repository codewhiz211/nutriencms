import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormViewTcModelComponent } from './form-view-tc-model.component';

describe('FormViewTcModelComponent', () => {
  let component: FormViewTcModelComponent;
  let fixture: ComponentFixture<FormViewTcModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormViewTcModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormViewTcModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
