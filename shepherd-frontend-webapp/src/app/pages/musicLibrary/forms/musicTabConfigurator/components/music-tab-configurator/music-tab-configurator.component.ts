import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MusicTabConfiguratorFormService} from '../../services/music-tab-configurator-form.service';
import {MatIcon} from '@angular/material/icon';
import {MultiSelectDropdownComponent} from '../../../../components/utils/multi-select-dropdown/multi-select-dropdown.component';
import {LabelWrapperDirective} from '../../../../../../../Directives/forms/label.directive';
import {ExploitationFilterFormComponent} from '../exploitation-filter-form/exploitation-filter-form.component';
import {MusicDataFilterFormComponent} from '../music-data-filter-form/music-data-filter-form.component';
import {FormBlockComponent} from '../form-block/form-block.component';
import {SearchConfigurationFormComponent} from '../search-configuration-form/search-configuration-form.component';

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
    ExploitationFilterFormComponent,
    MusicDataFilterFormComponent,
    FormBlockComponent,
    SearchConfigurationFormComponent,
  ],
  templateUrl: './music-tab-configurator.component.html',
  standalone: true,
  styleUrl: './music-tab-configurator.component.scss'
})
export class MusicTabConfiguratorComponent implements OnInit, OnChanges{
  @Output() tabReady = new EventEmitter<any>();
  @Input() configData: any = {};
  public formService = inject(MusicTabConfiguratorFormService);

  private autoTitle: boolean = true;
  public form: any = this.formService.createForm();

  // ──────────── FORM LOGIC ────────────
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

  //à checker
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
