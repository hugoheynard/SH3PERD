import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import {
  MUSIC_REFERENCE_REPO,
  MUSIC_VERSION_REPO,
  PLAYLIST_REPO,
  PLAYLIST_TRACK_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IMusicReferenceRepository } from '../../../music/types/musicReferences.types.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type { IPlaylistRepository } from '../../../playlists-v2/repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../../playlists-v2/repositories/PlaylistTrackRepository.js';
import { computeRatingSeries } from '../helpers/computeRatingSeries.js';
import type {
  TMusicReferenceDomainModel,
  TMusicReferenceId,
  TMusicVersionDomainModel,
  TMusicVersionId,
  TPlaylistDomainModel,
  TPlaylistId,
  TShowDetailViewModel,
  TShowId,
  TShowSectionItemDomainModel,
  TShowSectionItemView,
  TShowSectionViewModel,
  TUserId,
} from '@sh3pherd/shared-types';

export class GetShowDetailQuery {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
  ) {}
}

@QueryHandler(GetShowDetailQuery)
@Injectable()
export class GetShowDetailHandler implements IQueryHandler<
  GetShowDetailQuery,
  TShowDetailViewModel
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(MUSIC_REFERENCE_REPO) private readonly referenceRepo: IMusicReferenceRepository,
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly playlistTrackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(query: GetShowDetailQuery): Promise<TShowDetailViewModel> {
    const aggregate = await this.aggregateRepo.findById(query.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    if (aggregate.owner_id !== query.actorId) throw new Error('SHOW_NOT_OWNED');

    const show = aggregate.showEntity.toDomain;

    // Resolve every version that appears in any section (direct items or
    // inside one of the referenced playlists). Batch lookups keep this
    // O(sections) on round-trips regardless of how many items per section.
    const allSections = aggregate.allSections;
    const directVersionIds = collectVersionIds(allSections.flatMap((s) => [...s.items]));
    const playlistIds = collectPlaylistIds(allSections.flatMap((s) => [...s.items]));
    const playlistTracksByPlaylist = await Promise.all(
      playlistIds.map((id) => this.playlistTrackRepo.findByPlaylistId(id)),
    );
    const indirectVersionIds = new Set<TMusicVersionId>();
    for (const tracks of playlistTracksByPlaylist) {
      for (const t of tracks) indirectVersionIds.add(t.versionId);
    }
    const allVersionIds = new Set<TMusicVersionId>([...directVersionIds, ...indirectVersionIds]);

    const resolvedVersions = await Promise.all(
      Array.from(allVersionIds).map((vid) => this.versionRepo.findOneByVersionId(vid)),
    );
    const versionMap = new Map<TMusicVersionId, TMusicVersionDomainModel>(
      resolvedVersions
        .filter((v): v is TMusicVersionDomainModel => v !== null)
        .map((v) => [v.id, v]),
    );

    const referenceIds = new Set<TMusicReferenceId>();
    for (const v of versionMap.values()) referenceIds.add(v.musicReference_id);
    const references = referenceIds.size
      ? await this.referenceRepo.findByIds(Array.from(referenceIds))
      : [];
    const referenceMap = new Map<TMusicReferenceId, TMusicReferenceDomainModel>(
      references.map((r) => [r.id, r]),
    );

    const resolvedPlaylists = await Promise.all(
      playlistIds.map((pid) => this.playlistRepo.findOneById(pid)),
    );
    const playlistMap = new Map<TPlaylistId, TPlaylistDomainModel>(
      resolvedPlaylists.filter((p): p is TPlaylistDomainModel => p !== null).map((p) => [p.id, p]),
    );
    const playlistTrackCountById = new Map<TPlaylistId, number>(
      playlistIds.map((id, i) => [id, playlistTracksByPlaylist[i].length]),
    );

    // Build section view models with expanded versions for the rating
    // series. Items themselves keep their original shape (playlists not
    // expanded in the response) for the frontend to render as blocks.
    const sections: TShowSectionViewModel[] = allSections.map((section) => {
      const items: TShowSectionItemView[] = section.items.map((it) =>
        buildItemView(it, versionMap, referenceMap, playlistMap, playlistTrackCountById),
      );
      const sectionVersionIds = collectSectionVersions(
        [...section.items],
        playlistTracksByPlaylist,
        playlistIds,
      );
      const sectionVersions = sectionVersionIds
        .map((vid) => versionMap.get(vid))
        .filter((v): v is TMusicVersionDomainModel => v !== undefined);
      return {
        id: section.id,
        name: section.name,
        position: section.position,
        target: section.target,
        lastPlayedAt: section.lastPlayedAt,
        items,
        ...computeRatingSeries(sectionVersions),
      };
    });

    // Whole-show series: concat all section version lists in the order
    // they play. Favours section order over list order so the show-level
    // sparkline mirrors the performance flow.
    const showVersions = sections.flatMap((vm) => {
      const idsInOrder = collectSectionVersions(
        [...(aggregate.findSection(vm.id)?.items ?? [])],
        playlistTracksByPlaylist,
        playlistIds,
      );
      return idsInOrder
        .map((id) => versionMap.get(id))
        .filter((v): v is TMusicVersionDomainModel => v !== undefined);
    });

    return {
      id: show.id,
      name: show.name,
      description: show.description,
      color: show.color,
      createdAt: show.createdAt,
      updatedAt: show.updatedAt,
      lastPlayedAt: show.lastPlayedAt,
      sectionCount: sections.length,
      sections,
      ...computeRatingSeries(showVersions),
    };
  }
}

