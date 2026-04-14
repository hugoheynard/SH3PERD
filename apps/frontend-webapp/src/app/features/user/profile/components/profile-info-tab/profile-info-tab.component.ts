import { ChangeDetectionStrategy, Component, computed, inject, type OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/button/button.component';
import { InputComponent } from '../../../../../shared/forms/input/input.component';
import { UserProfileFormService } from '../../services/user-profile.form.service';
import { UserProfileApiService } from '../../services/user-profile.api.service';
import { UserContextService } from '../../../../../core/services/user-context.service';

@Component({
  selector: 'app-profile-info-tab',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './profile-info-tab.component.html',
  styleUrl: './profile-info-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoTabComponent implements OnInit {
  private readonly formService = inject(UserProfileFormService);
  private readonly api = inject(UserProfileApiService);
  private readonly userCtx = inject(UserContextService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.formService.form;

  readonly emailForm = this.fb.group({
    newEmail: ['', [Validators.required, Validators.email]],
    confirmEmail: ['', [Validators.required, Validators.email]],
  });

  readonly editingProfile = signal(false);
  readonly editingPassword = signal(false);
  readonly editingEmail = signal(false);

  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly savingEmail = signal(false);
  readonly emailSuccess = signal(false);
  readonly emailError = signal('');

  readonly userEmail = computed(() => ''); // Email not in profile model yet

  ngOnInit(): void {
    this.api.getCurrentUserProfile().subscribe({
      next: (res) => this.formService.patchForm(res.data),
    });
  }

  /* ── Profile edit ── */

  startEditProfile(): void {
    this.editingProfile.set(true);
    this.saveSuccess.set(false);
  }

  cancelEditProfile(): void {
    this.editingProfile.set(false);
    const user = this.userCtx.userMe();
    if (user?.profile) {
      this.formService.patchForm({
        first_name: user.profile.first_name,
        last_name: user.profile.last_name,
        display_name: user.profile.display_name,
        phone: user.profile.phone,
      });
    }
  }

  submitProfile(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.saveSuccess.set(false);

    const data = this.form.getRawValue() as {
      first_name: string;
      last_name: string;
      display_name?: string;
      phone?: string;
    };

    this.api.updateUserProfile(data).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        this.editingProfile.set(false);
        this.userCtx.getUser();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  /* ── Email change ── */

  startEditEmail(): void {
    this.editingEmail.set(true);
    this.emailSuccess.set(false);
    this.emailError.set('');
    this.emailForm.reset();
  }

  cancelEditEmail(): void {
    this.editingEmail.set(false);
    this.emailForm.reset();
    this.emailError.set('');
  }

  emailsMatch(): boolean {
    const { newEmail, confirmEmail } = this.emailForm.getRawValue();
    return !!newEmail && newEmail === confirmEmail;
  }

  submitEmail(): void {
    if (this.emailForm.invalid || !this.emailsMatch() || this.savingEmail()) return;

    this.savingEmail.set(true);
    this.emailError.set('');
    this.emailSuccess.set(false);

    const { newEmail } = this.emailForm.getRawValue();

    this.api.changeEmail(newEmail!).subscribe({
      next: () => {
        this.savingEmail.set(false);
        this.emailSuccess.set(true);
        this.editingEmail.set(false);
        this.emailForm.reset();
      },
      error: () => {
        this.savingEmail.set(false);
        this.emailError.set('Failed to update email. Please try again.');
      },
    });
  }

  /* ── Password (placeholder) ── */

  togglePasswordEdit(): void {
    this.editingPassword.update(v => !v);
  }
}
