import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentManagerSidenavComponent } from './content-manager-sidenav.component';

describe('ContentManagerSidenavComponent', () => {
  let component: ContentManagerSidenavComponent;
  let fixture: ComponentFixture<ContentManagerSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentManagerSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentManagerSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
