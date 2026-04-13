import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';

export type AccountType = 'artist' | 'company';

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
  readonly loading = signal(false);

  // ── Password rules ────────────────────────────────
  readonly hasMinLength = computed(() => this.password().length >= 8);
  readonly hasUppercase = computed(() => /[A-Z]/.test(this.password()));
  readonly hasLowercase = computed(() => /[a-z]/.test(this.password()));
  readonly hasDigit = computed(() => /\d/.test(this.password()));
  readonly allRulesPass = computed(
    () => this.hasMinLength() && this.hasUppercase() && this.hasLowercase() && this.hasDigit(),
  );

  // ── Step validations ──────────────────────────────
  readonly step2Valid = computed(() => {
    const hasName = this.firstName().trim().length >= 2 && this.lastName().trim().length >= 2;
    if (this.accountType() === 'company') {
      return hasName && this.companyName().trim().length >= 2;
    }
    return hasName;
  });

  readonly step3Valid = computed(
    () => this.email().trim().length > 0 && this.allRulesPass(),
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

  // ── Submit ────────────────────────────────────────
  async onRegister(): Promise<void> {
    if (!this.step3Valid() || this.loading()) return;

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
