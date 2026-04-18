import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let toast: jest.Mocked<ToastService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    authService = { login$: jest.fn() } as unknown as jest.Mocked<AuthService>;
    toast = { show: jest.fn() } as unknown as jest.Mocked<ToastService>;
    router = { navigateByUrl: jest.fn() } as unknown as jest.Mocked<Router>;
    router.navigateByUrl.mockReturnValue(Promise.resolve(true));

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
    expect(component.isFormValid).toBe(true);

    component.onValidityChange(false);
    expect(component.isFormValid).toBe(false);
  });

  it('shows an error toast when login fails', async () => {
    authService.login$.mockReturnValue(of({ ok: false }));

    await component.onLogin({ email: 'john@doe.com', password: 'secret' });

    expect(authService.login$).toHaveBeenCalledWith({
      email: 'john@doe.com',
      password: 'secret',
    });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith('Login failed', 'error');
  });

  it('shows a captcha-specific toast on CAPTCHA_FAILED', async () => {
    authService.login$.mockReturnValue(
      of({ ok: false, code: 'CAPTCHA_FAILED', status: 400 }),
    );

    await component.onLogin({ email: 'john@doe.com', password: 'secret' });

    expect(toast.show).toHaveBeenCalledWith(
      'Captcha check failed — please try again.',
      'error',
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigates to the app and shows a success toast when login succeeds', async () => {
    authService.login$.mockReturnValue(of({ ok: true }));

    await component.onLogin({ email: 'john@doe.com', password: 'secret' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/program');
    expect(toast.show).toHaveBeenCalledWith('Welcome to SH3PHERD', 'success');
  });
});
