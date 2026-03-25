import { computed, inject, Injectable } from '@angular/core';
import { PlaylistsStateService } from '../playlists-state.service';
import type { PlaylistTrack } from '../../playlist-types';

@Injectable({ providedIn: 'root' })
export class TrackSelectorService {

  private state = inject(PlaylistsStateService);

  /** All tracks across all playlists. */
  tracks = computed(() => this.state.playlists().tracks);

  /** Map of playlistId → PlaylistTrack[], sorted ascending by position. */
  tracksByPlaylistId = computed(() => {
    const map = new Map<string, PlaylistTrack[]>();
    for (const track of this.tracks()) {
      const arr = map.get(track.playlistId) ?? [];
      arr.push(track);
      map.set(track.playlistId, arr);
    }
    // Sort each bucket by position
    for (const [key, arr] of map.entries()) {
      map.set(key, [...arr].sort((a, b) => a.position - b.position));
    }
    return map;
  });

  /** Map of playlistId → track count. */
  trackCount = computed(() => {
    const map = new Map<string, number>();
    for (const [id, tracks] of this.tracksByPlaylistId().entries()) {
      map.set(id, tracks.length);
    }
    return map;
  });
}
