import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';


import { LotsDetailViewComponent } from './lots-detail-view.component';

@Component({selector: 'app-tabs', template: ''})
class TabsComponent {}

@Component({selector: 'app-tab', template: ''})
class TabComponent {}

@Component({selector: 'app-notes', template: ''})
class NotesComponent {}

@Component({selector: 'app-lot-detail', template: ''})
class LotDetailComponent {}

@Component({selector: 'app-lot-agent', template: ''})
class LotAgentComponent {}

@Component({selector: 'app-document-view', template: ''})
class DocumentViewComponent {}

describe('LotsDetailViewComponent', () => {
  let component: LotsDetailViewComponent;
  let fixture: ComponentFixture<LotsDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LotsDetailViewComponent,
        TabComponent,
        TabsComponent,
        NotesComponent,
        LotDetailComponent,
        LotAgentComponent,
        DocumentViewComponent
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotsDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
