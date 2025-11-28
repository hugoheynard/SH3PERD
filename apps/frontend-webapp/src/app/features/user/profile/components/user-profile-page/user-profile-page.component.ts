import { Component, inject, type OnInit } from '@angular/core';
import { ButtonPrimaryComponent } from '@sh3pherd/ui-angular';
import { UserProfileFormService } from '../../services/user-profile.form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileApiService } from '../../services/user-profile.api.service';
import { InputComponent } from '../../../../../shared/forms/input/input.component';
import { ButtonTertiaryComponent } from '../../../../../shared/buttons/button-tertiary/button-tertiary.component';

@Component({
  selector: 'app-user-profile-page',
  imports: [
    ReactiveFormsModule,
    ButtonPrimaryComponent,
    ButtonTertiaryComponent,
    InputComponent,
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.scss'
})
export class UserProfilePageComponent implements OnInit {
  upForm = inject(UserProfileFormService);
  upApi = inject(UserProfileApiService);
  upEditMode = false;
  passwordEditMode = false;


  ngOnInit(): void {
    this.upApi.getCurrentUserProfile().subscribe({
      next: (res) => {
        this.upForm.patchForm(res.data);
        console.log(this.upForm.form.value);
      },
      error: (err: unknown) => {
        console.error('Error fetching user profile:', err);
      }
    });
  };


  getProfileForm() {
    return this.upForm.form;
  };

  onSubmitProfile() {

  }

  onToggleUpEditMode() {
    if (!this.upEditMode) {
      this.upEditMode = !this.upEditMode;
    }
    this.upEditMode = !this.upEditMode;
    this.cancelUp();
  };

  onTogglePasswordEditMode() {
    this.passwordEditMode = !this.passwordEditMode;
  }

  cancelUp() {

  }
}
