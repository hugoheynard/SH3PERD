import { Component, inject, OnInit } from '@angular/core';
import { FormBlockComponent } from '../../../musicTabConfigurator/components/form-block/form-block.component';
import {
  ButtonPrimaryComponent,
  CheckboxComponent,
  FileUploaderComponent,
  InputComponent,
  SelectComponent,
} from '@sh3pherd/ui-angular';
import { MusicLibraryTextContentService } from '../../../../services/music-library-text-content.service';
import { MusicVersionFormService } from '../../services/music-version-form.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectListComponent } from '../../../../../../components/select-list/select-list.component';

@Component({
  selector: 'app-music-version-configurator',
  imports: [
    FormBlockComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ButtonPrimaryComponent,
    ReactiveFormsModule,
    FileUploaderComponent,
    SelectListComponent,
  ],
  templateUrl: './music-version-configurator.component.html',
  standalone: true,
  styleUrl: './music-version-configurator.component.scss',
})
export class MusicVersionConfiguratorComponent implements OnInit{
  public textServ = inject(MusicLibraryTextContentService);
  private formServ = inject(MusicVersionFormService);
  public form: any = this.formServ.buildForm();

  /** MUSIC REF SELECTOR LIST
   *
   */
  public musicRefs: any = [
    { musicReference_id: 'testMR1', title: 'Hello', artist: 'Adele' },
    { musicReference_id: 'testMR2', title: 'Hallo', artist: 'Adolph' },
    { musicReference_id: 'testMR3', title: 'Hallu', artist: 'Ftiven' },
    { musicReference_id: 'testMR4', title: 'elHlo', artist: 'Dyslexia' },
    { musicReference_id: 'testMR5', title: 'World', artist: 'Idole' },
  ]
  trackByMusicRef = (ref: any) => ref.musicReference_id;
  labelForMusicRef = (ref: any): string => `${ref.title} - ${ref.artist}`;

  /** LIFECYCLE
   *
   */
  ngOnInit(): void {

  }

  /** DISABLE BLOCKS METHODS
   *
   */
  trackMapDisabled(): boolean {
    return !this.form.get('options.trackMapEnabled')?.value;
  };

  repertoireEntryDisabled(): boolean {
    return !this.form.get('options.addToUserRepertoire_me')?.value;
  };

  fileListDisabled(): boolean {
    //TODO: if file uploaded, creates an entry on the table, if list > 0 false
    return false;
  };
}
