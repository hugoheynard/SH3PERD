import { inject, Injectable } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class MusicVersionFormService {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  buildForm() {
    return this.fb.group({
      details: this.fb.group({
        title: this.fb.control('', Validators.required),
        artist: this.fb.control('', Validators.required),
        type: this.fb.control(''),
        genre: this.fb.control('')
      }),
      musicData: this.fb.group({
        bpm: this.fb.control(''),
        pitch: this.fb.control('', Validators.required),
        key: this.fb.control('')
      }),
      options: this.fb.group({
        trackMapEnabled: this.fb.control(true),
        addToUserRepertoire_me: this.fb.control(true),
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
