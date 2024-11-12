import {Component, inject, OnInit} from '@angular/core';
import {LoginFormComponent} from '../login-form/login-form.component';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    const canAutoLog = await this.authService.autoLog_localStorageCheck();

    if (!canAutoLog) {
      await this.router.navigate(['/login']);
    }
    await this.router.navigate(['/app/settings']);
  }

  async onLogin(credentials: any) {
    const success = await this.authService.login(credentials);

    if (!success) {
      console.error('Login failed');
    }
    await this.router.navigate(['/app/home']);
  };
}
