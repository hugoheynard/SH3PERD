import { Component, ViewChild, inject } from '@angular/core';
import { LoginFormComponent } from '../login-form/login-form.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import type { TLoginRequestDTO } from '@sh3pherd/shared-types';
import { BrandPanelComponent } from '../brand-panel/brand-panel.component';

@Component({
  selector: 'login',
  imports: [LoginFormComponent, RouterLink, BrandPanelComponent],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild(LoginFormComponent) private readonly form?: LoginFormComponent;

  public isFormValid: boolean = false;

  onValidityChange(valid: boolean): void {
    this.isFormValid = valid;
  }

  async onLogin(credentials: TLoginRequestDTO): Promise<void> {
    const result = await firstValueFrom(this.authService.login$(credentials));

    if (!result.ok) {
      // Captcha tokens are single-use — refresh the widget for any
      // failure so the user can retry without a stale token.
      this.form?.resetCaptcha();

      const message = this.errorMessageFor(result.code);
      this.toast.show(message, 'error');
      return;
    }

    await this.router.navigateByUrl('/app/program');
    this.toast.show('Welcome to SH3PHERD', 'success');
  }

  private errorMessageFor(code: string | undefined): string {
    switch (code) {
      case 'CAPTCHA_REQUIRED':
      case 'CAPTCHA_FAILED':
        return 'Captcha check failed — please try again.';
      case 'ACCOUNT_LOCKED':
        return 'Too many attempts — account is temporarily locked.';
      case 'USER_DEACTIVATED':
        return 'This account has been deactivated.';
      case 'GUEST_NOT_ACTIVATED':
        return 'Account not activated — please use your invitation link.';
      default:
        return 'Login failed';
    }
  }
}
