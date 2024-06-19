import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyStatementComponent } from './agency-statement.component';

describe('AgencyStatementComponent', () => {
  let component: AgencyStatementComponent;
  let fixture: ComponentFixture<AgencyStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgencyStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
