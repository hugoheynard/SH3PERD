import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import { PlaylistEntity } from '../../../playlists-v2/domain/PlaylistEntity.js';
import {
  MUSIC_VERSION_REPO,
  PLAYLIST_REPO,
  PLAYLIST_TRACK_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type { IPlaylistRepository } from '../../../playlists-v2/repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../../playlists-v2/repositories/PlaylistTrackRepository.js';
import type {
  TMusicVersionId,
  TPlaylistColor,
  TPlaylistDomainModel,
  TPlaylistId,
  TPlaylistTrackDomainModel,
  TPlaylistTrackId,
  TShowId,
  TShowSectionId,
  TUserId,
} from '@sh3pherd/shared-types';

export class ConvertSectionToPlaylistCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
    public readonly payload: { name?: string; color?: TPlaylistColor },
  ) {}
}

@CommandHandler(ConvertSectionToPlaylistCommand)
@Injectable()
export class ConvertSectionToPlaylistHandler implements ICommandHandler<
  ConvertSectionToPlaylistCommand,
  TPlaylistDomainModel
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    private readonly quota: QuotaService,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly playlistTrackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: ConvertSectionToPlaylistCommand): Promise<TPlaylistDomainModel> {
    // Counts against the playlist quota since the user creates a new
    // personal playlist. Keeps the "cost" visible on the right ledger.
    await this.quota.ensureAllowed(cmd.actorId, 'playlist');

    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    if (aggregate.owner_id !== cmd.actorId) throw new Error('SHOW_NOT_OWNED');
    const section = aggregate.findSection(cmd.sectionId);
    if (!section) throw new Error('SHOW_SECTION_NOT_FOUND');

    // Flatten: keep the section's visual order, drop playlist items into
    // the sequence in their track order.
    const expandedVersionIds: TMusicVersionId[] = [];
    for (const item of section.items) {
      if (item.kind === 'version') {
        expandedVersionIds.push(item.ref_id as TMusicVersionId);
      } else {
        const tracks = await this.playlistTrackRepo.findByPlaylistId(item.ref_id as TPlaylistId);
        for (const t of tracks) expandedVersionIds.push(t.versionId);
      }
    }

    // De-duplicate while preserving first-occurrence order, so a track
    // that appears twice (e.g. via two playlists) doesn't clutter the
    // new playlist. The show itself still plays both — this is only the
    // materialised playlist result.
    const seen = new Set<string>();
    const uniqueVersionIds = expandedVersionIds.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Resolve versions to extract reference_id (needed for playlist_tracks).
    // Drop versions the user no longer owns or that were deleted since.
    const resolvedVersions = await Promise.all(
      uniqueVersionIds.map((vid) => this.versionRepo.findOneByVersionId(vid)),
    );
    const ownedVersions = resolvedVersions.filter(
      (v): v is NonNullable<typeof v> => v !== null && v.owner_id === cmd.actorId,
    );

    // Name: prefer the caller's override, fall back to the source
    // section name suffixed. Treat whitespace-only input as "no override".
    const trimmedName = cmd.payload.name?.trim();
    const playlistName =
      trimmedName && trimmedName.length > 0 ? trimmedName : `${section.name} — playlist`;
    const playlist = new PlaylistEntity({
      owner_id: cmd.actorId,
      name: playlistName,
      color: cmd.payload.color ?? 'indigo',
      description: undefined,
      createdAt: Date.now(),
    });
    const saved = await this.playlistRepo.saveOne(playlist.toDomain);
    if (!saved) throw new Error('PLAYLIST_CREATION_FAILED');

    // Create playlist tracks in section order.
    if (ownedVersions.length > 0) {
      const trackDocs: TPlaylistTrackDomainModel[] = ownedVersions.map((v, index) => ({
        id: `plTrack_${randomUUID()}` as TPlaylistTrackId,
        playlistId: playlist.id,
        referenceId: v.musicReference_id,
        versionId: v.id,
        position: index,
      }));
      await Promise.all(trackDocs.map((doc) => this.playlistTrackRepo.saveOne(doc)));
    }

    await this.quota.recordUsage(cmd.actorId, 'playlist');
    return playlist.toDomain;
  }
}
