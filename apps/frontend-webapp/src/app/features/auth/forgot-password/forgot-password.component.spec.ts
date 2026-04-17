import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/services/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authService = {
      forgotPassword$: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    TestBed.overrideComponent(ForgotPasswordComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit when the email is blank or the form is already loading', async () => {
    await component.onSubmit();
    expect(authService.forgotPassword$).not.toHaveBeenCalled();

    component.email.set('john@doe.com');
    component.loading.set(true);
    await component.onSubmit();
    expect(authService.forgotPassword$).not.toHaveBeenCalled();
  });

  it('submits the trimmed email and marks the flow as submitted', async () => {
    authService.forgotPassword$.mockReturnValue(of(true));
    component.email.set(' john@doe.com ');

    await component.onSubmit();

    expect(authService.forgotPassword$).toHaveBeenCalledWith('john@doe.com');
    expect(component.submitted()).toBe(true);
    expect(component.loading()).toBe(false);
  });
});
