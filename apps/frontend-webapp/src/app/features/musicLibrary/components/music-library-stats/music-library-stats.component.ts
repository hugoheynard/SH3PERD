import { Component, input } from '@angular/core';
import { StatCardComponent } from '../stat-card/stat-card.component';

import { ButtonSecondaryComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'music-library-stats',
  imports: [
    StatCardComponent,
    ButtonSecondaryComponent
],
  templateUrl: './music-library-stats.component.html',
  standalone: true,
  styleUrl: './music-library-stats.component.scss',
})
export class MusicLibraryStatsComponent {
  readonly isOpen= input<boolean>(false);


}
