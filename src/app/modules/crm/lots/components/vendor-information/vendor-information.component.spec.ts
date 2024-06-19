import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorInformationComponent } from './vendor-information.component';

describe('VendorInformationComponent', () => {
  let component: VendorInformationComponent;
  let fixture: ComponentFixture<VendorInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
