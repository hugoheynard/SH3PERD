import { inject, Injectable, signal } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type { LibraryEntry } from '../music-library-types';

/**
 * Owns the repertoire-entry slice of the music library state.
 *
 * Pulled out of `MusicLibraryStateService` so HTTP orchestration for
 * the main data does not live alongside tab persistence and cross
 * library concerns — one reason to change per service.
 *
 * Consumers read `entries()` and mutate via `updateEntries()`. The
 * facade re-exports both; feature code keeps going through it so
 * call sites stay ignorant of the split.
 */
@Injectable({ providedIn: 'root' })
export class MusicLibraryDataService {
  private readonly libraryApi = inject(MusicLibraryApiService);
  private readonly toast = inject(ToastService);

  private readonly _entries = signal<LibraryEntry[]>([]);
  /** Public read-only accessor used by the facade + selectors. */
  readonly entries = this._entries.asReadonly();

  /** Idempotency guard for the initial load — same semantics as the old service. */
  private loaded = false;

  /** Fire-once repertoire fetch. Re-arms itself on HTTP failure so the user can retry. */
  load(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.libraryApi.getMyLibrary().subscribe({
      next: (result) => {
        this._entries.set(result.entries as LibraryEntry[]);
      },
      error: () => {
        this.loaded = false;
        this.toast.show('Failed to load repertoire', 'error');
      },
    });
  }

  /**
   * Always-hits-the-server refresh — used by the analysis polling loop
   * to pick up the async snapshot without reloading the whole page.
   * Bypasses the `loaded` guard on purpose.
   */
  refresh(): Observable<LibraryEntry[]> {
    return this.libraryApi.getMyLibrary().pipe(
      tap((result) => this._entries.set(result.entries as LibraryEntry[])),
      map((result) => result.entries as LibraryEntry[]),
    );
  }

  /** Cheap functional update — mutation service and friends reach in through here. */
  updateEntries(updater: (entries: LibraryEntry[]) => LibraryEntry[]): void {
    this._entries.update(updater);
  }
}
