import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MusicTabConfiguratorFormService} from '../../services/music-tab-configurator-form.service';
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
export class MusicTabConfiguratorComponent implements OnInit, OnChanges{
  @Output() tabReady = new EventEmitter<any>();
  @Input() configData: any = {};
  public userList: any = [
    { id: 'user_1', name: 'Paul' },
    { id: 'user_2', name: 'Martin' },
    { id: 'user_3', name: 'Sophie' },
  ]

  private autoTitle: boolean = true;
  public targetModes: any[] = [{ label: 'me', value: 'me' }, { label: 'single user', value: 'single-user' }, { label: 'multiple users', value: 'multiple-users' }];

  tabTypes = [
    { value: 'repertoire', label: 'Repertoire' },
    { value: 'crossRepertoire', label: 'Cross Repertoire' },
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
    console.log('does the input go through?', this.configData)

    //if dataConfig is provided, patch the form with it
    if (this.configData) {
      this.formService.patchForm(this.form, this.configData);
    }

    this.form.valueChanges.subscribe((values: any) => {
      //manage auto title
      if (this.autoTitle && values.searchMode) {
        this.setAutoTitle(values.searchMode);
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['configData']) {
      console.log('Music Tab Config:  Received configData:', changes['configData'].currentValue);
    }
  }

  // ──────────── UI ────────────
  shouldShowDataFilterOverlay(): boolean {
    const isComponentTouched = this.form.get('searchMode')?.value ?? false;
    const isDataFilterEnabled = this.form.get('dataFilterActive')?.value === true;
    return isComponentTouched && isDataFilterEnabled;
  };

  get targetMode(): string {
    return this.form.get('target.mode')?.value;
  };





  // ──────────── AUTO TITLE ────────────
  setAutoTitle(type: string): void {
    const targetMode = this.form.get('targetMode')?.value;
    const title = this.generateAutoTitle(type, targetMode);
    this.form.get('title')?.setValue(title, { emitEvent: false });
  }

  private generateAutoTitle(type: string, mode: string): string {
    const title = {
      target: '',
      searchType: '',
      energy: '',
      genre: '',
    };

    switch (type) {
      case 'repertoire':
        title.searchType = 'rep';

        if (mode === 'me') {
          title.target = 'my';
        }

        if (mode === 'single-user') {
          title.target = 'user’s';
        }

        if (mode === 'multiple-users') return 'Shared Repertoire';
        return 'Repertoire';

      case 'crossSearch':
        title.searchType = 'rep';


    }

    return `${title.target} ${title.energy} ${title.genre} ${title.searchType} `.trim();
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
