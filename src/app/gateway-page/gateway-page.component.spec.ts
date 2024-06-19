import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayPageComponent } from './gateway-page.component';

describe('GatewayPageComponent', () => {
  let component: GatewayPageComponent;
  let fixture: ComponentFixture<GatewayPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
