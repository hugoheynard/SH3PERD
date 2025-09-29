import { Component, inject } from '@angular/core';
import {AppMenuComponent} from '../../../../core/components/menus/appMenu/app-menu.component';
import { AddMusicPanelComponent } from '../add-music-panel/add-music-panel.component';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-music-lib-context-menu',
  imports: [
    AppMenuComponent,
  ],
  templateUrl: './music-lib-context-menu.component.html',
  standalone: true,
  styleUrl: './music-lib-context-menu.component.scss'
})
export class MusicLibContextMenuComponent {
  private layoutService: LayoutService = inject(LayoutService);


  openAddVersionPanel(): void {
    this.layoutService.setRightPanel(AddMusicPanelComponent);
  };

}
