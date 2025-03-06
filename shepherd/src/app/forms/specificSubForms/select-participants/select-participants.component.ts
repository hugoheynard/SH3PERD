import {Component, Input} from '@angular/core';
import {MatChip, MatChipGrid, MatChipListbox, MatChipOption, MatChipRow, MatChipSet} from '@angular/material/chips';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {NgForOf} from '@angular/common';

@Component({
    selector: 'app-select-participants',
    imports: [
        MatChip,
        MatChipListbox,
        MatChipOption,
        MatFormField,
        MatChipGrid,
        MatLabel,
        ReactiveFormsModule,
        MatInput,
        NgForOf
    ],
    templateUrl: './select-participants.component.html',
    styleUrl: './select-participants.component.scss'
})
export class SelectParticipantsComponent {
  @Input() organisationSchema: any;

  services = new FormControl<string[]>([]);
  categories = new FormControl<string[]>([]);
  subCategories = new FormControl<string[]>([]);

  subCategoryOptions = ['allsubCategories', 'artistic', 'cabaret'];

  toggleAll() {
  }

  isSelected() {
    console.log(this.services.value)
  }

  onChipSelectionChange(option: string, isSelected: boolean) {
    const currentSelection = this.subCategories.value || [];

    if (isSelected) {
      this.subCategories.setValue([...currentSelection, option]);
    } else {
      this.subCategories.setValue(currentSelection.filter(item => item !== option));
    }

    console.log(this.subCategories)
    this.subCategories.markAsTouched();
    this.subCategories.markAsDirty();
  }

  get serviceKeys() {
    return Object.keys(this.organisationSchema.services);
  };
}
