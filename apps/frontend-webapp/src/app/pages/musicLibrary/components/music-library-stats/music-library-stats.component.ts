import { Component } from '@angular/core';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { ButtonSecondaryComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'music-library-stats',
  imports: [
    StatCardComponent,
    MatIcon,
    NgClass,
    NgIf,
    ButtonSecondaryComponent,
  ],
  templateUrl: './music-library-stats.component.html',
  standalone: true,
  styleUrl: './music-library-stats.component.scss',
})
export class MusicLibraryStatsComponent {
  public isOpen: boolean = false;


}
