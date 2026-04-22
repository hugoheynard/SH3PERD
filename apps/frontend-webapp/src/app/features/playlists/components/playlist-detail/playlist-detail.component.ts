import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PlaylistsApiService } from '../../services/playlists-api.service';
import { PlaylistsStateService } from '../../services/playlists-state.service';
import { TrackMutationService } from '../../services/mutations-layer/track-mutation.service';
import { PlaylistsSelectorService } from '../../services/selector-layer/playlists-selector.service';
import type { DragState } from '../../../../core/drag-and-drop/drag.types';
import type { TPlaylistDetailViewModel } from '../../playlist-types';
import type { TPlaylistId, TPlaylistTrackId } from '@sh3pherd/shared-types';
import type { DropzoneListDropEvent } from '../../../../shared/dropzone-list-container/dropzone-list-container.component';
import { PlaylistHeaderComponent } from '../playlist-header/playlist-header.component';
import { PlaylistTrackListComponent } from '../playlist-track-list/playlist-track-list.component';

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
  imports: [IconComponent, PlaylistHeaderComponent, PlaylistTrackListComponent],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDetailComponent {
  private readonly api = inject(PlaylistsApiService);
  private readonly trackMutation = inject(TrackMutationService);
  private readonly selector = inject(PlaylistsSelectorService);
  private readonly state = inject(PlaylistsStateService);

  /** ID of the playlist to render. `null` surfaces the empty state
   *  (e.g. no playlists exist yet, or the tab was opened blank). */
  readonly playlistId = input.required<TPlaylistId | null>();

  /** Loaded detail — null while loading or when no playlist is open. */
  readonly detail = signal<TPlaylistDetailViewModel | null>(null);

  /** Loading state — shown briefly while the fetch is in flight. */
  readonly loading = signal(false);

  /** The matching summary from the state service — used for the rating
   *  aggregates + duration in the header without refetching. Falls
   *  back to the detail's own fields when the summary isn't resolved
   *  yet (stale cache race). */
  readonly summary = computed(() => {
    const id = this.playlistId();
    if (!id) return null;
    return this.selector.playlistsById().get(id) ?? null;
  });
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
  onTracklistDrop(
    event: DropzoneListDropEvent<TPlaylistDetailViewModel['tracks'][number]>,
  ): void {
    const { drag, insertIndex } = event;
    if (drag.type === 'music-track') {
      this.dispatchAdd(drag.data.referenceId, drag.data.versionId);
      return;
    }
    if (drag.type === 'playlist-track') {
      this.dispatchReorder(drag.data.playlistTrackId, insertIndex);
    }
  }

  onEmptyTracklistDrop(drag: DragState): void {
    if (drag.type !== 'music-track') return;
    this.dispatchAdd(drag.data.referenceId, drag.data.versionId);
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
