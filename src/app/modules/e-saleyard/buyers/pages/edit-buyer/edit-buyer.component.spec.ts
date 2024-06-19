import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBuyerComponent } from './edit-buyer.component';

describe('EditBuyerComponent', () => {
  let component: EditBuyerComponent;
  let fixture: ComponentFixture<EditBuyerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBuyerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBuyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
