import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MentionModule } from 'angular-mentions';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { NotesComponent } from './notes.component';

class MockToastrService {
  error() {
  }
}

describe('NotesComponent', () => {
  let component: NotesComponent;
  let fixture: ComponentFixture<NotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotesComponent ],
      imports: [
        MentionModule,
        HttpClientTestingModule
      ],
      providers: [
        {provide: ToastrService, useClass: MockToastrService},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 2
              }
            }
          }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
