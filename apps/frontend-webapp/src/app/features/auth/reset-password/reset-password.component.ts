import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PasswordFieldComponent } from '../../../shared/forms/password-field/password-field.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { BrandPanelComponent } from '../brand-panel/brand-panel.component';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, InputComponent, ButtonComponent, PasswordFieldComponent, RouterLink, BrandPanelComponent],
  templateUrl: './reset-password.component.html',
  standalone: true,
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly token = toSignal(
    this.route.queryParamMap.pipe(map(p => p.get('token'))),
  );

  readonly newPassword = signal('');
  readonly passwordValid = signal(false);
  readonly confirmPassword = signal('');
  readonly loading = signal(false);

  readonly passwordsMatch = computed(
    () => this.newPassword().length > 0 && this.newPassword() === this.confirmPassword(),
  );

  readonly formValid = computed(
    () => this.passwordValid() && this.passwordsMatch() && !!this.token(),
  );

  async onReset(): Promise<void> {
    const t = this.token();
    if (!this.formValid() || this.loading() || !t) return;

    this.loading.set(true);
    try {
      const success = await firstValueFrom(
        this.authService.resetPassword$(t, this.newPassword()),
      );

      if (success) {
        this.toast.show('Password reset! Please sign in.', 'success');
        await this.router.navigateByUrl('/login');
      } else {
        this.toast.show('Reset failed. The link may have expired.', 'error');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
