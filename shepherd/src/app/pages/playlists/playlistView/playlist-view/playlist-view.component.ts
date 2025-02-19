import {
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {CdkDrag, CdkDropList} from "@angular/cdk/drag-drop";
import {NgForOf, NgIf} from "@angular/common";
import {TrackLineComponent} from "../track-line/track-line.component";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {PlaylistShortInfosComponent} from '../../playlist-short-infos/playlist-short-infos.component';
import {SongListDndComponent} from '../song-list-dnd/song-list-dnd.component';
import {PlvSectionHeaderComponent} from '../plv-section-header/plv-section-header.component';
import {PlvSectionContainerComponent} from '../plv-section-container/plv-section-container.component';
import {AvailableTagsComponent} from '../available-tags/available-tags.component';
import {PlaylistService} from '../../../../services/playlist.service';
import {PlaylistFormService} from '../../formsServices/playlist-form.service';

@Component({
  selector: 'playlist-view',
  standalone: true,
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
    PlvSectionHeaderComponent,
    PlvSectionContainerComponent,
    NgIf,
    AvailableTagsComponent,
    MatIconButton
  ],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss',
})
export class PlaylistViewComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private plServ: PlaylistService = inject(PlaylistService);
  public playlistFormService: PlaylistFormService =  inject(PlaylistFormService);
  public playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  public playlistForm: FormGroup = this.fb.group({});
  @Input() playlist: any = {};

  ngOnInit():void {
    this.initForm();
  };

  initForm(): void {
    this.playlistForm = this.playlistFormService.createPlaylistForm(this.playlist);
  }; //OK





  getControl(controlName: string) {
    return this.playlistForm.get(controlName) as FormControl;
  };

  savePlaylist(): void {
    this.plServ.savePlaylist({ data: this.playlistForm });
  };

}
