import {Component, inject, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {MatChip} from '@angular/material/chips';
import {NgForOf, NgStyle} from '@angular/common';
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
    FormsModule,
    NgStyle
  ],
  templateUrl: './available-tags.component.html',
  styleUrl: './available-tags.component.scss'
})
export class AvailableTagsComponent {
  private plDisplayService: PlaylistDisplayService = inject(PlaylistDisplayService);
  @Input() tagList: string[] = [];

  onDragStart(tag: string): void {
    this.plDisplayService.setSelectedTag(tag);
  };

  getSongDropListConnections(): string[] {
    return this.plDisplayService.songDropListConnectionsSignal();
  };

  dropTag(event: CdkDragDrop<string[]>): void {
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
