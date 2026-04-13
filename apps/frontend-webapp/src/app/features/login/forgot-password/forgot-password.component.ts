import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './forgot-password.component.html',
  standalone: true,
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  readonly email = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email().trim() || this.loading()) return;

    this.loading.set(true);
    try {
      await firstValueFrom(this.authService.forgotPassword$(this.email().trim()));
      this.submitted.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
