import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CdkDrag, CdkDragDrop, CdkDragEnd, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatChip} from '@angular/material/chips';
import {NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PlaylistDisplayService} from '../../playlist-display.service';

@Component({
  selector: 'available-tags',
  standalone: true,
  imports: [
    MatIcon,
    CdkDropList,
    MatChip,
    CdkDrag,
    NgForOf,
    FormsModule
  ],
  templateUrl: './available-tags.component.html',
  styleUrl: './available-tags.component.scss'
})
export class AvailableTagsComponent {
  private plDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  @Input() tagList: string[] = [];

  onDragStart(tag: string): void {
    console.log(tag, 'send into signal')
    this.plDisplayService.setSelectedTag(tag);
  };


  drop(event: CdkDragDrop<string[]>) {
    //Pas sur que ça soit utile
    if (event.previousContainer === event.container) {
      moveItemInArray(this.tagList, event.previousIndex, event.currentIndex);
    } else {
      //this.inputValue = event.item.data;
    }
  }

  dropTag(event: CdkDragDrop<string[]>, source: string) {
    if (event.previousContainer === event.container) {
      return;
    }

    // Récupération des données
    const tag = event.previousContainer.data[event.previousIndex];

    // Suppression du tag de la source
    event.previousContainer.data.splice(event.previousIndex, 1);

    // Ajout du tag dans la destination
    event.container.data.push(tag);
  }


}
