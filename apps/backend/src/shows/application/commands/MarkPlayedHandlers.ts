import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import { MUSIC_VERSION_REPO, PLAYLIST_TRACK_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type { IPlaylistTrackRepository } from '../../../playlists-v2/repositories/PlaylistTrackRepository.js';
import type {
  TMusicVersionId,
  TPlaylistId,
  TShowDomainModel,
  TShowId,
  TShowSectionId,
  TShowSectionItemDomainModel,
  TUserId,
} from '@sh3pherd/shared-types';

/**
 * Expand a section's items into version IDs — playlists are flattened
 * in order, versions pass through as-is. Used by the mark-played flow
 * to materialise a `track_played` event per individual track that will
 * actually be performed.
 */
async function expandItemsToVersions(
  items: readonly TShowSectionItemDomainModel[],
  playlistTrackRepo: IPlaylistTrackRepository,
): Promise<TMusicVersionId[]> {
  const versionIds: TMusicVersionId[] = [];
  for (const item of items) {
    if (item.kind === 'version') {
      versionIds.push(item.ref_id as TMusicVersionId);
    } else {
      const tracks = await playlistTrackRepo.findByPlaylistId(item.ref_id as TPlaylistId);
      for (const t of tracks) versionIds.push(t.versionId);
    }
  }
  return versionIds;
}

// Keeps the emit shape centralised so analytics consumers see a single
// canonical metadata schema regardless of which handler dispatched the
// event.
async function emitTrackPlayed(
  analytics: AnalyticsEventService,
  userId: TUserId,
  versionIds: readonly TMusicVersionId[],
  source: 'show' | 'section',
  sourceIds: { showId: TShowId; sectionId?: TShowSectionId },
  playedAt: number,
  versionRepo: IMusicVersionRepository,
): Promise<void> {
  if (versionIds.length === 0) return;
  // Resolve versions in one pass to pick up duration for each played
  // track. Missing versions (e.g. a track deleted between planning and
  // playback) are skipped, not failed — we care about the show flow.
  const versions = await Promise.all(versionIds.map((vid) => versionRepo.findOneByVersionId(vid)));
  for (let i = 0; i < versionIds.length; i++) {
    const version = versions[i];
    if (!version) continue;
    const favorite = version.tracks.find((t) => t.favorite) ?? version.tracks[0];
    await analytics.track('track_played', userId, {
      version_id: version.id,
      track_id: favorite?.id,
      source,
      source_show_id: sourceIds.showId,
      source_section_id: sourceIds.sectionId,
      duration_seconds_estimate:
        favorite?.analysisResult?.durationSeconds ?? favorite?.durationSeconds ?? 0,
      played_at: playedAt,
    });
  }
}

// ── Mark whole show played ──────────────────────────────

export class MarkShowPlayedCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly playedAt?: number,
  ) {}
}

@CommandHandler(MarkShowPlayedCommand)
@Injectable()
export class MarkShowPlayedHandler implements ICommandHandler<
  MarkShowPlayedCommand,
  TShowDomainModel
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    private readonly analytics: AnalyticsEventService,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly playlistTrackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: MarkShowPlayedCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    const playedAt = cmd.playedAt ?? Date.now();
    aggregate.markShowPlayed(cmd.actorId, playedAt);
    await this.aggregateRepo.save(aggregate);

    // Expand every section's items then fire a single batch of
    // `track_played` events. Fire-and-forget pattern — the analytics
    // store swallows insertion errors so a logging blip doesn't block
    // the artist's UX after the performance.
    for (const section of aggregate.allSections) {
      const versionIds = await expandItemsToVersions(section.items, this.playlistTrackRepo);
      await emitTrackPlayed(
        this.analytics,
        cmd.actorId,
        versionIds,
        'show',
        { showId: cmd.showId, sectionId: section.id },
        playedAt,
        this.versionRepo,
      );
    }
    return aggregate.showEntity.toDomain;
  }
}

// ── Mark a single section played ────────────────────────

export class MarkSectionPlayedCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
    public readonly playedAt?: number,
  ) {}
}

@CommandHandler(MarkSectionPlayedCommand)
@Injectable()
export class MarkSectionPlayedHandler implements ICommandHandler<
  MarkSectionPlayedCommand,
  TShowDomainModel
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    private readonly analytics: AnalyticsEventService,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly playlistTrackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: MarkSectionPlayedCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    const playedAt = cmd.playedAt ?? Date.now();
    aggregate.markSectionPlayed(cmd.actorId, cmd.sectionId, playedAt);
    await this.aggregateRepo.save(aggregate);

    const section = aggregate.findSection(cmd.sectionId);
    if (section) {
      const versionIds = await expandItemsToVersions(section.items, this.playlistTrackRepo);
      await emitTrackPlayed(
        this.analytics,
        cmd.actorId,
        versionIds,
        'section',
        { showId: cmd.showId, sectionId: cmd.sectionId },
        playedAt,
        this.versionRepo,
      );
    }
    return aggregate.showEntity.toDomain;
  }
}
