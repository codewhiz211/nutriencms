import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesFileImportReviewComponent } from './sales-file-import-review.component';

describe('SalesFileImportReviewComponent', () => {
  let component: SalesFileImportReviewComponent;
  let fixture: ComponentFixture<SalesFileImportReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesFileImportReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesFileImportReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
