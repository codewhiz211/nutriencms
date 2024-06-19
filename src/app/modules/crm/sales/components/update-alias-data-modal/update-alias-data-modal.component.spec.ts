import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAliasDataModalComponent } from './update-alias-data-modal.component';

describe('UpdateAliasDataModalComponent', () => {
  let component: UpdateAliasDataModalComponent;
  let fixture: ComponentFixture<UpdateAliasDataModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateAliasDataModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAliasDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
