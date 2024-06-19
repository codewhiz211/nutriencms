import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUsersGridComponent } from './manageusers-grid.component';

describe('ManageUsersGridComponent', () => {
  let component: ManageUsersGridComponent;
  let fixture: ComponentFixture<ManageUsersGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageUsersGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsersGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
