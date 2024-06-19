import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldRehandleWoolComponent } from './sold-rehandle-wool.component';

describe('SoldRehandleWoolComponent', () => {
  let component: SoldRehandleWoolComponent;
  let fixture: ComponentFixture<SoldRehandleWoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoldRehandleWoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoldRehandleWoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
