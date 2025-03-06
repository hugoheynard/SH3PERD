import {Component, Input} from '@angular/core';
import {EditSaveIconComponent} from "../edit-save-icon/edit-save-icon.component";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-clubbing-hours-form',
    imports: [
        EditSaveIconComponent,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule
    ],
    templateUrl: './clubbing-hours-form.component.html',
    styleUrl: './clubbing-hours-form.component.scss'
})
export class ClubbingHoursFormComponent {
  @Input() clubbingHoursForm: FormGroup = new FormGroup<any>({});
}
