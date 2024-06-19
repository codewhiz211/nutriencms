import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivalsComponent } from './receivals.component';

describe('ReceivalsComponent', () => {
  let component: ReceivalsComponent;
  let fixture: ComponentFixture<ReceivalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
