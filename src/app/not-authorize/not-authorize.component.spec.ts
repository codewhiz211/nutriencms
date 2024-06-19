import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAuthorizeComponent } from './not-authorize.component';

describe('NotAuthorizeComponent', () => {
  let component: NotAuthorizeComponent;
  let fixture: ComponentFixture<NotAuthorizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotAuthorizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAuthorizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
