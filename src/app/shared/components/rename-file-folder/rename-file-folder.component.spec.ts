import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RenameFileFolderComponent } from './rename-file-folder.component';

describe('RenameFileFolderComponent', () => {
  let component: RenameFileFolderComponent;
  let fixture: ComponentFixture<RenameFileFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameFileFolderComponent ],
      providers: [
        NgbModal
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameFileFolderComponent);
    component = fixture.componentInstance;
    component.row = {type: 0};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
