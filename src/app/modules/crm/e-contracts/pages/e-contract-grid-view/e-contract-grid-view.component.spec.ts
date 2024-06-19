import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EContractGridViewComponent } from './e-contract-grid-view.component';

describe('EContractGridViewComponent', () => {
  let component: EContractGridViewComponent;
  let fixture: ComponentFixture<EContractGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EContractGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EContractGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
