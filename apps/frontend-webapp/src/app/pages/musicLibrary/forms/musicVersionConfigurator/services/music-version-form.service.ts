import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';


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
        key: this.fb.group({
          root: this.fb.control<string | null>(null),
          alteration: this.fb.control<string| null>(null),
          tone: this.fb.control<string | null>(null),
        })
      }),
      options: this.fb.group({
        trackMapEnabled: this.fb.control<boolean>(true),
        addToUserRepertoire_me: this.fb.control<boolean>(true),
      }),
      musicReference_id: this.fb.control<string>(''),
      repertoireEntryData: this.fb.group({
        effort: this.fb.control<number | null>(null),
        energy: this.fb.control<number | null>(null),
        mastery: this.fb.control<number | null>(null),
        affinity: this.fb.control<number | null>(null),
      })
    })
  }
}
