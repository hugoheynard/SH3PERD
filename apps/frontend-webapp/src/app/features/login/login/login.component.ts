import {Component, inject} from '@angular/core';
import {LoginFormComponent} from '../login-form/login-form.component';
import {NgOptimizedImage} from '@angular/common';
//import {NavigationService} from '../../../services/navigation.service';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {AuthService} from '../../../core/services/auth.service';
import {firstValueFrom} from 'rxjs';
import { Router } from '@angular/router';
import type { TLoginRequestDTO } from '@sh3pherd/shared-types';

@Component({
  selector: 'login',
  imports: [LoginFormComponent, NgOptimizedImage],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  //private navigationService = inject(NavigationService);
  private snackbarService = inject(SnackbarService);
  private authService = inject(AuthService);

  public isFormValid: boolean = false;

  constructor(private router: Router) {}

  onValidityChange(valid: boolean): void {
    this.isFormValid = valid;
  };

  async onLogin(credentials: TLoginRequestDTO): Promise<void> {
    const success = await firstValueFrom(this.authService.login$(credentials));

    if (!success) {
      this.snackbarService.show('Login failed', 'Close', 3000);
      return;
    }

    await this.router.navigateByUrl('/app/home');
    this.snackbarService.show('Welcome to SH3PHERD', 'Close', 3000);
  };
}
