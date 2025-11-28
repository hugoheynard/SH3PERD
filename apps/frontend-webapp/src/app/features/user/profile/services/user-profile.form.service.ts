import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import type { TUserProfileViewModel } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class UserProfileFormService {
  private readonly fb = inject(FormBuilder);
  public form = this.createUserProfileForm();


  createUserProfileForm() {
    return this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      display_name: [''],
      phone: [''],
    });
  };

  patchForm(data: TUserProfileViewModel) {
    this.form.patchValue(data);
  };
}

