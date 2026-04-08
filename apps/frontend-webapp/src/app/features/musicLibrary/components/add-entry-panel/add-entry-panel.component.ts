import { Component, computed, DestroyRef, inject, type OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, debounceTime, distinctUntilChanged, of, catchError, EMPTY } from 'rxjs';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import { PopoverFrameComponent } from '../../../../shared/ui-frames/popover-frame/popover-frame.component';
import { LayoutService } from '../../../../core/services/layout.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import { MusicReferenceApiService } from '../../services/music-reference-api.service';
import { MusicRepertoireApiService } from '../../services/music-repertoire-api.service';
import { MusicLibraryMutationService } from '../../services/mutations-layer/music-library-mutation.service';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-add-entry-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, BadgeComponent, PopoverFrameComponent],
  templateUrl: './add-entry-panel.component.html',
  styleUrl: './add-entry-panel.component.scss',
})
export class AddEntryPanelComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);
  private readonly layout = inject(LayoutService);
  private readonly selector = inject(MusicLibrarySelectorService);
  private readonly refApi = inject(MusicReferenceApiService);
  private readonly repertoireApi = inject(MusicRepertoireApiService);
  private readonly mutation = inject(MusicLibraryMutationService);
  private readonly toast = inject(ToastService);

  // ── UI state ──
  readonly query = signal('');
  readonly newTitle = signal('');
  readonly newArtist = signal('');
  readonly showNewForm = signal(false);
  readonly saving = signal(false);
  readonly searching = signal(false);
  readonly error = signal('');

  /** Results from the backend search API. */
  readonly searchResults = signal<TMusicReferenceDomainModel[]>([]);

  /** Reference pending user confirmation to add to repertoire. */
  readonly pendingRef = signal<TMusicReferenceDomainModel | null>(null);

  /** Subject driving the debounced search. */
  private readonly search$ = new Subject<string>();

  /** Set of reference IDs already in the user's repertoire. */
  readonly inRepertoire = computed(() =>
    new Set(this.selector.entries().map(e => e.reference.id)),
  );


  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.trim().length < 2) {
            this.searchResults.set([]);
            this.searching.set(false);
            return EMPTY;
          }
          this.searching.set(true);
          return this.refApi.search(q).pipe(
            catchError(() => of([] as TMusicReferenceDomainModel[])),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(results => {
        this.searchResults.set(results);
        this.searching.set(false);
      });
  }

  /** Called on each keystroke in the search input. */
  onQueryChange(value: string): void {
    this.query.set(value);
    this.search$.next(value);
  }

  /** Add an existing reference to the repertoire. */
  selectRef(ref: TMusicReferenceDomainModel): void {
    if (this.inRepertoire().has(ref.id) || this.saving()) return;

    this.saving.set(true);
    this.error.set('');

    this.repertoireApi.addEntry(ref.id).subscribe({
      next: () => {
        this.mutation.addEntry({
          id: ref.id,
          title: ref.title,
          originalArtist: ref.artist,
        });
        this.toast.show('Added to repertoire', 'success');
        this.close();
      },
      error: () => {
        this.error.set('Failed to add entry. Please try again.');
        this.saving.set(false);
      },
    });
  }

  /** Create a new reference, then ask the user whether to add it to the repertoire. */
  submitNew(): void {
    const title = this.newTitle().trim();
    const artist = this.newArtist().trim();
    if (!title || !artist || this.saving()) return;

    this.saving.set(true);
    this.error.set('');

    this.refApi.create({ title, artist }).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.pendingRef.set(created);
      },
      error: () => {
        this.error.set('Failed to create reference. Please try again.');
        this.saving.set(false);
      },
    });
  }

  /** User confirmed — add the pending reference to the repertoire. */
  confirmAdd(): void {
    const ref = this.pendingRef();
    if (!ref || this.saving()) return;

    this.saving.set(true);

    this.repertoireApi.addEntry(ref.id).subscribe({
      next: () => {
        this.mutation.addEntry({
          id: ref.id,
          title: ref.title,
          originalArtist: ref.artist,
        });
        this.toast.show('Added to repertoire', 'success');
        this.close();
      },
      error: () => {
        this.error.set('Failed to add to repertoire. Please try again.');
        this.saving.set(false);
      },
    });
  }

  /** User dismissed — reference was created but not added to repertoire. */
  dismissPending(): void {
    this.toast.show('Reference created', 'info');
    this.pendingRef.set(null);
    this.showNewForm.set(false);
    this.newTitle.set('');
    this.newArtist.set('');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.pendingRef()) {
        this.dismissPending();
      } else {
        this.close();
      }
    }
  }

  close(): void {
    this.layout.clearPopover();
  }
}
