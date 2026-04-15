import {Component, Input} from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';
import {MatInput} from '@angular/material/input';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'playlist-short-infos',
    imports: [
        IconComponent,
        MatInput,
        ReactiveFormsModule
    ],
  standalone: true,
    templateUrl: './playlist-short-infos.component.html',
    styleUrl: './playlist-short-infos.component.scss'
})
export class PlaylistShortInfosComponent {
  @Input() energyControl!: FormControl;
  public length: any = '';
  public energy: number = 1;
}
