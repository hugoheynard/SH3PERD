import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);

  readonly hasMinLength = computed(() => this.password().length >= 8);
  readonly hasUppercase = computed(() => /[A-Z]/.test(this.password()));
  readonly hasLowercase = computed(() => /[a-z]/.test(this.password()));
  readonly hasDigit = computed(() => /\d/.test(this.password()));
  readonly allRulesPass = computed(
    () => this.hasMinLength() && this.hasUppercase() && this.hasLowercase() && this.hasDigit(),
  );

  readonly formValid = computed(
    () =>
      this.firstName().trim().length > 0 &&
      this.lastName().trim().length > 0 &&
      this.email().trim().length > 0 &&
      this.allRulesPass(),
  );

  async onRegister(): Promise<void> {
    if (!this.formValid() || this.loading()) return;

    this.loading.set(true);
    try {
      const success = await firstValueFrom(
        this.authService.register$({
          first_name: this.firstName().trim(),
          last_name: this.lastName().trim(),
          email: this.email().trim(),
          password: this.password(),
        }),
      );

      if (success) {
        this.toast.show('Account created! Please sign in.', 'success');
        await this.router.navigateByUrl('/login');
      } else {
        this.toast.show('Registration failed. Email may already be in use.', 'error');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
