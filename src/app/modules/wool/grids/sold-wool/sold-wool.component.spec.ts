import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldWoolComponent } from './sold-wool.component';

describe('SoldWoolComponent', () => {
  let component: SoldWoolComponent;
  let fixture: ComponentFixture<SoldWoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoldWoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoldWoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
