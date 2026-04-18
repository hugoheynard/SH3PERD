import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { TurnstileWidgetComponent } from '../../../shared/turnstile/turnstile-widget.component';
import { environment } from '../../../../environments/env.dev';
import type { TLoginRequestDTO } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    RouterLink,
    TurnstileWidgetComponent,
  ],
  templateUrl: './login-form.component.html',
  standalone: true,
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  @Output() validityChanged = new EventEmitter<boolean>();
  @Output() login = new EventEmitter<TLoginRequestDTO>();

  @ViewChild(TurnstileWidgetComponent)
  private readonly turnstile?: TurnstileWidgetComponent;

  readonly turnstileSiteKey = environment.turnstileSiteKey as string;
  readonly captchaToken = signal<string | null>(null);

  onCaptchaVerified(token: string): void {
    this.captchaToken.set(token);
  }

  onCaptchaExpired(): void {
    this.captchaToken.set(null);
  }

  onCaptchaError(): void {
    this.captchaToken.set(null);
  }

  /** Called by the parent when the backend rejects the captcha. */
  resetCaptcha(): void {
    this.captchaToken.set(null);
    this.turnstile?.reset();
  }

  onSubmit(credentials: any): void {
    if (!credentials.valid) {
      return;
    }
    this.login.emit({
      email: credentials.value.email,
      password: credentials.value.password,
      turnstileToken: this.captchaToken() ?? undefined,
    });
  }
}
