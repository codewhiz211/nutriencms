import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { feesChargesData } from '@app/testing';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

import { SalesFeesChargesComponent } from './sales-fees-charges.component';

describe('SalesFeesChargesComponent', () => {
  let component: SalesFeesChargesComponent;
  let fixture: ComponentFixture<SalesFeesChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesFeesChargesComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesFeesChargesComponent);
    component = fixture.componentInstance;
    component.dataSource = feesChargesData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
