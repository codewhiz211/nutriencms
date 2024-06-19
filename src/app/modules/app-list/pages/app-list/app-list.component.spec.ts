import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AppListComponent } from './app-list.component';

import { ApplicationMockService, HeaderMockService } from '@app/testing';
import { ApplicationService, HeaderService } from '@app/core';

describe('AppListComponent', () => {
  let component: AppListComponent;
  let fixture: ComponentFixture<AppListComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppListComponent ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {provide: ApplicationService, useClass: ApplicationMockService},
        {provide: HeaderService, useClass: HeaderMockService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppListComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
