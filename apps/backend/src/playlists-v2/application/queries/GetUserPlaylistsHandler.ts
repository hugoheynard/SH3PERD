import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO, PLAYLIST_TRACK_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type { TUserId, TPlaylistSummaryViewModel } from '@sh3pherd/shared-types';

export class GetUserPlaylistsQuery {
  constructor(public readonly userId: TUserId) {}
}

@QueryHandler(GetUserPlaylistsQuery)
export class GetUserPlaylistsHandler implements IQueryHandler<
  GetUserPlaylistsQuery,
  TPlaylistSummaryViewModel[]
> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(query: GetUserPlaylistsQuery): Promise<TPlaylistSummaryViewModel[]> {
    const playlists = await this.playlistRepo.findByOwnerId(query.userId);
    if (playlists.length === 0) return [];

    // Build summaries with track counts
    const summaries: TPlaylistSummaryViewModel[] = [];
    for (const p of playlists) {
      const tracks = await this.trackRepo.findByPlaylistId(p.id);
      summaries.push({
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        createdAt: p.createdAt,
        trackCount: tracks.length,
      });
    }

    return summaries;
  }
}
