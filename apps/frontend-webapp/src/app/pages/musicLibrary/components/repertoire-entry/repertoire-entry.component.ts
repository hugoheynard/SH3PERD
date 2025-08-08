import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TagComponent } from '@sh3pherd/ui-angular';
import { TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';

@Component({
  selector: 'repertoire-entry',
  imports: [
    NgIf,
    TagComponent,
  ],
  templateUrl: './repertoire-entry.component.html',
  standalone: true,
  styleUrl: './repertoire-entry.component.scss',
})
export class RepertoireEntryComponent {
  @Input() data: a = {} as TMusicRepertoireEntryDomainModel;

  hasValidData(): boolean {
    return true;
  };

  addEntry() {

  };
}
