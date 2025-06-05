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
      searchConfiguration: this.createSearchConfigurationGroup(),
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

  /**
   * Creates the search configuration group with predefined validators.
   * @returns {FormGroup}
   */
  private createSearchConfigurationGroup(): FormGroup {
    return this.fb.group({
      autoTitle: this.fb.control(true),
      title: this.fb.control('New Search', Validators.required),
      searchMode: this.fb.control('repertoire', [
        Validators.required,
        valueInList(['repertoire', 'crossRepertoire']),
      ]),
      dataFilterActive: this.fb.control(true),
      exploitationFilterActive: this.fb.control(false),
    });
  };

  /**
   * Creates the data filter group with predefined validators.
   * @returns {FormGroup}
   */
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
    const { searchConfiguration } = config;

    form.patchValue({
      searchConfiguration: {
        autoTitle: searchConfiguration.autoTitle ?? true,
        title: searchConfiguration.title ?? 'New Tab',
        searchMode: searchConfiguration.searchMode ?? 'repertoire',
        target: searchConfiguration.target ?? { mode: 'me', singleUser: '', multipleUsers: [] },
        dataFilterActive: searchConfiguration.dataFilterActive ?? false,
        exploitationFilterActive: searchConfiguration.exploitationFilterActive ?? false,
      }


    }, { emitEvent: false });
  }
}
