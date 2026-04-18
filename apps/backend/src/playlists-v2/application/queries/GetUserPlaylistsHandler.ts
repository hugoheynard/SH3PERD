import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PLAYLIST_REPO,
  PLAYLIST_TRACK_REPO,
  MUSIC_VERSION_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type {
  TUserId,
  TPlaylistSummaryViewModel,
  TMusicVersionDomainModel,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

export class GetUserPlaylistsQuery {
  constructor(public readonly userId: TUserId) {}
}

/**
 * Compute the arithmetic mean of the numbers in the array, or `null` when
 * the array is empty. Callers use `null` to represent "no data" rather
 * than 0, so consumers can render a dash instead of a misleading zero.
 */
function meanOrNull(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Pick the track that the user marked as the playlist-facing take for
 * this version. Falls back to the first track when no favorite flag is
 * set (legacy / still-uploading state).
 */
function pickFavoriteTrack(tracks: TVersionTrackDomainModel[]): TVersionTrackDomainModel | null {
  if (tracks.length === 0) return null;
  return tracks.find((t) => t.favorite) ?? tracks[0] ?? null;
}

/** Duration lookup: prefer the analysis snapshot (authoritative), fall
 *  back to the self-reported field, then 0. */
function resolveTrackDuration(track: TVersionTrackDomainModel): number {
  return track.analysisResult?.durationSeconds ?? track.durationSeconds ?? 0;
}

@QueryHandler(GetUserPlaylistsQuery)
export class GetUserPlaylistsHandler implements IQueryHandler<
  GetUserPlaylistsQuery,
  TPlaylistSummaryViewModel[]
> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
  ) {}

  async execute(query: GetUserPlaylistsQuery): Promise<TPlaylistSummaryViewModel[]> {
    const playlists = await this.playlistRepo.findByOwnerId(query.userId);
    if (playlists.length === 0) return [];

    // Resolve every version referenced by any of the user's playlists in
    // one pass so the per-playlist loop below stays O(n) on track count.
    const allTracksPerPlaylist = await Promise.all(
      playlists.map((p) => this.trackRepo.findByPlaylistId(p.id)),
    );

    const allVersionIds = new Set(allTracksPerPlaylist.flat().map((t) => t.versionId));
    const resolvedVersions = await Promise.all(
      Array.from(allVersionIds).map((vid) => this.versionRepo.findOneByVersionId(vid)),
    );
    const versionMap = new Map<string, TMusicVersionDomainModel>(
      resolvedVersions
        .filter((v): v is TMusicVersionDomainModel => v !== null)
        .map((v) => [v.id, v]),
    );

    return playlists.map((p, i) => {
      const tracks = allTracksPerPlaylist[i];

      const mastery: number[] = [];
      const energy: number[] = [];
      const effort: number[] = [];
      const quality: number[] = [];
      let totalDurationSeconds = 0;

      for (const t of tracks) {
        const version = versionMap.get(t.versionId);
        if (!version) continue;

        mastery.push(version.mastery);
        energy.push(version.energy);
        effort.push(version.effort);

        const favorite = pickFavoriteTrack(version.tracks);
        if (!favorite) continue;

        totalDurationSeconds += resolveTrackDuration(favorite);

        if (favorite.analysisResult) {
          quality.push(favorite.analysisResult.quality);
        }
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        createdAt: p.createdAt,
        trackCount: tracks.length,
        totalDurationSeconds,
        meanMastery: meanOrNull(mastery),
        meanEnergy: meanOrNull(energy),
        meanEffort: meanOrNull(effort),
        meanQuality: meanOrNull(quality),
      };
    });
  }
}
