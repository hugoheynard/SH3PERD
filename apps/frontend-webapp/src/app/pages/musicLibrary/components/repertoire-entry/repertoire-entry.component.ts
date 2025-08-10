import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';
import { ButtonSecondaryComponent, TagComponent } from '@sh3pherd/ui-angular';



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
  @Input() data: TMusicRepertoireEntryDomainModel | undefined = {} as TMusicRepertoireEntryDomainModel;

  /**
   * Checks if the entry has valid data. All fields must be defined and not empty.
   */
  isComplete(d: TMusicRepertoireEntryDomainModel): boolean {
    const required: (keyof TMusicRepertoireEntryDomainModel)[] =
      ['energy', 'effort', 'affinity', 'mastery'];
    return required.every((k) => {
      const v = d[k] as unknown;
      return v !== undefined && v !== null && String(v).trim() !== '';
    });
  }

  addEntry() {

  };

  protected readonly String = String;
}
