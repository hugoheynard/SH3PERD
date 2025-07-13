import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TGenreEnum, TMusicReferenceId, TTypeEnum } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class MusicVersionFormService {
  private fb: FormBuilder = inject(FormBuilder);

  buildForm(): any {
    return this.fb.group({
      title: this.fb.nonNullable.control<string>('', Validators.required),
      artist: this.fb.nonNullable.control<string>('', Validators.required),
      genre: this.fb.control<TGenreEnum | null>(null, Validators.required),
      type: this.fb.control<TTypeEnum | null>(null, Validators.required),
      bpm: this.fb.control<number | null>(null),
      pitch: this.fb.control<number>(0, Validators.required),
      musicReference_id: this.fb.control<TMusicReferenceId | null>(null),
    });
  };
}


