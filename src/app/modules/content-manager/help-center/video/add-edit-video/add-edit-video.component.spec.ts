import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditVideoComponent } from './add-edit-video.component';

describe('AddEditVideoComponent', () => {
  let component: AddEditVideoComponent;
  let fixture: ComponentFixture<AddEditVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
