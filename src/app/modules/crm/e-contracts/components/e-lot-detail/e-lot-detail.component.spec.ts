import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ELotDetailComponent } from './e-lot-detail.component';

describe('ELotDetailComponent', () => {
  let component: ELotDetailComponent;
  let fixture: ComponentFixture<ELotDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ELotDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ELotDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
