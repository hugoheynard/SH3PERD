import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-favorite-dynamic-icon',
    imports: [
        MatIcon,
        NgIf
    ],
    templateUrl: './favorite-dynamic-icon.component.html',
    styleUrl: './favorite-dynamic-icon.component.scss'
})
export class FavoriteDynamicIconComponent {
 @Input() favorite: boolean = false;
}
