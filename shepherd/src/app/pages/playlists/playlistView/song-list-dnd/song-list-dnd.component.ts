import { Component, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CdkDragDrop, CdkDrag, CdkDropList, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgForOf } from '@angular/common';
import { TrackLineComponent } from '../track-line/track-line.component';

@Component({
  selector: 'app-song-list-dnd',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    NgForOf,
    TrackLineComponent
  ],
  templateUrl: './song-list-dnd.component.html',
  styleUrl: './song-list-dnd.component.scss'
})
export class SongListDndComponent {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  @Input() songList: any[] = [];

  drop(event: CdkDragDrop<any[]>): void {
    console.log("🎵 Drag & Drop détecté !");
    console.log("Origine :", event.previousContainer.data);
    console.log("Destination :", event.container.data);

    if (event.previousContainer === event.container) {
      moveItemInArray(this.songList, event.previousIndex, event.currentIndex);
    } else {
      // Cas où on transfère entre listes différentes
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.cdr.detectChanges();
  };

  trackSong(index: number, song: any): any {
    return song._id || index;
  };
}




