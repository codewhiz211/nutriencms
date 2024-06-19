import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoolSearchComponent } from './wool-search.component';

describe('WoolSearchComponent', () => {
  let component: WoolSearchComponent;
  let fixture: ComponentFixture<WoolSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoolSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoolSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
