import {inject, Injectable} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {valueInList} from '../../../../../forms/validators/valueInList';
import {allArrayNumbersInRange} from '../../../../../forms/validators/allArrayNumbersInRange';
import {IMusicTabConfig} from '../../../types/IMusicTabConfig';


@Injectable({
  providedIn: 'root'
})
export class MusicTabConfiguratorFormService {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  createForm(): FormGroup<Record<string, AbstractControl>> {
    const form = new FormGroup<Record<string, AbstractControl>>({
      autoTitle: new FormControl(true),
      title: new FormControl('New Search', Validators.required),
      searchMode: new FormControl('repertoire', [
        Validators.required,
        valueInList(['repertoire', 'crossRepertoire']),
      ]),
      dataFilterActive: new FormControl(true),
      dataFilterOptions: this.createDataFilterGroup(),
      exploitationFilterActive: new FormControl(false),
    });

    // Extension dynamique permise
    const searchModeValue = form.get('searchMode')?.value ?? 'repertoire';
    form.addControl('target', this.buildTargetGroup(searchModeValue));

    return form;
  };

  /**
   * Builds the target group based on the search mode.
   * @param mode
   * @private
   */
  private buildTargetGroup(mode: string): FormGroup {
    switch (mode) {
      case 'repertoire':
        return this.fb.group({
          mode: this.fb.control('me', [
            Validators.required,
            valueInList(['me', 'single-user', 'multiple-users']),
          ]),
          singleUser: this.fb.control(''),
          multipleUsers: this.fb.control([]),
        });
      case 'crossRepertoire':
        return this.fb.group({
          clusterIds: this.fb.control([]),
          focusUser: this.fb.control(''),
        });
      default:
        return this.fb.group({});
    }
  };

  private createDataFilterGroup(): any {
    return this.fb.group({
      genre:  this.fb.control(['jazz', 'rock', 'pop'], [
        valueInList(['jazz', 'rock', 'pop', 'classical', 'metal', 'blues', 'country', 'hip-hop', 'electronic']),
      ]),
      keys: this.fb.control(['C', 'G', 'D'], [
        valueInList(['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Bb', 'Eb', 'Ab', 'Db']),
      ]),
      energy: this.fb.control([1, 2], [
        allArrayNumbersInRange(1, 4),
      ]),
      effort: this.fb.control([1, 3], [
        allArrayNumbersInRange(1, 4),
      ]),
      mastery: this.fb.control([4], [
        allArrayNumbersInRange(1, 4),
      ]),
    })
  }

  patchForm(form: FormGroup, config: IMusicTabConfig): void {
    form.patchValue({
      searchMode: config.searchMode ?? '',
      target: config.target ?? { mode: 'me', singleUser: '', multipleUsers: [] },
      dataFilterActive: config.dataFilterActive ?? false,
      exploitationFilterActive: config.exploitationFilterActive ?? false,

    }, { emitEvent: false });
  }
}
