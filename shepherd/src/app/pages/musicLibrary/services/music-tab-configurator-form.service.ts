import {inject, Injectable} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';

export interface TabConfigForm {
  autoTitle: FormControl<boolean>;
  componentType: string;
  title: string;
  repertoireOptions: {
    target: string;
  };
  dataFilter: boolean;
  dataFilterOptions: {
    energy: number;
    effort: number;
    mastery: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MusicTabConfiguratorFormService {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  createForm(): any {
    return this.fb.group({
      autoTitle: this.fb.control(true),
      title: this.fb.control('New Search', Validators.required),
      componentType: this.fb.control('repertoire', Validators.required),
      targetMode: this.fb.control('me', Validators.required),
      repertoireOptions: this.fb.group({
        target: this.fb.control('me', Validators.required),
      }),
      targetUser: this.fb.control(''),
      dataFilter: this.fb.control(true),
      exploitationFilter: this.fb.control(false),
      displayAsSingleSearch: this.fb.control(false),
      dataFilterOptions: this.createDataFilterGroup(),
    });
  }

  createDataFilterGroup(): FormGroup {
    return this.fb.group({
      genre:  this.fb.control<string[]>(['jazz', 'rock', 'pop']),
      keys: this.fb.control<string[]>(['C', 'G', 'D']),
      energy: this.fb.control([1, 2]),
      effort: this.fb.control([1, 3]),
      mastery: this.fb.control([4]),
    })
  }
}
