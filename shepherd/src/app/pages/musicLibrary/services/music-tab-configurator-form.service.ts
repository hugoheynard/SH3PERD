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
      title: this.fb.control('New Tab', Validators.required),
      componentType: this.fb.control('repertoire', Validators.required),
      targetMode: this.fb.control('me', Validators.required),
      repertoireOptions: this.fb.group({
        target: this.fb.control('me', Validators.required),
      }),
      targetUser: this.fb.control(''),
      dataFilter: false,
      dataFilterOptions: this.fb.group({
        energy: 1,
        effort: 1,
        mastery: 3,
      })
    });
  }
}
