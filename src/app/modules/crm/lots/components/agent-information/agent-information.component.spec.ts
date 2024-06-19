import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentInformationComponent } from './agent-information.component';

describe('AgentInformationComponent', () => {
  let component: AgentInformationComponent;
  let fixture: ComponentFixture<AgentInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
