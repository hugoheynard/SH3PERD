import {Component, inject} from '@angular/core';
import {LoginFormComponent} from '../login-form/login-form.component';
import {NgOptimizedImage} from '@angular/common';
import {NavigationService} from '../../app/services/navigation.service';
import {SnackbarService} from '../../app/services/snackbar.service';
import {AuthService} from '../../app/services/auth.service';
import {TLoginRequestDTO} from '@sh3pherd/shared-types';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'login',
  imports: [LoginFormComponent, NgOptimizedImage],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private navigationService = inject(NavigationService);
  private snackbarService = inject(SnackbarService);
  private authService = inject(AuthService);

  async onLogin(credentials: TLoginRequestDTO): Promise<void> {
    const success = await firstValueFrom(this.authService.login(credentials));

    if (!success) {
      this.snackbarService.show('Login failed', 'Close', 3000);
      return;
    }

    await this.navigationService.goToHome();
    this.snackbarService.show('Welcome to SH3PHERD', 'Close', 3000);
  };
}
