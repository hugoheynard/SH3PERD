import {Component, Input, OnInit} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  provideNativeDateAdapter
} from '@angular/material/core';
import {SelectParticipantsComponent} from '../specificSubForms/select-participants/select-participants.component';

@Component({
  selector: 'app-event-reactform',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatHint, MatInputModule, MatSelect, MatOption,
    MatDatepicker, MatDatepickerToggle, MatDatepickerInput, MatNativeDateModule, SelectParticipantsComponent
  ],
  providers: [
    // Fournir l'adaptateur natif de la date
    provideNativeDateAdapter(),
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'}, // Localisation (français dans cet exemple)
    {provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS} // Formats de date par défaut
  ],
  templateUrl: './event-reactform.component.html',
  standalone: true,
  styleUrl: './event-reactform.component.scss'
})
export class EventReactformComponent{
  @Input() formGroup: any;

  duration: any= new FormControl('', [
    Validators.min(5),
  Validators.pattern('^[0-9]+$')
])

  date: any= new FormControl('')

  type: any= new FormControl('')
}
