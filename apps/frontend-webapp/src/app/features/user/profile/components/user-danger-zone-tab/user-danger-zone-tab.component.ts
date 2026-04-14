import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../../../shared/button/button.component';
import { InputComponent } from '../../../../../shared/forms/input/input.component';
import { AuthService } from '../../../../../core/services/auth.service';

type DangerStep = 'idle' | 'confirming' | 'submitting' | 'error';

@Component({
  selector: 'app-user-danger-zone-tab',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  templateUrl: './user-danger-zone-tab.component.html',
  styleUrl: './user-danger-zone-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDangerZoneTabComponent {
  private readonly authService = inject(AuthService);

  readonly step = signal<DangerStep>('idle');
  readonly password = signal('');
  readonly errorMessage = signal('');

  requestDelete(): void {
    this.step.set('confirming');
    this.password.set('');
    this.errorMessage.set('');
  }

  cancel(): void {
    this.step.set('idle');
    this.password.set('');
    this.errorMessage.set('');
  }

  async confirmDelete(): Promise<void> {
    if (!this.password().trim()) return;

    this.step.set('submitting');
    this.errorMessage.set('');

    try {
      await firstValueFrom(this.authService.deactivateAccount$(this.password()));
      // On success: logout clears tokens and redirects to login
      this.authService.logout();
    } catch (err: unknown) {
      this.step.set('error');
      const httpErr = err as { error?: { errorCode?: string } };
      if (httpErr?.error?.errorCode === 'INVALID_PASSWORD') {
        this.errorMessage.set('Password is incorrect. Please try again.');
      } else {
        this.errorMessage.set('Something went wrong. Please try again.');
      }
    }
  }
}
