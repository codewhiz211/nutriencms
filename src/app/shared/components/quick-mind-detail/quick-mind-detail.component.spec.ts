import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickMindDetailComponent } from './quick-mind-detail.component';

describe('QuickMindDetailComponent', () => {
  let component: QuickMindDetailComponent;
  let fixture: ComponentFixture<QuickMindDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickMindDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickMindDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
