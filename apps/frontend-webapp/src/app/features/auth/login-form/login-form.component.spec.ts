import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(LoginFormComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits submitted credentials with the captcha token for a valid form payload', () => {
    const emitSpy = spyOn(component.login, 'emit');
    component.onCaptchaVerified('cf-token-abc');

    component.onSubmit({
      valid: true,
      value: { email: 'john@doe.com', password: 'secret' },
    });

    expect(emitSpy).toHaveBeenCalledWith({
      email: 'john@doe.com',
      password: 'secret',
      turnstileToken: 'cf-token-abc',
    });
  });

  it('does not emit when the form is invalid', () => {
    const emitSpy = spyOn(component.login, 'emit');

    component.onSubmit({
      valid: false,
      value: { email: 'john@doe.com', password: 'secret' },
    });

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('clears the captcha token on expiration and error', () => {
    component.onCaptchaVerified('cf-token-abc');
    expect(component.captchaToken()).toBe('cf-token-abc');

    component.onCaptchaExpired();
    expect(component.captchaToken()).toBeNull();

    component.onCaptchaVerified('cf-token-def');
    component.onCaptchaError();
    expect(component.captchaToken()).toBeNull();
  });
});
