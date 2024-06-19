import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateGLXMLComponent } from './generate-glxml.component';

describe('GenerateGLXMLComponent', () => {
  let component: GenerateGLXMLComponent;
  let fixture: ComponentFixture<GenerateGLXMLComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateGLXMLComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateGLXMLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
