import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotAddAgentModalComponent } from './lot-add-agent-modal.component';

describe('LotAddAgentModalComponent', () => {
  let component: LotAddAgentModalComponent;
  let fixture: ComponentFixture<LotAddAgentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotAddAgentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotAddAgentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
