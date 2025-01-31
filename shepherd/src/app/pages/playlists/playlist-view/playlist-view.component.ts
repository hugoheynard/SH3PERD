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
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {NgForOf} from "@angular/common";
import {TrackLineComponent} from "../track-line/track-line.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatButton, MatFabButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

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
    MatMiniFabButton
  ],
  templateUrl: './playlist-view.component.html',
  styleUrl: './playlist-view.component.scss'
})
export class PlaylistViewComponent implements OnInit, OnChanges{
  private fb: FormBuilder = inject(FormBuilder);

  playlistForm: FormGroup = this.fb.group({
    name: [''],
    length: [''],
    energy: [1],
    songList: [],
    notes: ['']
  });
  @Input() public playlist: any = {};
  @Output() closeSidenav:EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() {
    this.initForm()
  };

  initForm() {
    this.playlistForm = this.fb.group({
      name: [this.playlist?.name || ''],
      energy: [this.playlist?.energy || 1],
      songList: this.fb.array(this.playlist?.songList || []),
      notes: [this.playlist?.notes || '']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['playlist'] && changes['playlist'].currentValue) {
      this.initForm();
    }
  }

  close(): void {
    this.closeSidenav.emit();
  };








  drop(event: CdkDragDrop<string[]>): void {
    const songList = this.playlist.songList
    moveItemInArray(songList, event.previousIndex, event.currentIndex);
  };

  trackSong(index: number, song: any): any {
    return song.id || index; // Use a unique identifier, e.g., song.id
  };
}
