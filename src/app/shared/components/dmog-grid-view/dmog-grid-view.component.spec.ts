import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmogGridViewComponent } from './dmog-grid-view.component';

describe('DmogGridViewComponent', () => {
  let component: DmogGridViewComponent;
  let fixture: ComponentFixture<DmogGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmogGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmogGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
