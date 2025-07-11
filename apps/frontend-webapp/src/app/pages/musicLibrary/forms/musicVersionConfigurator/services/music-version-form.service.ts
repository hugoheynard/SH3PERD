import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TGenreEnum, TMusicGrade, TMusicReferenceId, TTypeEnum } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class MusicVersionFormService {
  private fb: FormBuilder = inject(FormBuilder);

  buildForm() {
    return this.fb.group({
      title: this.fb.nonNullable.control<string>('', Validators.required),
      artist: this.fb.nonNullable.control<string>('', Validators.required),
      genre: this.fb.control<TGenreEnum | null>(null, Validators.required),
      type: this.fb.control<TTypeEnum | null>(null, Validators.required),
      bpm: this.fb.control<number | null>(null),
      pitch: this.fb.control<number>(0, Validators.required),
      musicReference_id: this.fb.control<TMusicReferenceId | null>(null),

      //MUSIC REFERENCE CREAT
      createMusicReference: this.fb.control<boolean>(false),
      musicReferenceDetails: this.fb.group({
        title: this.fb.control<string | null>(''),
        artist: this.fb.control<string | null>(''),
        useVersionDetails: this.fb.nonNullable.control<boolean>(false),
      })
    });
  };
}

/*
repertoireEntryData: this.fb.group({
        effort: this.fb.control<TMusicGrade | null>(null),
        energy: this.fb.control<TMusicGrade | null>(null),
        mastery: this.fb.control<TMusicGrade | null>(null),
        affinity: this.fb.control<TMusicGrade | null>(null),
      })
 */
