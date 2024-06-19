import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldTestResultComponent } from './sold-test-result.component';

describe('SoldTestResultComponent', () => {
  let component: SoldTestResultComponent;
  let fixture: ComponentFixture<SoldTestResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoldTestResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoldTestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
