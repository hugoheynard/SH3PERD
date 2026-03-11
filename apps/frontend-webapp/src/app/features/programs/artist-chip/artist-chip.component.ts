import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { PlannerArtist } from '../program-types';

@Component({
  selector: 'app-artist-chip',
  imports: [],
  templateUrl: './artist-chip.component.html',
  styleUrl: './artist-chip.component.scss'
})
export class ArtistChipComponent {
  @Input({ required: true }) artist!: PlannerArtist;

  @Output() remove = new EventEmitter<string>();

  onRemove() {
    this.remove.emit(this.artist.id);
  }
}
