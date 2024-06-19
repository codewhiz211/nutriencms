import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFaqComponent } from './add-edit-faq.component';

describe('AddEditFaqComponent', () => {
  let component: AddEditFaqComponent;
  let fixture: ComponentFixture<AddEditFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
