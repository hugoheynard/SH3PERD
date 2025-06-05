import {Component, Input} from '@angular/core';
import { PlaylistDisplayService } from '../../playlist-display.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'open-music-lib-button',
  imports: [MatIcon],
  templateUrl: './open-music-lib-button.component.html',
  standalone: true,
  styleUrls: ['./open-music-lib-button.component.scss']
})
export class OpenMusicLibButtonComponent {
  @Input() pldServ!: PlaylistDisplayService;

  openMusicLib(): void {
    this.pldServ.openLibraryView();
  };
}
