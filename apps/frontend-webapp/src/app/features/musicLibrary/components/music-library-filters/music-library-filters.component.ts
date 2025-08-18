import { Component, inject } from '@angular/core';
import { InputComponent, MultiSelectDropdownComponent, SelectComponent } from '@sh3pherd/ui-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Sh3InputTextComponent } from '../../../../shared/sh3-input-text/sh3-input-text.component';

@Component({
  selector: 'music-library-filters',
  imports: [
    InputComponent,
    MultiSelectDropdownComponent,
    ReactiveFormsModule,
    NgIf,
    Sh3InputTextComponent,
    SelectComponent,
  ],
  templateUrl: './music-library-filters.component.html',
  styleUrl: './music-library-filters.component.scss'
})
export class MusicLibraryFiltersComponent {
  private fb = inject(FormBuilder);
  public form = this.fb.group({
    searchText: this.fb.control<string>(''),
  });

  baseFilterParams = this.fb.group({
    search: this.fb.control(''),
    genre: this.fb.control<string[]>([]),
    energy: this.fb.control<number[]>([]),
  });

}
