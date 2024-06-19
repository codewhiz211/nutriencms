import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ApplicationService } from '@app/core';
import { ApplicationMockService } from '@app/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { LogViewModelComponent } from './log-view-model.component';

describe('LogViewModelComponent', () => {
  let component: LogViewModelComponent;
  let fixture: ComponentFixture<LogViewModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogViewModelComponent ],
      imports: [
        HttpClientTestingModule
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        {provide: ApplicationService, useClass: ApplicationMockService},
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => {
                return 1;
              }
            })
          }
        },
        NgbModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogViewModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
