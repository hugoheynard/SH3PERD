import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login$']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.overrideComponent(LoginComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the form validity state', () => {
    component.onValidityChange(true);
    expect(component.isFormValid).toBeTrue();

    component.onValidityChange(false);
    expect(component.isFormValid).toBeFalse();
  });

  it('shows an error toast when login fails', async () => {
    authService.login$.and.returnValue(of(false));

    await component.onLogin({ email: 'john@doe.com', password: 'secret' });

    expect(authService.login$).toHaveBeenCalledWith({ email: 'john@doe.com', password: 'secret' });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledOnceWith('Login failed', 'error');
  });

  it('navigates to the app and shows a success toast when login succeeds', async () => {
    authService.login$.and.returnValue(of(true));

    await component.onLogin({ email: 'john@doe.com', password: 'secret' });

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/app/program');
    expect(toast.show).toHaveBeenCalledOnceWith('Welcome to SH3PHERD', 'success');
  });
});
