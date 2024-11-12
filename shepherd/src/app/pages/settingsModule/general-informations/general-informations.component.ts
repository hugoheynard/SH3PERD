import { Component } from '@angular/core';
import {DatepickerComponent} from '../datepicker/datepicker.component';

@Component({
  selector: 'app-general-informations',
  standalone: true,
  imports: [
    DatepickerComponent
  ],
  templateUrl: './general-informations.component.html',
  styleUrl: './general-informations.component.scss'
})
export class GeneralInformationsComponent {

}