function collectVersionIds(items: TShowSectionItemDomainModel[]): TMusicVersionId[] {
  return items.filter((it) => it.kind === 'version').map((it) => it.ref_id as TMusicVersionId);
}

function collectPlaylistIds(items: TShowSectionItemDomainModel[]): TPlaylistId[] {
  const set = new Set<TPlaylistId>();
  for (const it of items) {
    if (it.kind === 'playlist') set.add(it.ref_id as TPlaylistId);
  }
  return Array.from(set);
}

function collectSectionVersions(
  items: TShowSectionItemDomainModel[],
  playlistTracksByPlaylist: { versionId: TMusicVersionId }[][],
  playlistIds: TPlaylistId[],
): TMusicVersionId[] {
  const byPlaylist = new Map<TPlaylistId, { versionId: TMusicVersionId }[]>();
  playlistIds.forEach((id, i) => byPlaylist.set(id, playlistTracksByPlaylist[i]));
  const result: TMusicVersionId[] = [];
  for (const item of items) {
    if (item.kind === 'version') {
      result.push(item.ref_id as TMusicVersionId);
    } else {
      const tracks = byPlaylist.get(item.ref_id as TPlaylistId) ?? [];
      for (const t of tracks) result.push(t.versionId);
    }
  }
  return result;
}

function buildItemView(
  item: TShowSectionItemDomainModel,
  versionMap: Map<TMusicVersionId, TMusicVersionDomainModel>,
  referenceMap: Map<TMusicReferenceId, TMusicReferenceDomainModel>,
  playlistMap: Map<TPlaylistId, TPlaylistDomainModel>,
  playlistTrackCount: Map<TPlaylistId, number>,
): TShowSectionItemView {
  if (item.kind === 'version') {
    const version = versionMap.get(item.ref_id as TMusicVersionId);
    const ref = version ? referenceMap.get(version.musicReference_id) : undefined;
    const favorite = version?.tracks.find((t) => t.favorite) ?? version?.tracks[0];
    return {
      kind: 'version',
      id: item.id,
      position: item.position,
      version: {
        id: (version?.id ?? item.ref_id) as TMusicVersionId,
        reference_id: (ref?.id ?? '') as TMusicReferenceId,
        label: version?.label ?? 'Unknown',
        title: ref?.title ?? 'Unknown',
        originalArtist: ref?.artist ?? 'Unknown',
        favoriteTrackId: favorite?.id,
        durationSeconds: favorite?.analysisResult?.durationSeconds ?? favorite?.durationSeconds,
      },
    };
  }
  const playlist = playlistMap.get(item.ref_id as TPlaylistId);
  return {
    kind: 'playlist',
    id: item.id,
    position: item.position,
    playlist: {
      id: (playlist?.id ?? item.ref_id) as TPlaylistId,
      name: playlist?.name ?? 'Unknown playlist',
      color: playlist?.color ?? 'indigo',
      trackCount: playlistTrackCount.get(item.ref_id as TPlaylistId) ?? 0,
    },
  };
}
