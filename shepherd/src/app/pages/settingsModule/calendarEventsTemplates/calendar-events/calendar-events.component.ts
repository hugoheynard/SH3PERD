import {Component} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-calendar-events',
  standalone: true,
  imports: [
    MatFormField,
    ReactiveFormsModule,
    MatSelect,
    MatLabel,
    MatOption,
    MatInput
  ],
  templateUrl: './calendar-events.component.html',
  styleUrl: './calendar-events.component.scss'
})
export class CalendarEventsComponent {
  calendarEventCreatorForm: FormGroup = new FormGroup({
    type: new FormControl(''),
    duration: new FormControl(5),
    color: new FormControl('')
  });
}
