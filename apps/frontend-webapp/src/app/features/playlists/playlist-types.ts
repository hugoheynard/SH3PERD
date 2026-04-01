// Re-export shared types for convenience within the playlists feature
export type {
  TPlaylistDomainModel as Playlist,
  TPlaylistTrackDomainModel as PlaylistTrack,
  TPlaylistColor as PlaylistColor,
  TPlaylistTrackView as PlaylistTrackView,
  TPlaylistSummaryViewModel,
  TPlaylistDetailViewModel,
  TCreatePlaylistPayload,
  TUpdatePlaylistPayload,
  TAddPlaylistTrackPayload,
  TReorderPlaylistTrackPayload,
} from '@sh3pherd/shared-types';

export { PlaylistColors as PLAYLIST_COLORS } from '@sh3pherd/shared-types';

/** Frontend-only state shape. */
export interface PlaylistsState {
  playlists: import('@sh3pherd/shared-types').TPlaylistSummaryViewModel[];
  tracks: import('@sh3pherd/shared-types').TPlaylistTrackDomainModel[];
  selectedPlaylistId: string | null;
}
