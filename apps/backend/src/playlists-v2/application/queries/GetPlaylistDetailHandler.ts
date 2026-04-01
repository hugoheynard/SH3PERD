import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PLAYLIST_REPO,
  PLAYLIST_TRACK_REPO,
  MUSIC_REFERENCE_REPO,
  MUSIC_VERSION_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type { IMusicReferenceRepository } from '../../../music/types/musicReferences.types.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type { TUserId, TPlaylistId, TPlaylistDetailViewModel, TPlaylistTrackView } from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';

export class GetPlaylistDetailQuery {
  constructor(
    public readonly actorId: TUserId,
    public readonly playlistId: TPlaylistId,
  ) {}
}

@QueryHandler(GetPlaylistDetailQuery)
export class GetPlaylistDetailHandler implements IQueryHandler<GetPlaylistDetailQuery, TPlaylistDetailViewModel> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
    @Inject(MUSIC_REFERENCE_REPO) private readonly refRepo: IMusicReferenceRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
  ) {}

  async execute(query: GetPlaylistDetailQuery): Promise<TPlaylistDetailViewModel> {
    const existing = await this.playlistRepo.findOneById(query.playlistId);
    if (!existing) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist = new PlaylistEntity(existing);
    playlist.ensureOwnedBy(query.actorId);

    // Fetch tracks sorted by position
    const tracks = await this.trackRepo.findByPlaylistId(query.playlistId);

    // Resolve references and versions
    const refIds = [...new Set(tracks.map(t => t.referenceId))];
    const versionIds = [...new Set(tracks.map(t => t.versionId))];

    const [refs, versions] = await Promise.all([
      refIds.length > 0 ? this.refRepo.findByIds(refIds) : Promise.resolve([]),
      Promise.all(versionIds.map(vid => this.versionRepo.findOneByVersionId(vid))),
    ]);

    const refMap = new Map(refs.map(r => [r.id, r]));
    const versionMap = new Map(
      versions.filter((v): v is NonNullable<typeof v> => v !== null).map(v => [v.id, v]),
    );

    // Build track views
    const trackViews: TPlaylistTrackView[] = tracks.map(t => {
      const ref = refMap.get(t.referenceId);
      const version = versionMap.get(t.versionId);
      return {
        id: t.id,
        position: t.position,
        notes: t.notes,
        referenceId: t.referenceId,
        versionId: t.versionId,
        title: ref?.title ?? 'Unknown',
        originalArtist: ref?.artist ?? 'Unknown',
        versionLabel: version?.label ?? 'Unknown',
      };
    });

    return {
      id: existing.id,
      name: existing.name,
      description: existing.description,
      color: existing.color,
      createdAt: existing.createdAt,
      tracks: trackViews,
    };
  }
}
