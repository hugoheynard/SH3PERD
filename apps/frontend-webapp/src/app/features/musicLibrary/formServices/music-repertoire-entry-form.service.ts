import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  type FormControl, type FormGroup,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import type { TMusicGrade } from '@sh3pherd/shared-types';

export interface MusicRepertoireEntryForm {
  effort: FormControl<TMusicGrade | undefined>;
  energy: FormControl<TMusicGrade | undefined>;
  mastery: FormControl<TMusicGrade | undefined>;
  affinity: FormControl<TMusicGrade | undefined>;
}

@Injectable({
  providedIn: 'root'
})
export class MusicRepertoireEntryFormService {
  private fb: FormBuilder = inject(FormBuilder);

  buildForm(): FormGroup<MusicRepertoireEntryForm> {
    return this.fb.group({
      effort: this.fb.control<TMusicGrade | undefined>(undefined, this.isValidGrade()),
      energy: this.fb.control<TMusicGrade | undefined>(undefined, this.isValidGrade()),
      mastery: this.fb.control<TMusicGrade | undefined>(undefined, this.isValidGrade()),
      affinity: this.fb.control<TMusicGrade | undefined>(undefined, this.isValidGrade()),
    });
  };

  patchForm(formGroup: FormGroup<MusicRepertoireEntryForm>, data: any): void {
    formGroup.patchValue(data);
  }

  /**
   * Validator to check if the grade is one of the allowed values (1, 2, 3, 4)
   */
  isValidGrade(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      const allowed: TMusicGrade[] = [1, 2, 3, 4];

      // check
      return allowed.includes(value) ? null : { invalidGrade: true };
    };
  };
}
