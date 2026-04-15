import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  MUSIC_REFERENCE_REPO,
  MUSIC_REPERTOIRE_REPO,
  MUSIC_VERSION_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { IMusicReferenceRepository } from '../../types/musicReferences.types.js';
import type {
  TUserId,
  TRepertoireEntryViewModel,
  TUserMusicLibraryViewModel,
  TVersionView,
  TMusicVersionDomainModel,
} from '@sh3pherd/shared-types';

export class GetUserMusicLibraryQuery {
  constructor(public readonly userId: TUserId) {}
}

@QueryHandler(GetUserMusicLibraryQuery)
export class GetUserMusicLibraryHandler implements IQueryHandler<
  GetUserMusicLibraryQuery,
  TUserMusicLibraryViewModel
> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
    @Inject(MUSIC_REFERENCE_REPO) private readonly refRepo: IMusicReferenceRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
  ) {}

  async execute(query: GetUserMusicLibraryQuery): Promise<TUserMusicLibraryViewModel> {
    // 1. Fetch the user's repertoire entries
    const entries = await this.repRepo.findByUserId(query.userId);
    if (entries.length === 0) {
      return { entries: [], totalEntries: 0, totalVersions: 0 };
    }

    // 2. Fetch references and versions in parallel
    const refIds = [...new Set(entries.map((e) => e.musicReference_id))];
    const [refs, versions] = await Promise.all([
      this.refRepo.findByIds(refIds),
      this.versionRepo.findByOwnerId(query.userId),
    ]);

    // 3. Build lookup maps
    const refMap = new Map(refs.map((r) => [r.id, r]));
    const versionsByRefId = new Map<string, typeof versions>();
    for (const v of versions) {
      const arr = versionsByRefId.get(v.musicReference_id) ?? [];
      arr.push(v);
      versionsByRefId.set(v.musicReference_id, arr);
    }

    // 4. Assemble view models
    const entryViewModels: TRepertoireEntryViewModel[] = [];
    let totalVersions = 0;

    for (const entry of entries) {
      const reference = refMap.get(entry.musicReference_id);
      if (!reference) continue; // orphaned entry — skip

      const rawVersions = versionsByRefId.get(entry.musicReference_id) ?? [];
      totalVersions += rawVersions.length;

      entryViewModels.push({
        id: entry.id,
        reference: {
          id: reference.id,
          title: reference.title,
          originalArtist: reference.artist,
        },
        versions: rawVersions.map((version) => this.toVersionView(version)),
      });
    }

    return {
      entries: entryViewModels,
      totalEntries: entryViewModels.length,
      totalVersions,
    };
  }

  private toVersionView(v: TMusicVersionDomainModel): TVersionView {
    return {
      id: v.id,
      label: v.label,
      genre: v.genre,
      type: v.type,
      bpm: v.bpm,
      pitch: v.pitch,
      notes: v.notes,
      mastery: v.mastery,
      energy: v.energy,
      effort: v.effort,
      tracks: v.tracks,
    };
  }
}
