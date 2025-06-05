import {Component, Input} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabelWrapperDirective} from '../../../../../../../Directives/forms/label.directive';
import {
  MultiSelectDropdownComponent
} from '../../../../components/utils/multi-select-dropdown/multi-select-dropdown.component';
import {NgForOf, NgSwitch, NgSwitchCase} from '@angular/common';

@Component({
  selector: 'search-configuration-form',
  imports: [
    FormsModule,
    LabelWrapperDirective,
    MultiSelectDropdownComponent,
    NgForOf,
    NgSwitchCase,
    ReactiveFormsModule,
    NgSwitch
  ],
  templateUrl: './search-configuration-form.component.html',
  standalone: true,
  styleUrl: './search-configuration-form.component.scss',
  host: {

  }
})
export class SearchConfigurationFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() disabled: boolean = false;
  @Input() title: string = 'Search Configuration';

  tabTypes = [
    { value: 'repertoire', label: 'Repertoire' },
    { value: 'crossRepertoire', label: 'Cross Repertoire' },
  ];

  targetModes: any[] = [{ label: 'me', value: 'me' }, { label: 'single user', value: 'single-user' }, { label: 'multiple users', value: 'multiple-users' }];


  get targetMode(): string {
    return this.formGroup.get('target.mode')?.value;
  };

  public userList: any = [
    { id: 'user_1', name: 'Paul' },
    { id: 'user_2', name: 'Martin' },
    { id: 'user_3', name: 'Sophie' },
  ]
}
