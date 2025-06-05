import {Component, Input} from '@angular/core';
import {MatDatepicker, MatDatepickerModule, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInput} from '@angular/material/input';

@Component({
    selector: 'app-datepicker',
    imports: [
        MatDatepicker,
        MatDatepickerToggle,
        MatDatepickerModule,
        MatNativeDateModule,
        MatHint,
        MatSuffix,
        MatLabel,
        MatInput,
        MatFormField
    ],
    templateUrl: './datepicker.component.html',
    styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent {
  @Input() label: string = '';
}
