import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jest.Mocked<AuthService>;
  let toast: jest.Mocked<ToastService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    authService = {
      register$: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    toast = { show: jest.fn() } as unknown as jest.Mocked<ToastService>;
    router = { navigateByUrl: jest.fn() } as unknown as jest.Mocked<Router>;
    router.navigateByUrl.mockReturnValue(Promise.resolve(true));

    TestBed.overrideComponent(RegisterComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('moves to step 2 when an account type is selected', () => {
    component.selectAccountType('artist');

    expect(component.accountType()).toBe('artist');
    expect(component.step()).toBe(2);
  });

  it('validates step 2 differently for artist and company accounts', () => {
    component.selectAccountType('artist');
    component.firstName.set('John');
    component.lastName.set('Doe');

    expect(component.step2Valid()).toBe(true);

    component.selectAccountType('company');
    component.companyName.set('');

    expect(component.step2Valid()).toBe(false);

    component.companyName.set('Acme');
    expect(component.step2Valid()).toBe(true);
  });

  it('only moves to step 3 when step 2 is valid', () => {
    component.selectAccountType('artist');
    component.goToStep3();
    expect(component.step()).toBe(2);

    component.firstName.set('John');
    component.lastName.set('Doe');
    component.goToStep3();
    expect(component.step()).toBe(3);
  });

  it('goes back one step at a time', () => {
    component.step.set(3);
    component.goBack();
    expect(component.step()).toBe(2);

    component.goBack();
    expect(component.step()).toBe(1);
  });

  it('does not submit when the last step is invalid or already loading', async () => {
    await component.onRegister();
    expect(authService.register$).not.toHaveBeenCalled();

    component.step.set(3);
    component.accountType.set('artist');
    component.firstName.set('John');
    component.lastName.set('Doe');
    component.email.set('john@doe.com');
    component.password.set('secret');
    component.passwordValid.set(true);
    component.loading.set(true);

    await component.onRegister();
    expect(authService.register$).not.toHaveBeenCalled();
  });

  it('submits a trimmed artist registration payload and redirects on success', async () => {
    authService.register$.mockReturnValue(of(true));
    component.selectAccountType('artist');
    component.firstName.set(' John ');
    component.lastName.set(' Doe ');
    component.email.set(' john@doe.com ');
    component.password.set('secret');
    component.passwordValid.set(true);
    component.step.set(3);

    await component.onRegister();

    expect(authService.register$).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      password: 'secret',
      account_type: 'artist',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(toast.show).toHaveBeenCalledWith(
      'Account created! Please sign in.',
      'success',
    );
    expect(component.loading()).toBe(false);
  });

  it('includes company_name for company registrations and shows an error toast on failure', async () => {
    authService.register$.mockReturnValue(of(false));
    component.selectAccountType('company');
    component.firstName.set('John');
    component.lastName.set('Doe');
    component.companyName.set(' Acme ');
    component.email.set('john@doe.com');
    component.password.set('secret');
    component.passwordValid.set(true);
    component.step.set(3);

    await component.onRegister();

    expect(authService.register$).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      password: 'secret',
      account_type: 'company',
      company_name: 'Acme',
    });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'Registration failed. Email may already be in use.',
      'error',
    );
    expect(component.loading()).toBe(false);
  });
});
