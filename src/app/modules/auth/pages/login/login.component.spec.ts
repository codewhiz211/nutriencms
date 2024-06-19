import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationMockService } from '@app/testing';
import { AuthenticationService } from '@app/core';

import { LoginComponent } from './login.component';


const fakeActivatedRoute = {
  snapshot: {
      queryParams: {
          returnUrl: '/'
      }
  }
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let authService: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        {provide: AuthenticationService, useClass: AuthenticationMockService},
        FormBuilder,
        { provide: ActivatedRoute, useFactory: () => fakeActivatedRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    router = TestBed.get(Router);
    authService = TestBed.get(AuthenticationService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('login form should be empty when loading', () => {
    const userNameDe: DebugElement = fixture.debugElement.query(By.css('#username'));
    const pwdDe: DebugElement = fixture.debugElement.query(By.css('#password'));

    expect(component.loginForm.controls.username.value).toEqual('');
    expect(component.loginForm.controls.password.value).toEqual('');
    expect(userNameDe.nativeElement.value).toEqual('');
    expect(pwdDe.nativeElement.value).toEqual('');
  });

  it('should require username and password when login', () => {
    const loginBtnDe = fixture.debugElement.query(By.css('.login-btn'));

    loginBtnDe.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#username-error')).nativeElement.textContent).toEqual('Username is required');
    expect(fixture.debugElement.query(By.css('#password-error')).nativeElement.textContent).toEqual('Password is required');

  });

  it('After validation check, error message should be disappeared', () => {
    const loginBtnDe = fixture.debugElement.query(By.css('.login-btn'));
    const userNameInput: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const pwdInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');

    loginBtnDe.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#username-error')).nativeElement.textContent).toEqual('Username is required');
    expect(fixture.debugElement.query(By.css('#password-error')).nativeElement.textContent).toEqual('Password is required');

    userNameInput.value = 'testUser';
    userNameInput.dispatchEvent(new Event('input'));
    pwdInput.value = 'password';
    pwdInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#username-error'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#password-error'))).toBeNull();
  });

});
