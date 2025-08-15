import { Component } from '@angular/core';
import { InputComponent, MultiSelectDropdownComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'music-library-filters',
  imports: [
    InputComponent,
    MultiSelectDropdownComponent,
  ],
  templateUrl: './music-library-filters.component.html',
  styleUrl: './music-library-filters.component.scss'
})
export class MusicLibraryFiltersComponent {

}
