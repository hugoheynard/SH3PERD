import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PasswordFieldComponent } from '../../../shared/forms/password-field/password-field.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { BrandPanelComponent } from '../brand-panel/brand-panel.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { TurnstileWidgetComponent } from '../../../shared/turnstile/turnstile-widget.component';
import { environment } from '../../../../environments/env.dev';

export type AccountType = 'artist' | 'company';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    InputComponent,
    ButtonComponent,
    PasswordFieldComponent,
    RouterLink,
    BrandPanelComponent,
    IconComponent,
    TurnstileWidgetComponent,
  ],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild(TurnstileWidgetComponent)
  private readonly turnstile?: TurnstileWidgetComponent;

  readonly turnstileSiteKey = environment.turnstileSiteKey as string;
  readonly captchaToken = signal<string | null>(null);

  // ── Wizard state ──────────────────────────────────
  readonly step = signal<1 | 2 | 3>(1);
  readonly accountType = signal<AccountType | null>(null);

  // ── Step 2: profile info ──────────────────────────
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly companyName = signal('');

  // ── Step 3: credentials ───────────────────────────
  readonly email = signal('');
  readonly password = signal('');
  readonly passwordValid = signal(false);
  readonly loading = signal(false);

  // ── Step validations ──────────────────────────────
  readonly step2Valid = computed(() => {
    const hasName =
      this.firstName().trim().length >= 2 && this.lastName().trim().length >= 2;
    if (this.accountType() === 'company') {
      return hasName && this.companyName().trim().length >= 2;
    }
    return hasName;
  });

  readonly step3Valid = computed(
    () =>
      this.email().trim().length > 0 &&
      this.passwordValid() &&
      !!this.captchaToken(),
  );

  // ── Navigation ────────────────────────────────────
  selectAccountType(type: AccountType): void {
    this.accountType.set(type);
    this.step.set(2);
  }

  goToStep3(): void {
    if (this.step2Valid()) {
      this.step.set(3);
    }
  }

  goBack(): void {
    const current = this.step();
    if (current === 2) this.step.set(1);
    if (current === 3) this.step.set(2);
  }

  // ── Captcha handlers ──────────────────────────────
  onCaptchaVerified(token: string): void {
    this.captchaToken.set(token);
  }

  onCaptchaExpired(): void {
    this.captchaToken.set(null);
  }

  onCaptchaError(): void {
    this.captchaToken.set(null);
  }

  // ── Submit ────────────────────────────────────────
  async onRegister(): Promise<void> {
    if (!this.step3Valid() || this.loading()) return;

    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.authService.register$({
          first_name: this.firstName().trim(),
          last_name: this.lastName().trim(),
          email: this.email().trim(),
          password: this.password(),
          account_type: this.accountType()!,
          turnstileToken: this.captchaToken() ?? undefined,
          ...(this.accountType() === 'company' && this.companyName().trim()
            ? { company_name: this.companyName().trim() }
            : {}),
        }),
      );

      if (result.ok) {
        this.toast.show('Account created! Please sign in.', 'success');
        await this.router.navigateByUrl('/login');
        return;
      }

      // Single-use token — refresh it for any failure.
      this.captchaToken.set(null);
      this.turnstile?.reset();
      this.toast.show(this.errorMessageFor(result.code), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  private errorMessageFor(code: string | undefined): string {
    switch (code) {
      case 'CAPTCHA_REQUIRED':
      case 'CAPTCHA_FAILED':
        return 'Captcha check failed — please try again.';
      case 'EMAIL_ALREADY_EXISTS':
        return 'An account with this email already exists.';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}
