import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: jest.Mocked<AuthService>;
  let toast: jest.Mocked<ToastService>;
  let router: jest.Mocked<Router>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    authService = {
      resetPassword$: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    toast = { show: jest.fn() } as unknown as jest.Mocked<ToastService>;
    router = { navigateByUrl: jest.fn() } as unknown as jest.Mocked<Router>;
    router.navigateByUrl.mockReturnValue(Promise.resolve(true));
    queryParamMap$ = new BehaviorSubject(
      convertToParamMap({ token: 'reset-token' }),
    );

    TestBed.overrideComponent(ResetPasswordComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.token()).toBe('reset-token');
  });

  it('computes form validity from token, password validity and confirmation', () => {
    component.newPassword.set('secret');
    component.confirmPassword.set('secret');
    component.passwordValid.set(true);

    expect(component.passwordsMatch()).toBe(true);
    expect(component.formValid()).toBe(true);

    queryParamMap$.next(convertToParamMap({}));
    fixture.detectChanges();

    expect(component.formValid()).toBe(false);
  });

  it('does not submit when the form is invalid or already loading', async () => {
    await component.onReset();
    expect(authService.resetPassword$).not.toHaveBeenCalled();

    component.newPassword.set('secret');
    component.confirmPassword.set('secret');
    component.passwordValid.set(true);
    component.loading.set(true);
    await component.onReset();
    expect(authService.resetPassword$).not.toHaveBeenCalled();
  });

  it('resets the password and redirects to login on success', async () => {
    authService.resetPassword$.mockReturnValue(of(true));
    component.newPassword.set('secret');
    component.confirmPassword.set('secret');
    component.passwordValid.set(true);

    await component.onReset();

    expect(authService.resetPassword$).toHaveBeenCalledWith(
      'reset-token',
      'secret',
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(toast.show).toHaveBeenCalledWith(
      'Password reset! Please sign in.',
      'success',
    );
    expect(component.loading()).toBe(false);
  });

  it('shows an error toast when the reset fails', async () => {
    authService.resetPassword$.mockReturnValue(of(false));
    component.newPassword.set('secret');
    component.confirmPassword.set('secret');
    component.passwordValid.set(true);

    await component.onReset();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'Reset failed. The link may have expired.',
      'error',
    );
    expect(component.loading()).toBe(false);
  });
});
