import {Component, Input} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatSelect} from "@angular/material/select";
import {ToggleButtonComponent} from "../toggle-button/toggle-button.component";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-weekly-event-assign-form',
    imports: [
        MatFormField,
        MatLabel,
        MatSelect,
        ToggleButtonComponent,
        ReactiveFormsModule
    ],
    templateUrl: './weekly-event-assign-form.component.html',
    styleUrl: './weekly-event-assign-form.component.scss'
})
export class WeeklyEventAssignFormComponent {
  @Input() weeklyEventAssignForm: FormGroup = new FormGroup<any>({});

}
