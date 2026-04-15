import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';

export class GetTrackDownloadUrlQuery {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
  ) {}
}

@QueryHandler(GetTrackDownloadUrlQuery)
export class GetTrackDownloadUrlHandler implements IQueryHandler<
  GetTrackDownloadUrlQuery,
  { url: string }
> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
  ) {}

  async execute(query: GetTrackDownloadUrlQuery): Promise<{ url: string }> {
    const version = await this.versionRepo.findOneByVersionId(query.versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');
    if (version.owner_id !== query.actorId) throw new Error('MUSIC_VERSION_NOT_OWNED');

    const track = version.tracks.find((t) => t.id === query.trackId);
    if (!track) throw new Error('TRACK_NOT_FOUND');

    const s3Key = buildTrackS3Key(query.actorId, query.versionId, query.trackId, track.fileName);
    const url = await this.storage.getSignedDownloadUrl(s3Key);

    return { url };
  }
}
