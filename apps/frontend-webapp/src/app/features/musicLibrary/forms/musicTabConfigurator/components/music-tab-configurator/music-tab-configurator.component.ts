import {Component, EventEmitter, inject, Input, type OnInit, Output} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MusicTabConfiguratorFormService} from '../../services/music-tab-configurator-form.service';
import {ExploitationFilterFormComponent} from '../exploitation-filter-form/exploitation-filter-form.component';
import {MusicDataFilterFormComponent} from '../music-data-filter-form/music-data-filter-form.component';
import {FormBlockComponent} from '../form-block/form-block.component';
import {SearchConfigurationFormComponent} from '../search-configuration-form/search-configuration-form.component';
import type { ITabDefinition } from '../../../../../../shared/tabSystem/tab-system/ITabDefinition';
import type { TMusicTabConfiguration } from '../../../../types/TMusicTabConfiguration';
import { ButtonPrimaryComponent, CheckboxComponent, InputComponent } from '@sh3pherd/ui-angular';
import { LabelWrapperDirective } from '../../../../../../../Directives/forms/label.directive';

@Component({
  selector: 'app-music-tab-configurator',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ExploitationFilterFormComponent,
    MusicDataFilterFormComponent,
    FormBlockComponent,
    SearchConfigurationFormComponent,
    ButtonPrimaryComponent,
    CheckboxComponent,
    InputComponent,
    LabelWrapperDirective,
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
  @Input() configData: TMusicTabConfiguration | null = null;


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
    })
  };

  // ──────────── FORM LOGIC ────────────
  /**
   * this will trigger the replacement by the display component
   */
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
      configuratorData: this.form.value,
    });

    console.log(this.form.value)
  };


  // ──────────── UI ────────────
  shouldShowDataFilterOverlay(): boolean {
    const isComponentTouched = this.form.get('searchConfiguration.searchMode')?.value ?? false;
    const isDataFilterEnabled = this.form.get('dataFilterActive')?.value === true;
    return isComponentTouched && isDataFilterEnabled;
  };

  protected readonly FormGroup = FormGroup;
}
