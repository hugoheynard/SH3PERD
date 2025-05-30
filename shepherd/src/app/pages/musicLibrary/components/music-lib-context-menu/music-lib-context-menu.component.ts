import { Component } from '@angular/core';
import {AppMenuComponent} from '../../../../components/menus/appMenu/app-menu.component';

@Component({
  selector: 'app-music-lib-context-menu',
  imports: [
    AppMenuComponent,
    AppMenuComponent
  ],
  templateUrl: './music-lib-context-menu.component.html',
  standalone: true,
  styleUrl: './music-lib-context-menu.component.scss'
})
export class MusicLibContextMenuComponent {

}
