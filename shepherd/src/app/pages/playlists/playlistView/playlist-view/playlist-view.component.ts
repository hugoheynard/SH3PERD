import {
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {CdkDrag, CdkDropList} from "@angular/cdk/drag-drop";
import {NgForOf, NgIf} from "@angular/common";
import {TrackLineComponent} from "../track-line/track-line.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {PlaylistShortInfosComponent} from '../../playlist-short-infos/playlist-short-infos.component';
import {SongListDndComponent} from '../song-list-dnd/song-list-dnd.component';
import {PlvSectionContainerComponent} from '../plv-section-container/plv-section-container.component';
import {AvailableTagsComponent} from '../available-tags/available-tags.component';
import {PlaylistService} from '../../../../services/playlistService/playlist.service';
import {PlaylistFormService} from '../../formsServices/playlist-form.service';
import {StyledInputDirective} from '../../../../../Directives/styled-input.directive';
import {CdkAccordion, CdkAccordionItem} from '@angular/cdk/accordion';
import {StyledCheckboxDirective} from '../../../../../Directives/styled-checkbox.directive';
import {SnackbarService} from '../../../../services/snackbar.service';

@Component({
    selector: 'playlist-view',
  imports: [
    CdkDrag,
    CdkDropList,
    NgForOf,
    TrackLineComponent,
    ReactiveFormsModule,
    MatInput,
    MatButton,
    MatFabButton,
    MatIcon,
    MatMiniFabButton,
    PlaylistShortInfosComponent,
    SongListDndComponent,
    PlvSectionContainerComponent,
    NgIf,
    AvailableTagsComponent,
    MatIconButton,
    CdkAccordion,
    CdkAccordionItem,
    StyledInputDirective,
    StyledCheckboxDirective
  ],
    templateUrl: './playlist-view.component.html',
    standalone: true,
    styleUrl: './playlist-view.component.scss'
})
export class PlaylistViewComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private plServ: PlaylistService = inject(PlaylistService);
  public playlistFormService: PlaylistFormService =  inject(PlaylistFormService);
  public playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  private snackBarService: SnackbarService = inject(SnackbarService);
  public playlistForm: FormGroup = this.fb.group({});
  @Input() playlist: any = {};


  ngOnInit():void {
    this.initForm();
  };

  initForm(): void {
    this.playlistForm = this.playlistFormService.createPlaylistForm(this.playlist);
  };

  getControl(controlName: string) {
    return this.playlistForm.get(controlName) as FormControl;
  };

  async savePlaylist(): Promise<void> {
    try {
      if (!this.playlistForm.valid) {
        this.snackBarService.show('Invalid form');
        return;
      }

      const response = await this.plServ.savePlaylist({ playlistData: this.playlistForm.value });

      if (response.ok) {
        this.snackBarService.show('New Playlist saved');
      }
    } catch(error) {
      console.error(error);
      this.snackBarService.show('Error saving playlist');
    }
  };

}
