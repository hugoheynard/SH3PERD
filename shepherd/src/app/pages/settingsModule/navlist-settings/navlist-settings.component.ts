import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatListItem, MatNavList} from "@angular/material/list";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-navlist-settings',
  standalone: true,
    imports: [
        MatIcon,
        MatListItem,
        MatNavList,
        RouterLink,
        RouterLinkActive
    ],
  templateUrl: './navlist-settings.component.html',
  styleUrl: './navlist-settings.component.scss'
})
export class NavlistSettingsComponent {

}
