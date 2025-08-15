import {Component, Input} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabelWrapperDirective} from '../../../../../../../Directives/forms/label.directive';

import {NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import { CheckboxComponent, MultiSelectDropdownComponent, SelectComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'search-configuration-form',
  imports: [
    FormsModule,
    LabelWrapperDirective,
    MultiSelectDropdownComponent,

    NgSwitchCase,
    ReactiveFormsModule,
    NgSwitch,
    NgIf,

    SelectComponent,
    CheckboxComponent,
  ],
  templateUrl: './search-configuration-form.component.html',
  standalone: true,
  styleUrl: './search-configuration-form.component.scss',
  host: {

  }
})
export class SearchConfigurationFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() disabled: boolean = false;
  @Input() title: string = 'Search Configuration';

  public tabTypes: any[] = [
    { value: 'repertoire', label: 'Repertoire' },
    { value: 'crossRepertoire', label: 'Cross Repertoire' },
  ];

  public targetModes: any[] = [{ label: 'me', value: 'me' }, { label: 'single user', value: 'single-user' }, { label: 'multiple users', value: 'multiple-users' }];


  public userList: any[] = [
    { value: 'user_Paul', label: 'Paul' },
    { value: 'user_Martin', label: 'Martin' },
    { value: 'user_Sophie', label: 'Sophie' },
  ]
}
