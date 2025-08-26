import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBlockComponent } from '../../../musicTabConfigurator/components/form-block/form-block.component';
import {
  ButtonPrimaryComponent, ButtonSecondaryComponent,
  InputComponent,
  SelectComponent, SelectListComponent,
} from '@sh3pherd/ui-angular';
import { MusicLibraryTextContentService } from '../../../../services/music-library-text-content.service';
import { type IMusicVersionForm, MusicVersionFormService } from '../../../../formServices/music-version-form.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgStyle } from '@angular/common';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { MusicReferenceService } from '../../../../services/music-reference.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { MusicReferenceFormComponent } from '../../../music-reference-form/music-reference-form.component';
import { DialogService } from '../../../../../../core/services/dialog.service';

@Component({
  selector: 'app-music-version-configurator',
  imports: [
    FormBlockComponent,
    InputComponent,
    SelectComponent,
    ButtonPrimaryComponent,
    ReactiveFormsModule,
    SelectListComponent,
    NgStyle,
    NgIf,
    ButtonSecondaryComponent,
  ],
  templateUrl: './music-version-configurator.component.html',
  standalone: true,
  styleUrl: './music-version-configurator.component.scss',
})
export class MusicVersionConfiguratorComponent {
  public textServ = inject(MusicLibraryTextContentService);
  private musRefServ = inject(MusicReferenceService);
  private formServ = inject(MusicVersionFormService);
  public form: FormGroup<IMusicVersionForm> = this.formServ.form;
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

  openMusicRefForm = () => {
    const dialogRef = this.dialog.open(MusicReferenceFormComponent, undefined, 'addRefDialog')

    this.dialog.outputToObserver(dialogRef, 'created', (musicRef) => {
      this.form.patchValue({ musicReference_id: musicRef.musicReference_id });

      this.dialog.close(dialogRef);
    });

  };



  /**
   * saves the music reference to the database
   */
  async onSubmit(): Promise<any> {
    await this.formServ.submit()
  };
}
