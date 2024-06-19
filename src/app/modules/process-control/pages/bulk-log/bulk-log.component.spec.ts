import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLogComponent } from './bulk-log.component';

describe('BulkLogComponent', () => {
  let component: BulkLogComponent;
  let fixture: ComponentFixture<BulkLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
