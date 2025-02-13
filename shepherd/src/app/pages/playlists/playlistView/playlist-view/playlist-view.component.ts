import {
  AfterViewInit, ChangeDetectorRef,
  Component, Inject,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, transferArrayItem} from "@angular/cdk/drag-drop";
import {NgForOf, NgIf} from "@angular/common";
import {TrackLineComponent} from "../track-line/track-line.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatButton, MatFabButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {PlaylistDisplayService} from '../../playlist-display.service';
import {PlaylistShortInfosComponent} from '../../playlist-short-infos/playlist-short-infos.component';
import {SongListDndComponent} from '../song-list-dnd/song-list-dnd.component';
import {PlvSectionHeaderComponent} from '../plv-section-header/plv-section-header.component';
import {PlvSectionContainerComponent} from '../plv-section-container/plv-section-container.component';

@Component({
  selector: 'app-playlist-view',
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
    NgIf
  ],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss',
})
export class PlaylistViewComponent implements OnInit, AfterViewInit {
  protected readonly FormControl = FormControl;
  private cdr=inject(ChangeDetectorRef)
  private fb: FormBuilder = inject(FormBuilder);
  public playlistDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  public playlistForm: FormGroup = this.fb.group({
    name: [''],
    length: [''],
    energy: [1],
    settings: this.fb.group({
      containsAerial: [false],
      containsDuo: [false],
    }),
    songList: [],
    notes: [''],
  });
  @Input() playlist: any = {};

  ngOnInit():void {
    this.initForm();
  };

  ngAfterViewInit() {

  }

  initForm(): void {
    this.playlistForm = this.fb.group({
      name: [this.playlist?.name || ''],
      energy: [this.playlist?.energy || 1],
      settings: this.fb.group({
        containsAerial: [this.playlist?.settings.containsAerial],
        containsDuo: [this.playlist?.settings.containsDuo],
      }),
      songList: this.fb.array(this.playlist?.songList || []),
      notes: [this.playlist?.notes || '']
    });
  };

  getControl(controlName: string) {
    return this.playlistForm.get(controlName) as FormControl;
  };

}
