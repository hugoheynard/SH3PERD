import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MusicTabConfiguratorFormService, TabConfigForm} from '../../services/music-tab-configurator-form.service';
import {MatIcon} from '@angular/material/icon';
import {MultiSelectDropdownComponent} from '../utils/multi-select-dropdown/multi-select-dropdown.component';
import {LabelWrapperDirective} from '../../../../../Directives/forms/label.directive';

@Component({
  selector: 'app-music-tab-configurator',
  imports: [
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatIcon,
    NgSwitch,
    NgSwitchCase,
    MultiSelectDropdownComponent,
    LabelWrapperDirective,
  ],
  templateUrl: './music-tab-configurator.component.html',
  standalone: true,
  styleUrl: './music-tab-configurator.component.scss'
})
export class MusicTabConfiguratorComponent implements OnInit{
  @Output() tabReady = new EventEmitter<any>();
  public userList: any = [
    { id: 'user_1', name: 'Paul' },
    { id: 'user_2', name: 'Martin' },
    { id: 'user_3', name: 'Sophie' },
  ]

  private autoTitle: boolean = true;
  public targetModes: any[] = [{ label: 'me', value: 'me' }, { label: 'single user', value: 'single-user' }, { label: 'multiple users', value: 'multiple-users' }];

  tabTypes = [
    { value: 'repertoire', label: 'Repertoire' },
    { value: 'crossSearch', label: 'Cross Search' },
  ];

  public formService = inject(MusicTabConfiguratorFormService)
  public form: any = this.formService.createForm();

  // ──────────── FORM LOGIC ────────────
  repertoireHasFilter(): boolean {
    return this.form.get('repertoireOptions.filter')?.value ?? false;
  };


  submit(): void {
    if (this.form.invalid) return;

    const { componentType, title } = this.form.value;
    this.tabReady.emit({
      id: `tab-${Date.now()}`,
      title,
      component: componentType,
      isEditable: true,
      isDeletable: true,
      search: ''
    });
  };



  // ──────────── LIFECYCLE ────────────
  ngOnInit(): void {
    this.form.valueChanges.subscribe((values: any) => {
      if (this.autoTitle && values.componentType) {
        this.setAutoTitle(values.componentType);
      }
      const repertoireOptionsGroup = this.form.get('repertoireOptions');

      if (values.componentType === 'repertoire') {
        repertoireOptionsGroup?.enable({ emitEvent: false });
      } else {
        repertoireOptionsGroup?.disable({ emitEvent: false });
      }
    });

// Initialise le comportement au chargement
    this.updateRepertoireBlockState(this.form.get('componentType')?.value);
  };

  private updateRepertoireBlockState(type: string | null): void {
    const group = this.form.get('repertoireOptions');
    if (type === 'repertoire') {
      group?.enable({ emitEvent: false });
    } else {
      group?.disable({ emitEvent: false });
    }
  };

  // ──────────── UI ────────────
  shouldShowDataFilterOverlay(): boolean {
    const isComponentTouched = this.form.get('componentType')?.value ?? false;
    const isDataFilterEnabled = this.form.get('dataFilter')?.value === true;
    return isComponentTouched && isDataFilterEnabled;
  };

  get targetMode(): string {
    return this.form.get('targetMode')?.value;
  };





  // ──────────── AUTO TITLE ────────────
  setAutoTitle(type: string): void {
    const label = this.tabTypes.find(t => t.value === type)?.label ?? type;

    this.form.get('title')?.setValue(`${label}`);
  }

  onToggleAutoTitle(): void {
    this.autoTitle = !this.autoTitle;

    const titleCtrl = this.form.get('title');

    if (this.autoTitle) {
      const type = this.form.get('componentType')?.value;

      if (type) {
        this.setAutoTitle(type)
      }

      titleCtrl?.disable();
    } else {
      titleCtrl?.enable();
    }
  }
}
