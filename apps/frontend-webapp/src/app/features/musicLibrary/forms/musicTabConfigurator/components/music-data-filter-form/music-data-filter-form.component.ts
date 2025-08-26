import {Component, Input} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MultiSelectDropdownComponent } from '@sh3pherd/ui-angular';


@Component({
  selector: 'music-data-filter-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MultiSelectDropdownComponent,
  ],
  templateUrl: './music-data-filter-form.component.html',
  standalone: true,
  styleUrl: './music-data-filter-form.component.scss'
})
export class MusicDataFilterFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;

}
