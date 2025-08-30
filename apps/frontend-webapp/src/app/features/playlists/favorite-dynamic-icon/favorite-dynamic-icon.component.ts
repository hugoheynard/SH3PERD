import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";


@Component({
    selector: 'app-favorite-dynamic-icon',
    imports: [
    MatIcon
],
    templateUrl: './favorite-dynamic-icon.component.html',
    standalone: true,
    styleUrl: './favorite-dynamic-icon.component.scss'
})
export class FavoriteDynamicIconComponent {
 @Input() favorite: boolean = false;
}
