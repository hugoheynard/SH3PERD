import {Component, Input, OnInit} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {NgForOf, NgIf} from "@angular/common";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatOption, MatSelect} from '@angular/material/select';
import {ToggleButtonComponent} from '../toggle-button/toggle-button.component';

@Component({
    selector: 'app-day-settings-cabaret-form',
    imports: [
        MatFormField, MatInput, MatLabel, MatSelect, MatOption,
        MatSlideToggle,
        NgForOf,
        ReactiveFormsModule, NgIf, ToggleButtonComponent,
    ],
    templateUrl: './day-settings-cabaret-form.component.html',
    styleUrl: './day-settings-cabaret-form.component.scss'
})
export class DaySettingsCabaretFormComponent implements OnInit{
  @Input() cabaretSettingsForm: FormGroup = new FormGroup<any>({});


  constructor(private fb: FormBuilder) {}


  //todo bon bah c'est dans la creation des shows qu'il faut réfléchir
  ngOnInit(): void {
    if (!this.cabaretSettingsForm.get('showsDetails')) {
      this.cabaretSettingsForm.addControl('showsDetails', this.fb.array([]));
    }

    const numberOfShowsControl = this.cabaretSettingsForm.get('numberOfShows');

    if (numberOfShowsControl) {
      numberOfShowsControl.valueChanges.subscribe(value => {
        this.updateShows(value);
      });
    }
  }

  get shows(): FormArray {
    return this.cabaretSettingsForm.get('showsDetails') as FormArray;
  }

  updateShows(numberOfShows: number = 0): void {
    const showsArray = this.shows;

    while (showsArray.length < numberOfShows) {
      showsArray.push(this.createShow());
    }
    while (showsArray.length > numberOfShows) {
      showsArray.removeAt(showsArray.length - 1);
    }
  }

  // Fonction pour créer un groupe de formulaire pour un spectacle
  createShow(): FormGroup {
    return this.fb.group({
      playlist: '',
      startTime: ''
    });
  }
}
