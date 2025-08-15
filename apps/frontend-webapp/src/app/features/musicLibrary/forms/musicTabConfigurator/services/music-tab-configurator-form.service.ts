import {inject, Injectable} from '@angular/core';
import {AbstractControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {valueInList} from '../../../../../forms/validators/valueInList';
import {allArrayNumbersInRange} from '../../../../../forms/validators/allArrayNumbersInRange';
import type { TMusicTabConfiguration } from '../../../types/TMusicTabConfiguration';
import {deepPatchForm} from '../../../../../forms/validators/deepPatchForm';


@Injectable({
  providedIn: 'root'
})
export class MusicTabConfiguratorFormService {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  createForm(): FormGroup<Record<string, AbstractControl>> {
    return new FormGroup<Record<string, AbstractControl>>({
      autoTitle: this.fb.control(true),
      title: this.fb.control('New Search', Validators.required),
      searchConfiguration: this.createSearchConfigurationGroup(),
      dataFilterOptions: this.createDataFilterGroup(),
    }) as FormGroup;
  };

  /**
   * Creates the search configuration group with predefined validators.
   * @returns {FormGroup}
   */
  private createSearchConfigurationGroup(): FormGroup {
    return this.fb.group({
      searchMode: this.fb.control('repertoire', [
        Validators.required,
        valueInList(['repertoire', 'crossRepertoire']),
      ]),
      target: this.buildTargetGroup(),
      dataFilterActive: this.fb.control(true),
      exploitationFilterActive: this.fb.control(false),
      displaySearchAsFolder: this.fb.control(null),
    });
  };

  /**
   * Builds the target group.
   * @private
   */
  private buildTargetGroup(): FormGroup {
    return this.fb.group({
      mode: this.fb.control('me', [
        Validators.required,
        valueInList(['me', 'single-user', 'multiple-users']),
      ]),
      singleUser_id: this.fb.control(''),
      multipleUsers_id: this.fb.control([]),
    });
  };



  /**
   * Creates the data filter group with predefined validators.
   * @returns {FormGroup}
   */
  private createDataFilterGroup(): FormGroup {
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

  patchForm(form: FormGroup, config: TMusicTabConfiguration): void {
    deepPatchForm(form, config, true);
  };


  // ──────────── AUTO TITLE ────────────
  generateAutoTitleFromForm(formValue: any): string {
    const parts: string[] = [];

    // Target (my, user's, etc.)
    switch (formValue.targetMode) {
      case 'me':
        parts.push('my');
        break;
      case 'single-user':
        parts.push("user’s");
        break;
      case 'multiple-users':
        parts.push('shared');
        break;
    }

    // Filters
    if (formValue.dataFilters) {
      if (formValue.dataFilters.energy) {
        parts.push(formValue.dataFilters.energy); // e.g. "low"
      }
      if (formValue.dataFilters.genre) {
        parts.push(formValue.dataFilters.genre); // e.g. "jazz"
      }
    }

    // Type
    switch (formValue.componentType) {
      case 'repertoire':
        parts.push('repertoire');
        break;
      case 'crossSearch':
        parts.push('cross search');
        break;
    }

    return parts.join(' ').trim();
  }

  //SUBFORM GETTERS
  getSearchConfigurationGroup(form: FormGroup): FormGroup {
    return form.get('searchConfiguration') as FormGroup;
  };

  getDataFilterOptionsGroup(form: FormGroup): FormGroup {
    return form.get('dataFilterOptions') as FormGroup;
  };

}
