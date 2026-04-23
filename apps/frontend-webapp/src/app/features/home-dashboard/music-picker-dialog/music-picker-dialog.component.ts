import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  type OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type {
  TMusicPlayerWidgetConfig,
  TRepertoireEntryViewModel,
  TVersionTrackDomainModel,
  TVersionView,
} from '@sh3pherd/shared-types';
import { IconComponent } from '../../../shared/icon/icon.component';
import { MusicLibraryStateService } from '../../../features/musicLibrary/services/music-library-state.service';

type PickResult = TMusicPlayerWidgetConfig;

/**
 * Modal picker — lets a user pin a specific version/track to the home
 * music widget without leaving the dashboard.
 *
 * UX in three steps:
 * 1. Browse — searchable list of library entries (title / artist).
 * 2. Pick a version — each entry expands to show its versions (label,
 *    genre, mastery). When a version has a single track, step 3 is
 *    auto-skipped.
 * 3. Pick a track — if the version has multiple tracks, the user
 *    chooses which one to pin.
 *
 * The dialog emits:
 * - `selected(TMusicPlayerWidgetConfig)` — final pick, containing the
 *   version id, track id, and display metadata the widget will show.
 * - `cancelled()` — backdrop click / close button / `Escape`.
 *
 * The parent (the music widget) wires `selected` to
 * {@link WidgetContext.requestDataUpdate} so the new config persists
 * through the layout store.
 */
@Component({
  selector: 'app-music-picker-dialog',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './music-picker-dialog.component.html',
  styleUrl: './music-picker-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicPickerDialogComponent implements OnInit {
  private readonly libraryState = inject(MusicLibraryStateService);

  /** Emitted with the chosen config payload once the user confirms. */
  readonly selected = output<PickResult>();
  /** Emitted when the user dismisses the dialog without a selection. */
  readonly cancelled = output<void>();

  // ── UI state ────────────────────────────────────────────────────

  readonly query = signal('');
  /** Id of the entry whose versions are currently shown. */
  readonly expandedEntryId = signal<string | null>(null);
  /** Version selected for inline track picking — only meaningful for multi-track versions. */
  readonly expandedVersionId = signal<string | null>(null);

  // ── Library data ────────────────────────────────────────────────

  readonly entries = computed<TRepertoireEntryViewModel[]>(() => {
    return this.libraryState.library().entries;
  });

  /**
   * Entries narrowed by the current query. Case-insensitive match
   * against the title and the original artist. An empty query passes
   * everything through.
   */
  readonly filteredEntries = computed<TRepertoireEntryViewModel[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.entries();
    if (q.length === 0) return all;
    return all.filter((e) => {
      const ref = e.reference;
      return (
        ref.title.toLowerCase().includes(q) ||
        ref.originalArtist.toLowerCase().includes(q) ||
        e.versions.some((v) => v.label.toLowerCase().includes(q))
      );
    });
  });

  // ── Lifecycle ───────────────────────────────────────────────────

  ngOnInit(): void {
    // The library is fetched once per session — idempotent.
    this.libraryState.loadLibrary();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  // ── Interactions ────────────────────────────────────────────────

  clearQuery(): void {
    this.query.set('');
  }

  toggleEntry(entryId: string): void {
    this.expandedEntryId.update((id) => (id === entryId ? null : entryId));
    this.expandedVersionId.set(null);
  }

  /**
   * Called when a version row is clicked:
   * - Single-track versions are confirmed immediately.
   * - Multi-track versions expand to reveal the track list.
   */
  onVersionPick(entry: TRepertoireEntryViewModel, version: TVersionView): void {
    if (version.tracks.length === 0) return;
    if (version.tracks.length === 1) {
      this.confirm(entry, version, version.tracks[0]!);
      return;
    }
    this.expandedVersionId.update((id) =>
      id === version.id ? null : version.id,
    );
  }

  onTrackPick(
    entry: TRepertoireEntryViewModel,
    version: TVersionView,
    track: TVersionTrackDomainModel,
  ): void {
    this.confirm(entry, version, track);
  }

  close(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  // ── Internals ───────────────────────────────────────────────────

  private confirm(
    entry: TRepertoireEntryViewModel,
    version: TVersionView,
    track: TVersionTrackDomainModel,
  ): void {
    const config: PickResult = {
      versionId: version.id,
      trackId: track.id,
      title: entry.reference.title,
      subtitle: `${entry.reference.originalArtist} · ${version.label}`,
    };
    this.selected.emit(config);
  }
}
