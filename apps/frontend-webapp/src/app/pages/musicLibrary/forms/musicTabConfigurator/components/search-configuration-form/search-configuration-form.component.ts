import {Component, Input} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabelWrapperDirective} from '../../../../../../../Directives/forms/label.directive';

import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import { InputComponent, MultiSelectDropdownComponent, SelectComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'search-configuration-form',
  imports: [
    FormsModule,
    LabelWrapperDirective,
    MultiSelectDropdownComponent,
    NgForOf,
    NgSwitchCase,
    ReactiveFormsModule,
    NgSwitch,
    NgIf,
    InputComponent,
    SelectComponent,
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

  tabTypes = [
    { value: 'repertoire', label: 'Repertoire' },
    { value: 'crossRepertoire', label: 'Cross Repertoire' },
  ];

  targetModes: any[] = [{ label: 'me', value: 'me' }, { label: 'single user', value: 'single-user' }, { label: 'multiple users', value: 'multiple-users' }];


  public userList: any = [
    { id: 'user_Paul', name: 'Paul' },
    { id: 'user_Martin', name: 'Martin' },
    { id: 'user_Sophie', name: 'Sophie' },
  ]
}
