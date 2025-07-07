import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TMusicReferenceId } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class MusicVersionFormService {
  private fb: FormBuilder = inject(FormBuilder);

  buildForm() {
    return this.fb.group({
      details: this.fb.group({
        title: this.fb.control('', Validators.required),
        artist: this.fb.control('', Validators.required),
      }),
      musicData: this.fb.group({
        genre: this.fb.control<string>('', Validators.required),
        type: this.fb.control<string>('', Validators.required),
        bpm: this.fb.control<number | null>(null),
        pitch: this.fb.control<number>(0, Validators.required),
      }),
      //MUSIC REFERENCE
      musicReference_id: this.fb.control<TMusicReferenceId | null>(null),
      createMusicReference: this.fb.control<boolean>(false),
      musicReferenceDetails: this.fb.group({
        title: this.fb.control('', Validators.required),
        artist: this.fb.control('', Validators.required),
        useVersionDetails: this.fb.nonNullable.control<boolean>(false),
      }),
      repertoireEntryData: this.fb.group({
        effort: this.fb.control<number | null>(null),
        energy: this.fb.control<number | null>(null),
        mastery: this.fb.control<number | null>(null),
        affinity: this.fb.control<number | null>(null),
      })
    })
  }
}
