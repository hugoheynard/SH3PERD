import {AfterViewInit, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DayTemplateComponent} from '../day-template/day-template.component';
import {NgForOf} from '@angular/common';
import {EditSaveIconComponent} from '../edit-save-icon/edit-save-icon.component';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {SettingsService} from '../../../services/settings.service';

@Component({
  selector: 'app-week-template',
  standalone: true,
  imports: [
    MatTabGroup, MatTab, MatButton,
    DayTemplateComponent,
    NgForOf,
    EditSaveIconComponent,
    ReactiveFormsModule, MatIconButton,
  ],
  templateUrl: './week-template.component.html',
  styleUrl: './week-template.component.scss'
})
export class WeekTemplateComponent implements OnInit, AfterViewInit{
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private settingsService = inject(SettingsService);

  weekSettingsForm: FormGroup = new FormGroup<any>({});
  isModified: boolean = false;
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnInit(): void {
    this.weekSettingsForm = this.fb.group({
      days: this.fb.array(this.weekDays.map(day => this.createDayFormGroup(day)))
    });
  };

  ngAfterViewInit() {
    const weekSettingsData = {
      days: [
        {
          clubbingHours: { start: '18:00', end: '02:00' },
          weeklyEvent: {
            hasWeeklyEvent: true,
            selectedWeeklyEvent: 'Salsa Night'
          },
          cabaretSettings: {
            hasCabaret: true,
            numberOfShows: 2,
            showsDetails: [
              { playlist: '', startTime: '12:00'},
              { playlist: '', startTime: '12:00'}
            ]
          }
        },
        {
          clubbingHours: { start: '17:00', end: '01:00' },
          weeklyEvent: { hasWeeklyEvent: false, selectedWeeklyEvent: '' },
          cabaretSettings: { hasCabaret: true,
            numberOfShows: 1,
            showsDetails: [
              { playlist: '', startTime: '12:00'},
              { playlist: '', startTime: '12:00'}
            ] }
        },
        // Ajoutez des données pour chaque jour de la semaine...
      ]
    };

    this.weekSettingsForm.patchValue(weekSettingsData);
    this.cdr.detectChanges()

    this.weekSettingsForm.valueChanges.subscribe(() => {
      this.isModified = this.weekSettingsForm.dirty;
    });
  };

  createDayFormGroup(day: string): FormGroup {
    return this.fb.group({
      day: new FormControl(this.weekDays.indexOf(day)),
      clubbingHours: this.fb.group({
        start: [''],
        end: ['']
      }),
      weeklyEvent: this.fb.group({
        hasWeeklyEvent: [false],
        selectedWeeklyEvent: ['']
      }),
      cabaretSettings: this.fb.group({
        hasCabaret: [false],
        numberOfShows: [0],
        showsDetails: this.fb.array([])
      })
    });
  };

  get daysFormArray(): FormArray {
    return this.weekSettingsForm.get('days') as FormArray<FormGroup>;
  };

  getDayFormGroup(index: number): FormGroup {
    return this.daysFormArray.at(index) as FormGroup;
  };

  onSubmit(): void {
    if (this.weekSettingsForm.valid) {
      this.settingsService.updateWeekTemplate(this.weekSettingsForm.value);
      this.weekSettingsForm.markAsPristine();
      this.isModified = false;
    } else {
      console.log('invalid form');
    }
  }

  protected readonly FormGroup = FormGroup;
}
