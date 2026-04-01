import { computed, inject, Injectable } from '@angular/core';
import { PlaylistSelectorService } from './playlist-selector.service';
import { TrackSelectorService } from './track-selector.service';
import { MusicLibraryStateService } from '../../../../features/musicLibrary/services/music-library-state.service';
import type { PlaylistTrackView } from '../../playlist-types';

/**
 * Facade selector service for the Playlists feature.
 *
 * Injects all sub-selectors and re-exposes their signals as a unified API.
 * Components should inject this service rather than individual selectors.
 *
 * Also computes aggregated stats across all playlists.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistsSelectorService {

  private playlistSelector = inject(PlaylistSelectorService);
  private trackSelector = inject(TrackSelectorService);
  private musicLibrary = inject(MusicLibraryStateService);

  /* ─── Playlists ───────────────────────────────────────── */

  playlists = this.playlistSelector.playlists;
  playlistsById = this.playlistSelector.playlistsById;
  selectedPlaylistId = this.playlistSelector.selectedPlaylistId;
  selectedPlaylist = this.playlistSelector.selectedPlaylist;

  /* ─── Tracks ─────────────────────────────────────────── */

  tracks = this.trackSelector.tracks;
  tracksByPlaylistId = this.trackSelector.tracksByPlaylistId;

  /**
   * Track count per playlist.
   * Uses the summary's trackCount from the backend; falls back to local track count.
   */
  trackCount = computed(() => {
    const map = new Map<string, number>();
    for (const pl of this.playlists()) {
      map.set(pl.id, pl.trackCount);
    }
    return map;
  });

  /* ─── Stats ──────────────────────────────────────────── */

  /** Total number of playlists. */
  totalPlaylists = computed(() => this.playlists().length);

  /**
   * Tracks for the currently selected playlist, sorted by position.
   * Returns an empty array if no playlist is selected.
   */
  selectedPlaylistTracks = computed(() => {
    const id = this.selectedPlaylistId();
    if (!id) {
      return [];
    }
    return this.tracksByPlaylistId().get(id) ?? [];
  });

  /**
   * Resolved view-model for the selected playlist tracks.
   * Joins each track against MusicReference and MusicVersion for display.
   */
  resolvedSelectedTracks = computed((): PlaylistTrackView[] => {
    const tracks = this.selectedPlaylistTracks();
    const entries = this.musicLibrary.library().entries;

    // Build lookup maps from the entry-centric state
    const refsById = new Map(entries.map(e => [e.reference.id, e.reference]));
    const versionsById = new Map(
      entries.flatMap(e => e.versions.map(v => [v.id, v] as const)),
    );

    return tracks.map(t => {
      const ref = refsById.get(t.referenceId as any);
      const version = versionsById.get(t.versionId as any);
      return {
        id: t.id,
        position: t.position,
        notes: t.notes,
        referenceId: t.referenceId,
        versionId: t.versionId,
        title: ref?.title ?? (t.referenceId as string),
        originalArtist: ref?.originalArtist ?? '—',
        versionLabel: version?.label ?? '',
      };
    });
  });
}
