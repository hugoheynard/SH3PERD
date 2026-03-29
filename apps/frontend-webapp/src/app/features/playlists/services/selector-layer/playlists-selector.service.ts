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
  trackCount = this.trackSelector.trackCount;

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
      const version = t.versionId ? versionsById.get(t.versionId as any) : undefined;
      return {
        id: t.id,
        position: t.position,
        notes: t.notes,
        title: ref?.title ?? t.referenceId,
        originalArtist: ref?.originalArtist ?? '—',
        versionLabel: version?.label,
      };
    });
  });
}
