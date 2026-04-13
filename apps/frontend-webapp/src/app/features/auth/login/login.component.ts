import { Component, inject } from '@angular/core';
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
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public isFormValid: boolean = false;

  onValidityChange(valid: boolean): void {
    this.isFormValid = valid;
  }

  async onLogin(credentials: TLoginRequestDTO): Promise<void> {
    const success = await firstValueFrom(this.authService.login$(credentials));

    if (!success) {
      this.toast.show('Login failed', 'error');
      return;
    }

    await this.router.navigateByUrl('/app/program');
    this.toast.show('Welcome to SH3PHERD', 'success');
  }
}
