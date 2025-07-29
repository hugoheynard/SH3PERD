import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TUserMusicLibraryItem } from '@sh3pherd/shared-types';
import { NgIf } from '@angular/common';
import { CheckboxComponent, SvgIconComponent } from '@sh3pherd/ui-angular';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'music-card',
  imports: [
    NgIf,
    CheckboxComponent,
    MatIcon,
    SvgIconComponent,
  ],
  templateUrl: './music-card.component.html',
  standalone: true,
  styleUrl: './music-card.component.scss',
})
export class MusicCardComponent {
  @Input() item: TUserMusicLibraryItem = {} as TUserMusicLibraryItem;
  @Output() addEntry = new EventEmitter<void>();

  constructor() {
    console.log('MusicCardComponent initialized with item:', this.item);
  }
}
