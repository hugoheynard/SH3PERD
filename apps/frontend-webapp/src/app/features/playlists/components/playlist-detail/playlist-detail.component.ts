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
import { TrackMutationService } from '../../services/mutations-layer/track-mutation.service';
import { PlaylistsSelectorService } from '../../services/selector-layer/playlists-selector.service';
import { formatDuration } from '../../../../shared/utils/duration.utils';
import {
  ratingLevel,
  RATING_DOTS,
} from '../../../../shared/utils/rating.utils';
import { DndDropZoneDirective } from '../../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../../core/drag-and-drop/drag.types';
import type { TPlaylistDetailViewModel } from '../../playlist-types';
import type { TPlaylistId } from '@sh3pherd/shared-types';

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
  imports: [IconComponent, DndDropZoneDirective],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDetailComponent {
  private readonly api = inject(PlaylistsApiService);
  private readonly trackMutation = inject(TrackMutationService);
  private readonly selector = inject(PlaylistsSelectorService);

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

  /** Optimistic remove via TrackMutationService. The summary's
   *  trackCount decrements immediately; the effect above re-fetches
   *  the detail if the user returns to this view later. */
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
   * Drop handler for `music-track` payloads from the music library.
   * Dispatches an `AddPlaylistTrack` command via TrackMutationService
   * (which already owns optimistic add + rollback on error), and
   * re-fetches the detail so the new row renders with its resolved
   * title / artist / version label. Ignores drops while no playlist
   * is open.
   */
  onMusicDrop(drag: DragState): void {
    if (drag.type !== 'music-track') return;
    const pl = this.detail();
    if (!pl) return;
    this.trackMutation.addTrack(
      pl.id,
      drag.data.referenceId,
      drag.data.versionId,
    );
    // Refresh the resolved tracklist so the dropped track shows up
    // immediately with its joined title / artist / version label.
    this.api.getPlaylistDetail(pl.id).subscribe({
      next: (vm) => this.detail.set(vm),
    });
  }
}
