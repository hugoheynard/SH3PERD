import type { TApiResponse, TApiMessage } from '@sh3pherd/shared-types';

export const PlaylistApiCodes = {
  PLAYLIST_CREATED: {
    code: 'PLAYLIST_CREATED',
    message: 'Playlist created successfully',
  },
  PLAYLIST_UPDATED: {
    code: 'PLAYLIST_UPDATED',
    message: 'Playlist updated successfully',
  },
  PLAYLIST_DELETED: {
    code: 'PLAYLIST_DELETED',
    message: 'Playlist deleted successfully',
  },
  PLAYLISTS_FETCHED: {
    code: 'PLAYLISTS_FETCHED',
    message: 'User playlists fetched successfully',
  },
  PLAYLIST_DETAIL_FETCHED: {
    code: 'PLAYLIST_DETAIL_FETCHED',
    message: 'Playlist detail fetched successfully',
  },
  PLAYLIST_TRACK_ADDED: {
    code: 'PLAYLIST_TRACK_ADDED',
    message: 'Track added to playlist successfully',
  },
  PLAYLIST_TRACK_REMOVED: {
    code: 'PLAYLIST_TRACK_REMOVED',
    message: 'Track removed from playlist successfully',
  },
  PLAYLIST_TRACK_REORDERED: {
    code: 'PLAYLIST_TRACK_REORDERED',
    message: 'Playlist track reordered successfully',
  },
} as const satisfies Record<string, TApiMessage>;


export function buildPlaylistApiResponse<TResponsePayload>(
  entry: TApiMessage,
  data: TResponsePayload,
): TApiResponse<TResponsePayload> {
  return {
    code: entry.code,
    message: entry.message,
    data,
  };
}
