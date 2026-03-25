export type Playlist = {
  id: string;
  name: string;
  description?: string;
  color: PlaylistColor;
  createdAt: string;
};

export const PLAYLIST_COLORS = ['indigo', 'emerald', 'rose', 'amber', 'sky', 'violet'] as const;
export type PlaylistColor = typeof PLAYLIST_COLORS[number];

export type PlaylistTrack = {
  id: string;
  playlistId: string;
  referenceId: string;   // links to MusicReference in music library
  versionId?: string;    // optional: links to MusicVersion
  position: number;      // 1-based sort order
  notes?: string;
};

/** A track resolved with its reference title/artist and optional version label — display-only. */
export type PlaylistTrackView = {
  id: string;
  position: number;
  notes?: string;
  title: string;
  originalArtist: string;
  versionLabel?: string;
};

export interface PlaylistsState {
  playlists: Playlist[];
  tracks: PlaylistTrack[];
  selectedPlaylistId: string | null;
}
