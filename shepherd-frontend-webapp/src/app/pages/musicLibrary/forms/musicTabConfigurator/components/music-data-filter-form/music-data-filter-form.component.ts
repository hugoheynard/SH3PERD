import {Component, Input} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabelWrapperDirective} from '../../../../../../../Directives/forms/label.directive';
import {
  MultiSelectDropdownComponent
} from '../../../../components/utils/multi-select-dropdown/multi-select-dropdown.component';


@Component({
  selector: 'music-data-filter-form',
  imports: [
    FormsModule,
    LabelWrapperDirective,
    MultiSelectDropdownComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './music-data-filter-form.component.html',
  standalone: true,
  styleUrl: './music-data-filter-form.component.scss'
})
export class MusicDataFilterFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;

}
