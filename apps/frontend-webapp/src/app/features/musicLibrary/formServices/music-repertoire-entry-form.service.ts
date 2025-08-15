import { inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import type { TMusicGrade } from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class MusicRepertoireEntryFormService {
  private fb: FormBuilder = inject(FormBuilder);

  buildForm(): any {
    return this.fb.group({
      effort: this.fb.control<TMusicGrade | null>(null),
      energy: this.fb.control<TMusicGrade | null>(null),
      mastery: this.fb.control<TMusicGrade | null>(null),
      affinity: this.fb.control<TMusicGrade | null>(null),
    })
  };
}
