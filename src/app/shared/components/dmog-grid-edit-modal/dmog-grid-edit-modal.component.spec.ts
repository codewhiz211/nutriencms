import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmogGridEditModalComponent } from './dmog-grid-edit-modal.component';

describe('DmogGridEditModalComponent', () => {
  let component: DmogGridEditModalComponent;
  let fixture: ComponentFixture<DmogGridEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmogGridEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmogGridEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
