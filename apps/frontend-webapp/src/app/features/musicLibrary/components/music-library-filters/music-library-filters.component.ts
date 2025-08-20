import { Component, DestroyRef, inject, model } from '@angular/core';
import { MultiSelectDropdownComponent, SelectComponent } from '@sh3pherd/ui-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Sh3InputTextComponent } from '../../../../shared/sh3-input-text/sh3-input-text.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { MusicLibraryTextContentService } from '../../services/music-library-text-content.service';

export type Filters = any;


@Component({
  selector: 'music-library-filters',
  imports: [
    MultiSelectDropdownComponent,
    ReactiveFormsModule,
    Sh3InputTextComponent,
    SelectComponent,
  ],
  templateUrl: './music-library-filters.component.html',
  styleUrl: './music-library-filters.component.scss'
})
export class MusicLibraryFiltersComponent {
  public textServ = inject(MusicLibraryTextContentService);
  private fb = inject(FormBuilder);
  public form = this.fb.group({
    searchText: this.fb.control<string>(''),
    repertoireEntry: this.fb.group({
      energy: this.fb.control<number[]>([])
    }),
  });

  public filterValue = model<Filters>();

  constructor(destroyRef: DestroyRef) {
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      debounceTime(300),
      map(this.compileFilters),
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntilDestroyed(destroyRef)
    ).subscribe(v => this.filterValue.set(v));
  }


  compileFilters(raw: any): Filters {
    return raw;
  };
}
