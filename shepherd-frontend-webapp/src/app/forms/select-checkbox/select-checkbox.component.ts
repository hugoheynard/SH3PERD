import {Component, Input} from '@angular/core';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {NgForOf} from '@angular/common';

@Component({
    selector: 'app-select-checkbox',
    imports: [
        MatFormField,
        MatLabel,
        MatOption,
        MatSelect,
        NgForOf
    ],
    templateUrl: './select-checkbox.component.html',
    standalone: true,
    styleUrl: './select-checkbox.component.scss'
})
export class SelectCheckboxComponent {
  public selectedValues: string[] = [];

  @Input() formControl: any;
  @Input() label: string = '';
  @Input() options: any;

  toggleSelection(value: string, event: any) {
    if (event.checked) {
      this.selectedValues.push(value);
    } else {
      const index = this.selectedValues.indexOf(value);
      if (index >= 0) {
        this.selectedValues.splice(index, 1);
      }
    }
  }
}
