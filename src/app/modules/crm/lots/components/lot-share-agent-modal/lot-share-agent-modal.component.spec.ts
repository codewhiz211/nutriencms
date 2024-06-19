import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';

import { LotShareAgentModalComponent } from './lot-share-agent-modal.component';

describe('LotShareAgentModalComponent', () => {
  let component: LotShareAgentModalComponent;
  let fixture: ComponentFixture<LotShareAgentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotShareAgentModalComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        SharedModule,
        CoreModule
      ],
      providers: [
        NgbActiveModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotShareAgentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
