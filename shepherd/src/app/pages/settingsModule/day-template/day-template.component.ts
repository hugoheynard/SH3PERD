import {Component, Input} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatTab} from "@angular/material/tabs";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {EditSaveIconComponent} from '../edit-save-icon/edit-save-icon.component';
import {ClubbingHoursFormComponent} from '../clubbing-hours-form/clubbing-hours-form.component';
import {DaySettingsCabaretFormComponent} from '../day-settings-cabaret-form/day-settings-cabaret-form.component';
import {ToggleButtonComponent} from '../toggle-button/toggle-button.component';
import {WeeklyEventAssignFormComponent} from '../weekly-event-assign-form/weekly-event-assign-form.component';

@Component({
    selector: 'app-day-template',
    imports: [
        MatFormField,
        MatInput,
        MatLabel,
        MatSelect,
        MatSlideToggle,
        MatTab,
        ReactiveFormsModule,
        NgForOf,
        MatIcon,
        EditSaveIconComponent,
        ClubbingHoursFormComponent,
        DaySettingsCabaretFormComponent,
        ToggleButtonComponent,
        WeeklyEventAssignFormComponent
    ],
    templateUrl: './day-template.component.html',
    styleUrl: './day-template.component.scss'
})
export class DayTemplateComponent {
  @Input() dayName: string = '';
  @Input() dayForm: FormGroup = new FormGroup<any>({});

  get clubbingHoursForm(): FormGroup {
    return this.dayForm.get('clubbingHours') as FormGroup;
  }

  get weeklyEventForm(): FormGroup {
    return this.dayForm.get('weeklyEvent') as FormGroup;
  }

  get cabaretSettingsForm(): FormGroup {
    return this.dayForm.get('cabaretSettings') as FormGroup;
  }

}
