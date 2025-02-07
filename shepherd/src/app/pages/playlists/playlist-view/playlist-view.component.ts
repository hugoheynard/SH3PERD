import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {NgForOf} from "@angular/common";
import {TrackLineComponent} from "../track-line/track-line.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatButton, MatFabButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {PlaylistDisplayService} from '../playlist-display.service';
import {PlaylistShortInfosComponent} from '../playlist-short-infos/playlist-short-infos.component';

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
    PlaylistShortInfosComponent
  ],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss'
})
export class PlaylistViewComponent implements OnInit, OnChanges{
  private fb: FormBuilder = inject(FormBuilder);
  public playlistDisplayService: any = inject(PlaylistDisplayService);
  public playlistForm: FormGroup = this.fb.group({
    name: [''],
    length: [''],
    energy: [1],
    songList: [],
    notes: ['']
  });

  @Input() public playlist: any = {};

  ngOnInit():void {
    this.initForm()
  };

  initForm() {
    this.playlistForm = this.fb.group({
      name: [this.playlist?.name || ''],
      energy: [this.playlist?.energy || 1],
      songList: this.fb.array(this.playlist?.songList || []),
      notes: [this.playlist?.notes || '']
    });
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['playlist'] && changes['playlist'].currentValue) {
      this.initForm();
    }
  };

  getControl(controlName: string) {
    return this.playlistForm.get(controlName) as FormControl;
  };

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        this.playlist.songList,
        event.previousIndex,
        event.currentIndex
      );
    }

    console.log(event.previousContainer.data)
  }








  trackSong(index: number, song: any): any {
    return song.id || index;
  };

  protected readonly FormControl = FormControl;
}
