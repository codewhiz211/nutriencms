import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '@app/shared';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SalesDetailViewComponent } from './sales-detail-view.component';

@Component({selector: 'app-sales-summary', template: ''})
class SalesSummaryComponent {}

@Component({selector: 'app-lots-grid-view', template: ''})
class LotsGridViewComponent {}

@Component({selector: 'app-sales-vendor-terms', template: ''})
class SalesVendorTermsComponent {}

@Component({selector: 'app-sales-documents', template: ''})
class SalesDocumentsComponent {}

const locationStub = {
  back: jasmine.createSpy('back')
};


describe('SalesDetailViewComponent', () => {
  let component: SalesDetailViewComponent;
  let fixture: ComponentFixture<SalesDetailViewComponent>;
  let activatedRoute: ActivatedRoute;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SalesDetailViewComponent,
        SalesSummaryComponent,
        LotsGridViewComponent,
        SalesVendorTermsComponent,
        SalesDocumentsComponent
      ],
      imports: [
        SharedModule,
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => {
                return 1;
              }
            }),
            snapshot: {
              params: {
                id: 2
              }
            }
          }
        },
        { provide: Location, useValue: locationStub },
        NgbModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesDetailViewComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.get(ActivatedRoute);
    location = TestBed.get(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
