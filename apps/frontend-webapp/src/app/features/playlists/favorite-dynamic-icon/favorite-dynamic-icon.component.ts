import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';


@Component({
    selector: 'app-favorite-dynamic-icon',
    imports: [
      IconComponent,
    ],
    templateUrl: './favorite-dynamic-icon.component.html',
    standalone: true,
    styleUrl: './favorite-dynamic-icon.component.scss'
})
export class FavoriteDynamicIconComponent {
 @Input() favorite: boolean = false;
}
