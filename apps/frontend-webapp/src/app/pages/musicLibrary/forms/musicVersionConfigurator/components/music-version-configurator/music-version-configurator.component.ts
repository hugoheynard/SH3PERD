import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { FormBlockComponent } from '../../../musicTabConfigurator/components/form-block/form-block.component';
import {
  ButtonPrimaryComponent, ButtonSecondaryComponent, ButtonTertiaryComponent,
  CheckboxComponent,
  FileUploaderComponent,
  InputComponent,
  SelectComponent, SelectListComponent,
} from '@sh3pherd/ui-angular';
import { MusicLibraryTextContentService } from '../../../../services/music-library-text-content.service';
import { MusicVersionFormService } from '../../../../formServices/music-version-form.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgStyle } from '@angular/common';
import { TMusicReferenceDomainModel, TMusicVersionCreationFormPayload } from '@sh3pherd/shared-types';
import { MusicReferenceService } from '../../../../services/music-reference.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MusicVersionService } from '../../../../services/music-version.service';
import { startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MusicReferenceFormComponent } from '../../../music-reference-form/music-reference-form.component';
import { DialogService } from '../../../../../../services/dialog.service';

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
    NgStyle,
    NgIf,
    ButtonTertiaryComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './music-version-configurator.component.html',
  standalone: true,
  styleUrl: './music-version-configurator.component.scss',
})
export class MusicVersionConfiguratorComponent{
  public textServ = inject(MusicLibraryTextContentService);
  private musRefServ = inject(MusicReferenceService);
  private musVerServ = inject(MusicVersionService);
  private formServ = inject(MusicVersionFormService);
  public form = this.formServ.buildForm();
  private dialog = inject(DialogService);

  /**
   * SIGNAL FOR TRACK MAP RESEARCH
   */
  public titleSig = toSignal<string>(this.form.get('title')!.valueChanges
    .pipe(startWith(this.form.get('title')!.value)));


  public artistSig = toSignal<string>(this.form.get('artist')!.valueChanges
    .pipe(startWith(this.form.get('artist')!.value)));

  public searchTrigger = computed<{ title: string; artist: string }>(() => ({
    title: this.titleSig() ?? '',
    artist: this.artistSig() ?? ''
  }));


  constructor() {
    effect(() => {
      //triggers the search when title or artist changes
      const { title, artist } = this.searchTrigger();

      this.musRefServ.searchByTitleAndArtist(title, artist)
        .subscribe(results => {
          this.musicRefsSuggestions.set(results);
        });

    });
  };

  /** MUSIC REF SELECTOR LIST
   *
   */
  public musicRefsSuggestions = signal<TMusicReferenceDomainModel[]>([]);

  trackByMusicRef = (ref: TMusicReferenceDomainModel) => ref.musicReference_id;
  labelForMusicRef = (ref: TMusicReferenceDomainModel): string => `${ref.title} - ${ref.artist}`;

  /**
   * creates a new music reference to match the music version, available globally
   */
  public musicRefFormOpen: WritableSignal<boolean>  = signal(false);
  openMusicRefForm = () => {
    const dialogRef = this.dialog.open(MusicReferenceFormComponent, undefined, 'addRefDialog')

    this.dialog.outputToObserver(dialogRef, 'created', (musicRef) => {
      this.form.patchValue({ musicReference_id: musicRef.musicReference_id });

        //this.titleSig().set(musicRef.title);
        //this.artistSig().set(musicRef.artist);

      this.dialog.close(dialogRef);
    });

  };



  /**
   * saves the music reference to the database
   */
  async onSubmit(): Promise<any> {
    const raw = this.form.getRawValue();

    console.log('raw', raw);
    await this.musVerServ.createOneMusicVersion(raw);
  };
}
