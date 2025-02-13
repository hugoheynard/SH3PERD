import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {MatInput} from '@angular/material/input';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-track-line',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    NgIf,
    MatInput,
    MatChipSet,
    CdkDropList,
    MatChip,
    CdkDrag
  ],
  templateUrl: './track-line.component.html',
  styleUrl: './track-line.component.scss'
})
export class TrackLineComponent {
 @Input() song: any = {};

 public expandedTrack: boolean = true;
 public additionalPerformers: boolean = true;

 toggleExpand(): void {
   this.expandedTrack = !this.expandedTrack;
 };

  readonly compatiblesPerformers: any =[
    {name: 'Jesse'},
    {name: 'Anna'},
  ];

  drop(event: CdkDragDrop<any[]>) {
    this.compatiblesPerformers.update((performer: any) => {
      moveItemInArray(performer, event.previousIndex, event.currentIndex);
      return [...this.compatiblesPerformers];
    });
  }
}
