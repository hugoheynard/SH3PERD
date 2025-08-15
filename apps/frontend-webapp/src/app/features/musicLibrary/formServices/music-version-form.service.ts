import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, type ValidatorFn, Validators } from '@angular/forms';
import type {
  TGenreEnum,
  TMusicReferenceId,
  TMusicVersionCreationFormPayload,
  TTypeEnum,
} from '@sh3pherd/shared-types';
import { MusicVersionService } from '../services/music-version.service';

export interface IMusicVersionForm {
  title: FormControl<string>;
  artist: FormControl<string>;
  genre: FormControl<TGenreEnum | null>;
  type: FormControl<TTypeEnum | null>;
  bpm: FormControl<number | null>;
  pitch: FormControl<number>;
  musicReference_id: FormControl<TMusicReferenceId | null>;
}

@Injectable({
  providedIn: 'root'
})
export class MusicVersionFormService {
  private fb: FormBuilder = inject(FormBuilder);
  private http: MusicVersionService = inject(MusicVersionService);
  public form: FormGroup<IMusicVersionForm> = this.initForm();

  initForm(): FormGroup<IMusicVersionForm>{
    return this.fb.group<IMusicVersionForm>({
      title: this.fb.nonNullable.control('', Validators.required),
      artist: this.fb.nonNullable.control('', Validators.required),
      genre: this.fb.control(null, [Validators.required, this.notNullValidator()]),
      type: this.fb.control(null, [Validators.required, this.notNullValidator()]),
      bpm: this.fb.control(null),
      pitch: this.fb.nonNullable.control(0, Validators.required),
      musicReference_id: this.fb.control(null),
    });
  }

  async submit(): Promise<any>{
    if(!this.form.valid) {
      console.error('Form is not valid', this.form.errors);
      return;
    }

    const raw = this.form.getRawValue();

    if (!raw.genre || !raw.type ) {
      return;
    }


    const payload: TMusicVersionCreationFormPayload = {
      ...raw,
      genre: raw.genre,
      type: raw.type
    };


    await this.http.createOneMusicVersion(payload);
  };

  notNullValidator(): ValidatorFn {
    return (control: AbstractControl) => control.value === null ? { required: true } : null;
  };
}


