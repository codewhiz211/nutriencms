import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

import { SalesVendorTermsComponent } from './sales-vendor-terms.component';

describe('SalesVendorTermsComponent', () => {
  let component: SalesVendorTermsComponent;
  let fixture: ComponentFixture<SalesVendorTermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesVendorTermsComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesVendorTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
