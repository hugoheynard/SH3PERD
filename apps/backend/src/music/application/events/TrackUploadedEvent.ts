import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';

/**
 * Emitted after a track file has been successfully uploaded to S3/R2
 * and persisted in MongoDB. Triggers async audio analysis via the
 * audio-processor microservice.
 */
export class TrackUploadedEvent {
  constructor(
    public readonly ownerId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
    public readonly s3Key: string,
    /** Propagated to the analyze microservice call so the whole upload → analyse → save flow shares one trace id. */
    public readonly correlationId: string,
  ) {}
}
