import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import {UserLoginInfos} from '../../../interfaces/userLoginInfos';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, LoginFormComponent], // Import standalone component
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login and navigate on successful login', async () => {
    // Mock login success
    authServiceSpy.login.and.returnValue(Promise.resolve(true));

    const mockCredentials: UserLoginInfos = { email: 'testuser', password: 'testpass' };

    // Call the onLogin method with mock credentials
    await component.onLogin(mockCredentials);

    // Check that AuthService login was called with the correct credentials
    expect(authServiceSpy.login).toHaveBeenCalledWith(mockCredentials);

    // Check that the router navigated to the home route
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/home']);
  });

  it('should log an error and not navigate on failed login', async () => {
    // Mock login failure
    authServiceSpy.login.and.returnValue(Promise.resolve(false));

    const mockCredentials: UserLoginInfos = { email: 'testuser', password: 'wrongpass' };
    const consoleSpy = spyOn(console as any, 'error');
    //spyOn<any>(console, 'error'); // Spy on console.error to check for error logging

    // Call the onLogin method with mock credentials
    await component.onLogin(mockCredentials);

    // Check that AuthService login was called with the correct credentials
    expect(authServiceSpy.login).toHaveBeenCalledWith(mockCredentials);

    // Check that console.error was called for the failed login
    expect(consoleSpy).toHaveBeenCalledWith('Login failed' as any);

    // Check that the router did not navigate
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
