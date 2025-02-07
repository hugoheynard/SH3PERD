import {Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-playlist-short-infos',
  standalone: true,
  imports: [
    MatIcon,
    MatInput,
    ReactiveFormsModule
  ],
  templateUrl: './playlist-short-infos.component.html',
  styleUrl: './playlist-short-infos.component.scss'
})
export class PlaylistShortInfosComponent {
  @Input() energyControl!: FormControl;
  public length: any = '';
  public energy: number = 1;
}
