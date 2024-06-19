import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAssestComponent } from './add-edit-assest.component';

describe('AddEditAssestComponent', () => {
  let component: AddEditAssestComponent;
  let fixture: ComponentFixture<AddEditAssestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditAssestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAssestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
