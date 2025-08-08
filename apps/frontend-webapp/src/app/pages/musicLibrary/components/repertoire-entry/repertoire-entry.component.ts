import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { ButtonSecondaryComponent, TagComponent } from '@sh3pherd/ui-angular';
import { TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';



@Component({
  selector: 'repertoire-entry',
  imports: [
    NgIf,
    TagComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './repertoire-entry.component.html',
  standalone: true,
  styleUrl: './repertoire-entry.component.scss',
})
export class RepertoireEntryComponent {
  @Input({ required: true }) data!: TMusicRepertoireEntryDomainModel;

  /**
   * Checks if the entry has valid data. All fields must be defined and not empty.
   */
  hasValidData(): boolean {
    const requiredFields: (keyof TMusicRepertoireEntryDomainModel)[] = ['energy', 'effort', 'affinity', 'mastery'];
    return requiredFields.every(field => {
      const value = this.data[field];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
  };

  addEntry() {

  };
}
