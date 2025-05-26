import {AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DayTemplateComponent} from '../day-template/day-template.component';
import {NgForOf} from '@angular/common';
import {EditSaveIconComponent} from '../edit-save-icon/edit-save-icon.component';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {SettingsService} from '../../../services/settings.service';
import {WeekTemplate} from '../../../interfaces/week-template-interface';

@Component({
  selector: 'app-week-template',
  imports: [
    MatTabGroup, MatTab,
    DayTemplateComponent,
    NgForOf,
    EditSaveIconComponent,
    ReactiveFormsModule, MatIconButton,
  ],
  templateUrl: './week-template.component.html',
  standalone: true,
  styleUrl: './week-template.component.scss'
})
export class WeekTemplateComponent implements OnInit, AfterViewInit{
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private settingsService = inject(SettingsService);

  weekSettingsForm: FormGroup = new FormGroup<any>({});
  isModified: boolean = false;
  weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  weekTemplateSignal = signal<any>(null);

  ngOnInit(): void {
    this.weekSettingsForm = this.fb.group({
      days: this.fb.array(this.weekDays.map(day => this.createDayFormGroup(day)))
    });
  };

  async ngAfterViewInit() {
    const data: any = await this.settingsService.getWeekTemplate(); //TODO: pourquoi mon week template interface marche pas

    this.weekSettingsForm.patchValue(data);
    this.cdr.detectChanges()

    this.weekSettingsForm.valueChanges.subscribe(() => {
      this.isModified = this.weekSettingsForm.dirty;
    });
  };

  createDayFormGroup(day: string): FormGroup {
    return this.fb.group({
      dayIndex: new FormControl(this.weekDays.indexOf(day)),
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
