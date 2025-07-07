import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBlockComponent } from '../../../musicTabConfigurator/components/form-block/form-block.component';
import {
  ButtonPrimaryComponent, ButtonSecondaryComponent, ButtonTertiaryComponent,
  CheckboxComponent,
  FileUploaderComponent,
  InputComponent,
  SelectComponent, SelectListComponent,
} from '@sh3pherd/ui-angular';
import { MusicLibraryTextContentService } from '../../../../services/music-library-text-content.service';
import { MusicVersionFormService } from '../../services/music-version-form.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgStyle } from '@angular/common';
import { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { MusicReferenceService } from '../../../../services/music-reference.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private formServ = inject(MusicVersionFormService);
  public form: any = this.formServ.buildForm();
  /**
   * SIGNAL FOR TRACK MAP RESEARCH
   */
  public titleSig = toSignal<string>(this.form.get('details.title')!.valueChanges, {
    initialValue: this.form.get('details.title')!.value ?? '',
  });

  public artistSig = toSignal<string>(this.form.get('details.artist')!.valueChanges, {
    initialValue: this.form.get('details.artist')!.value ?? '',
  });

  public searchTrigger = computed<{ title: string; artist: string }>(() => ({
    title: this.titleSig() ?? '',
    artist: this.artistSig() ?? ''
  }));
  private useDetailsSig = toSignal<boolean>(
    (this.form.get('musicReferenceDetails.useVersionDetails') as FormControl<boolean>).valueChanges,
    { initialValue: this.form.get('musicReferenceDetails.useVersionDetails') });

  constructor() {
    effect(() => {
      //triggers the search when title or artist changes
      const { title, artist } = this.searchTrigger();

      this.musRefServ.searchByTitleAndArtist(title, artist)
        .subscribe(results => {
          this.musicRefsSuggestions.set(results);
        });

      //listens to changes in the useDetails checkbox
      const detailsGroup = this.form.get('musicReferenceDetails') as FormGroup;

      if (this.useDetailsSig()) {
        detailsGroup.patchValue({
          title: this.form.get('details.title')!.value,
          artist: this.form.get('details.artist')!.value,
        });
      } else {
        detailsGroup.patchValue({
          title: '',
          artist: ''
        });
      }
    });
  }

  /** MUSIC REF SELECTOR LIST
   *
   */
  public musicRefsSuggestions = signal<TMusicReferenceDomainModel[]>([]);

  trackByMusicRef = (ref: any) => ref.musicReference_id;
  labelForMusicRef = (ref: any): string => `${ref.title} - ${ref.artist}`;





  /**
   * creates a new music reference to match the music version, available globally
   */
  musicRefFormOpen = signal(true);
  openMusicRefForm = () => {
    this.musicRefFormOpen.set(true);
    this.form.get('createMusicReference')!.setValue(true);
  };
  closeMusicRefForm = () => this.musicRefFormOpen.set(false);

  useVersionDetailsAsMusicRefDetails(): void {
    this.form.set('musicReferenceDetails.title')!.value = this.form.get('details.title')!.value;
    this.form.set('musicReferenceDetails.artist')!.value = this.form.get('details.artist')!.value;
  };

  resetAddReferenceProcess(): void {
    this.closeMusicRefForm();
  }
}
