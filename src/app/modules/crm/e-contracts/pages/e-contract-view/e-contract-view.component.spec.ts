import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EContractViewComponent } from './e-contract-view.component';

describe('EContractViewComponent', () => {
  let component: EContractViewComponent;
  let fixture: ComponentFixture<EContractViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EContractViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EContractViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
