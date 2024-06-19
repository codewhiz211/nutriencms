import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LotAgentComponent } from './lot-agent.component';

describe('LotAgentComponent', () => {
  let component: LotAgentComponent;
  let fixture: ComponentFixture<LotAgentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotAgentComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
