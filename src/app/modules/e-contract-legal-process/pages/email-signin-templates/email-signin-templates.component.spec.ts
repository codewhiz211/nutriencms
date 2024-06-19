import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSigninTemplatesComponent } from './email-signin-templates.component';

describe('EmailSigninTemplatesComponent', () => {
  let component: EmailSigninTemplatesComponent;
  let fixture: ComponentFixture<EmailSigninTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailSigninTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSigninTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
