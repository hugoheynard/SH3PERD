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
import {ITabDefinition} from '../../../../../../components/tab-system/ITabDefinition';
import {IMusicTabConfig} from '../../../../types/IMusicTabConfig';

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
export class MusicTabConfiguratorComponent implements OnInit{
  private configuratorName: string = 'music-tab-configurator';
  public formService: MusicTabConfiguratorFormService = inject(MusicTabConfiguratorFormService);
  public form: any = this.formService.createForm();
  // ──────────── I/O ────────────
  @Output() tabReady: EventEmitter<ITabDefinition> = new EventEmitter<ITabDefinition>();
  @Input() configData: IMusicTabConfig | null = null;


  // ──────────── LIFECYCLE ────────────
  ngOnInit(): void {
    //if dataConfig is provided, patch the form with it
    if (this.configData) {
      this.formService.patchForm(this.form, this.configData);
    }

    // Initialise le comportement au chargement

    this.form.valueChanges.subscribe((formValue: any) => {
      const autoTitle = formValue.searchConfiguration?.autoTitle;
      if (autoTitle) {
        const title = this.formService.generateAutoTitleFromForm(formValue);
        this.form.get('title')?.setValue(title, { emitEvent: false });
      }
    });
  };

  // ──────────── FORM LOGIC ────────────
  submit(): void {
    if (this.form.invalid) {
      return
    }

    const { searchMode, title } = this.form.value.searchConfiguration;

    this.tabReady.emit({
      id: `tab-${Date.now()}`,
      title,
      hasConfigurator: true,
      configComponentKey: this.configuratorName,
      displayComponentKey: searchMode,
      configMode: false,
      isActive: false,
      isTitleEditable: true,
      isDeletable: true,
      isSearchable: true,
      searchValue: '',
      default: false,
      configData: this.form.value,
    });
  };


  // ──────────── UI ────────────
  shouldShowDataFilterOverlay(): boolean {
    const isComponentTouched = this.form.get('searchConfiguration.searchMode')?.value ?? false;
    const isDataFilterEnabled = this.form.get('dataFilterActive')?.value === true;
    return isComponentTouched && isDataFilterEnabled;
  };
}
