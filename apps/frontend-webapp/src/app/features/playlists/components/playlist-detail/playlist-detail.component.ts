import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PlaylistsApiService } from '../../services/playlists-api.service';
import { PlaylistsStateService } from '../../services/playlists-state.service';
import { TrackMutationService } from '../../services/mutations-layer/track-mutation.service';
import { PlaylistsSelectorService } from '../../services/selector-layer/playlists-selector.service';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import {
  ratingLevel,
  RATING_DOTS,
} from '../../../../shared/utils/rating.utils';
import { DndDropZoneDirective } from '../../../../core/drag-and-drop/dnd-drop-zone.directive';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';
import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';
import type {
  DragState,
  PlaylistTrackDragPayload,
} from '../../../../core/drag-and-drop/drag.types';
import type { TPlaylistDetailViewModel } from '../../playlist-types';
import type { TPlaylistId, TPlaylistTrackId } from '@sh3pherd/shared-types';

/**
 * Detail view for a single playlist — mounted when the active tab is
 * in `playlist` mode. Fetches the detail from the backend whenever the
 * input `playlistId` changes, caches the response in a local signal
 * and renders the tracklist. The DnD drop-zone wiring lives in a
 * later commit; this one covers header + tracklist + remove-track UX.
 */
@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [IconComponent, DndDropZoneDirective, DndDragDirective],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDetailComponent {
  private readonly api = inject(PlaylistsApiService);
  private readonly trackMutation = inject(TrackMutationService);
  private readonly selector = inject(PlaylistsSelectorService);
  private readonly session = inject(DragSessionService);
  private readonly state = inject(PlaylistsStateService);

  /** Ref to the rendered `.tracklist` element — used to read per-row
   *  bounding rects and compute the insertion slot under the cursor. */
  private readonly tracklistEl =
    viewChild<ElementRef<HTMLElement>>('tracklistEl');

  /** ID of the playlist to render. `null` surfaces the empty state
   *  (e.g. no playlists exist yet, or the tab was opened blank). */
  readonly playlistId = input.required<TPlaylistId | null>();

  /** Loaded detail — null while loading or when no playlist is open. */
  readonly detail = signal<TPlaylistDetailViewModel | null>(null);

  /** Loading state — shown briefly while the fetch is in flight. */
  readonly loading = signal(false);

  readonly ratingDots = RATING_DOTS;
  readonly ratingLevel = ratingLevel;

  /** The matching summary from the state service — used for the rating
   *  aggregates + duration in the header without refetching. Falls
   *  back to the detail's own fields when the summary isn't resolved
   *  yet (stale cache race). */
  readonly summary = computed(() => {
    const id = this.playlistId();
    if (!id) return null;
    return this.selector.playlistsById().get(id) ?? null;
  });

  readonly totalDuration = computed(() =>
    formatDuration(this.summary()?.totalDurationSeconds ?? 0),
  );

  constructor() {
    effect(() => {
      const id = this.playlistId();
      if (!id) {
        this.detail.set(null);
        return;
      }
      this.loading.set(true);
      this.api.getPlaylistDetail(id).subscribe({
        next: (vm) => {
          this.detail.set(vm);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    });
  }

  /** Round a mean rating to the closest integer dot position. */
  integerFromMean(mean: number | null): number {
    if (mean === null) return 0;
    return Math.max(1, Math.min(4, Math.round(mean)));
  }

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }

  /* ── Drag & drop: cursor-driven insertion slot ── */

  /** `true` while a drag of either supported type is active — used by
   *  the template to render the insertion bar. */
  readonly isReorderDrag = computed(() => {
    const drag = this.session.current();
    return drag?.type === 'music-track' || drag?.type === 'playlist-track';
  });

  /**
   * ID of the row currently being dragged inside this tracklist, or
   * `null` when no internal reorder drag is active. Read by the
   * template to dim the source row while it's being moved.
   */
  readonly draggingTrackId = computed(() => {
    const drag = this.session.current();
    return drag?.type === 'playlist-track' ? drag.data.playlistTrackId : null;
  });

  /**
   * Insertion index under the cursor, or `-1` when the cursor is
   * outside the tracklist. Recomputes on every cursor move because
   * it depends on the `DragSessionService.cursor()` signal.
   *
   * Semantics: `i` means "insert between row i-1 and row i", so `0`
   * is "before the first row" and `tracks.length` is "after the last".
   */
  readonly insertIndex = computed(() => {
    if (!this.isReorderDrag()) return -1;
    const el = this.tracklistEl()?.nativeElement;
    if (!el) return -1;

    const cursor = this.session.cursor();
    const bbox = el.getBoundingClientRect();
    if (
      cursor.x < bbox.left ||
      cursor.x > bbox.right ||
      cursor.y < bbox.top ||
      cursor.y > bbox.bottom
    ) {
      return -1;
    }

    const rows = el.querySelectorAll<HTMLElement>('.track-row');
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (cursor.y < r.top + r.height / 2) return i;
    }
    return rows.length;
  });

  /**
   * Y offset inside the tracklist at which to render the insertion
   * bar. Relative to the tracklist's own top (so absolute-positioned
   * inside the scroll container). `-1` hides the bar.
   */
  readonly insertY = computed(() => {
    const idx = this.insertIndex();
    if (idx < 0) return -1;
    const el = this.tracklistEl()?.nativeElement;
    if (!el) return -1;

    const rows = el.querySelectorAll<HTMLElement>('.track-row');
    const bbox = el.getBoundingClientRect();

    if (rows.length === 0) return 8; // empty list — align near the top
    if (idx === 0) {
      return rows[0].getBoundingClientRect().top - bbox.top + el.scrollTop;
    }
    if (idx >= rows.length) {
      const last = rows[rows.length - 1].getBoundingClientRect();
      return last.bottom - bbox.top + el.scrollTop;
    }
    return rows[idx].getBoundingClientRect().top - bbox.top + el.scrollTop;
  });

  /** Build the drag payload for a track row — identity + display
   *  fields for the preview chip. */
  dragPayloadFor(track: {
    id: string;
    title: string;
    originalArtist: string;
  }): PlaylistTrackDragPayload {
    return {
      playlistTrackId: track.id as TPlaylistTrackId,
      title: track.title,
      artist: track.originalArtist,
    };
  }

  /**
   * Optimistic remove via TrackMutationService. The summary's
   * trackCount decrements immediately; the effect above re-fetches
   * the detail if the user returns to this view later.
   */
  onRemoveTrack(trackId: string): void {
    const pl = this.detail();
    if (!pl) return;
    this.trackMutation.removeTrack(pl.id, trackId);
    this.detail.update((current) => {
      if (!current) return current;
      return {
        ...current,
        tracks: current.tracks.filter((t) => t.id !== trackId),
      };
    });
  }

  /**
   * Unified drop handler — decides between "add a version from the
   * library" and "reorder an existing row" based on the drag type.
   * Computed index is captured at drop time (the template driver is
   * signal-based, so the final cursor position is fresh).
   */
  onTracklistDrop(drag: DragState): void {
    if (drag.type === 'music-track') {
      this.dispatchAdd(drag.data.referenceId, drag.data.versionId);
      return;
    }
    if (drag.type === 'playlist-track') {
      const idx = this.insertIndex();
      if (idx < 0) return;
      this.dispatchReorder(drag.data.playlistTrackId, idx);
    }
  }

  private dispatchAdd(referenceId: string, versionId: string): void {
    const pl = this.detail();
    if (!pl) return;
    this.trackMutation.addTrack(
      pl.id,
      referenceId as never,
      versionId as never,
    );
    // Refresh the resolved tracklist so the dropped track shows up
    // immediately with its joined title / artist / version label.
    this.api.getPlaylistDetail(pl.id).subscribe({
      next: (vm) => this.detail.set(vm),
    });
  }

  private dispatchReorder(trackId: TPlaylistTrackId, idx: number): void {
    const pl = this.detail();
    if (!pl) return;
    const tracks = pl.tracks;
    const current = tracks.findIndex((t) => t.id === trackId);
    if (current === -1) return;

    // Drop-in-place (slot just before or just after the dragged row)
    // is a no-op — don't trigger an API round-trip for nothing.
    if (idx === current || idx === current + 1) return;

    // Translate the visual slot (including the dragged row in the
    // count) to the "insert at slot N among siblings" semantics the
    // TrackMutationService expects. Moving forward (idx > current)
    // compensates for the removal that shifts later rows up by one.
    const newPosition = idx > current ? idx - 1 : idx;

    this.trackMutation.moveTrack(pl.id, trackId, newPosition);

    // Optimistic reorder on the local detail signal so the UI
    // reflects the new order immediately.
    this.detail.update((d) => {
      if (!d) return d;
      const moving = d.tracks.find((t) => t.id === trackId);
      if (!moving) return d;
      const others = d.tracks.filter((t) => t.id !== trackId);
      const reordered = [...others];
      reordered.splice(newPosition, 0, moving);
      return {
        ...d,
        tracks: reordered.map((t, i) => ({ ...t, position: i })),
      };
    });

    // Permute the per-track rating series on the summary too so the
    // card's sparklines redraw with the new track order. Means are
    // unchanged by reordering so they stay put.
    this.state.reorderSummarySeries(pl.id, current, newPosition);
  }
}
