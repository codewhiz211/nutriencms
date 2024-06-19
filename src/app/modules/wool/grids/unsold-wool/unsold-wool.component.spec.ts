import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsoldWoolComponent } from './unsold-wool.component';

describe('UnsoldWoolComponent', () => {
  let component: UnsoldWoolComponent;
  let fixture: ComponentFixture<UnsoldWoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsoldWoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsoldWoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
