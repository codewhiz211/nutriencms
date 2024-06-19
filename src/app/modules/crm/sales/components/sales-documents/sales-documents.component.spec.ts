import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDocumentsComponent } from './sales-documents.component';

describe('SalesDocumentsComponent', () => {
  let component: SalesDocumentsComponent;
  let fixture: ComponentFixture<SalesDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
