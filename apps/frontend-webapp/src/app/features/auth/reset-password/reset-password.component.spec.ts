import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['resetPassword$']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));
    queryParamMap$ = new BehaviorSubject(convertToParamMap({ token: 'reset-token' }));

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

    expect(component.passwordsMatch()).toBeTrue();
    expect(component.formValid()).toBeTrue();

    queryParamMap$.next(convertToParamMap({}));
    fixture.detectChanges();

    expect(component.formValid()).toBeFalse();
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
    authService.resetPassword$.and.returnValue(of(true));
    component.newPassword.set('secret');
    component.confirmPassword.set('secret');
    component.passwordValid.set(true);

    await component.onReset();

    expect(authService.resetPassword$).toHaveBeenCalledOnceWith('reset-token', 'secret');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/login');
    expect(toast.show).toHaveBeenCalledOnceWith('Password reset! Please sign in.', 'success');
    expect(component.loading()).toBeFalse();
  });

  it('shows an error toast when the reset fails', async () => {
    authService.resetPassword$.and.returnValue(of(false));
    component.newPassword.set('secret');
    component.confirmPassword.set('secret');
    component.passwordValid.set(true);

    await component.onReset();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledOnceWith(
      'Reset failed. The link may have expired.',
      'error',
    );
    expect(component.loading()).toBeFalse();
  });
});
