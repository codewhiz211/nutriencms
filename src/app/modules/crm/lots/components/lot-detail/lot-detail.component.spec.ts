import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';

import { LotDetailComponent } from './lot-detail.component';

describe('LotDetailComponent', () => {
  let component: LotDetailComponent;
  let fixture: ComponentFixture<LotDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotDetailComponent ],
      imports: [
        CoreModule,
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
