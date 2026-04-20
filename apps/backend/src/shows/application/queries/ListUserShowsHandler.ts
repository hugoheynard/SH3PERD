import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import {
  MUSIC_VERSION_REPO,
  PLAYLIST_TRACK_REPO,
  SHOW_SECTION_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type { IPlaylistTrackRepository } from '../../../playlists-v2/repositories/PlaylistTrackRepository.js';
import type { IShowSectionRepository } from '../../repositories/ShowSectionRepository.js';
import { computeRatingSeries } from '../helpers/computeRatingSeries.js';
import type {
  TMusicVersionDomainModel,
  TMusicVersionId,
  TPlaylistId,
  TShowSummaryViewModel,
  TUserId,
} from '@sh3pherd/shared-types';

export class ListUserShowsQuery {
  constructor(public readonly userId: TUserId) {}
}

@QueryHandler(ListUserShowsQuery)
@Injectable()
export class ListUserShowsHandler implements IQueryHandler<
  ListUserShowsQuery,
  TShowSummaryViewModel[]
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    @Inject(SHOW_SECTION_REPO) private readonly sectionRepo: IShowSectionRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly playlistTrackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(query: ListUserShowsQuery): Promise<TShowSummaryViewModel[]> {
    const summaries = await this.aggregateRepo.findByOwnerShowIds(query.userId);
    if (summaries.length === 0) return [];

    // For each show, pull its sections (with items embedded) and expand
    // into versions once for the rating series. Parallelised across
    // shows so a user with many shows doesn't wait on serial lookups.
    const sectionsByShow = await Promise.all(
      summaries.map((s) => this.sectionRepo.findByShowId(s.show.id)),
    );

    // Batch playlist track lookups: collect every playlist referenced
    // across every show, look them up once, then reuse the map below.
    const allPlaylistIds = new Set<TPlaylistId>();
    for (const sections of sectionsByShow) {
      for (const s of sections) {
        for (const it of s.items ?? []) {
          if (it.kind === 'playlist') allPlaylistIds.add(it.ref_id as TPlaylistId);
        }
      }
    }
    const playlistTrackEntries = await Promise.all(
      Array.from(allPlaylistIds).map(async (pid) => ({
        pid,
        tracks: await this.playlistTrackRepo.findByPlaylistId(pid),
      })),
    );
    const playlistTrackMap = new Map(playlistTrackEntries.map((e) => [e.pid, e.tracks]));

    // Same for versions — batch across all shows.
    const allVersionIds = new Set<TMusicVersionId>();
    for (const sections of sectionsByShow) {
      for (const s of sections) {
        for (const it of s.items ?? []) {
          if (it.kind === 'version') {
            allVersionIds.add(it.ref_id as TMusicVersionId);
          }
        }
      }
    }
    for (const tracks of playlistTrackMap.values()) {
      for (const t of tracks) allVersionIds.add(t.versionId);
    }
    const resolvedVersions = await Promise.all(
      Array.from(allVersionIds).map((vid) => this.versionRepo.findOneByVersionId(vid)),
    );
    const versionMap = new Map<TMusicVersionId, TMusicVersionDomainModel>(
      resolvedVersions
        .filter((v): v is TMusicVersionDomainModel => v !== null)
        .map((v) => [v.id, v]),
    );

    return summaries.map((s, i): TShowSummaryViewModel => {
      const sections = sectionsByShow[i];
      const showVersionIds = flattenShowVersionIds(sections, playlistTrackMap);
      const showVersions = showVersionIds
        .map((vid) => versionMap.get(vid))
        .filter((v): v is TMusicVersionDomainModel => v !== undefined);
      return {
        id: s.show.id,
        name: s.show.name,
        description: s.show.description,
        color: s.show.color,
        createdAt: s.show.toDomain.createdAt,
        updatedAt: s.show.toDomain.updatedAt,
        lastPlayedAt: s.show.lastPlayedAt,
        sectionCount: sections.length,
        ...computeRatingSeries(showVersions),
      };
    });
  }
}

function flattenShowVersionIds(
  sections: {
    items?: { kind: 'version' | 'playlist'; ref_id: string }[];
  }[],
  playlistTrackMap: Map<TPlaylistId, { versionId: TMusicVersionId }[]>,
): TMusicVersionId[] {
  const result: TMusicVersionId[] = [];
  for (const s of sections) {
    for (const it of s.items ?? []) {
      if (it.kind === 'version') {
        result.push(it.ref_id as TMusicVersionId);
      } else {
        const tracks = playlistTrackMap.get(it.ref_id as TPlaylistId) ?? [];
        for (const t of tracks) result.push(t.versionId);
      }
    }
  }
  return result;
}
