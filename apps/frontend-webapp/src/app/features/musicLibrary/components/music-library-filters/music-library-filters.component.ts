import { Component, DestroyRef, inject, model } from '@angular/core';
import { MultiSelectDropdownComponent, Sh3SearchBarComponent } from '@sh3pherd/ui-angular';
import { FormBuilder, type FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { MusicLibraryTextContentService } from '../../services/music-library-text-content.service';
import { MusicRepertoireEntryFormService } from '../../formServices/music-repertoire-entry-form.service';

export type Filters = any;


@Component({
  selector: 'music-library-filters',
  imports: [
    MultiSelectDropdownComponent,
    ReactiveFormsModule,
    Sh3SearchBarComponent
  ],
  standalone: true,
  templateUrl: './music-library-filters.component.html',
  styleUrl: './music-library-filters.component.scss'
})
export class MusicLibraryFiltersComponent {
  private fb = inject(FormBuilder);
  public textServ = inject(MusicLibraryTextContentService);
  //subForms
  private readonly repertoireEntry = inject(MusicRepertoireEntryFormService);

  public filterForm: FormGroup<any> = this.buildForm();
  public filterValue = model<Filters>();

  constructor(destroyRef: DestroyRef) {
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.getRawValue()),
      debounceTime(300),
      map(this.compileFilters),
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntilDestroyed(destroyRef)
    ).subscribe((v: any) => this.filterValue.set(v));
  };

  compileFilters(raw: any): Filters {
    return raw;
  };

  buildForm(): any {
    return this.fb.group({
      searchText: this.fb.control<string>(''),
      musicVersion: this.fb.group({
        genre: this.fb.control<string[] | undefined>(undefined),
        type: this.fb.control<string[] | undefined>(undefined),
      }),
      repertoireEntry: this.repertoireEntry.buildForm()
    });
  }
}
