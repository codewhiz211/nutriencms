import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizedGridComponent } from './customized-grid.component';

describe('CustomizedGridComponent', () => {
  let component: CustomizedGridComponent;
  let fixture: ComponentFixture<CustomizedGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizedGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizedGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
