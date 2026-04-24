import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';

/**
 * Emitted after a mastered (or AI-mastered) track has been persisted
 * in MongoDB. Triggers async audio analysis of the output file so the
 * "after" loudness / BPM / key / quality become available without the
 * caller blocking on it.
 */
export class TrackMasteredEvent {
  constructor(
    public readonly ownerId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
    public readonly s3Key: string,
    /** Propagated from the master handler so the analysis step stays on the same trace. */
    public readonly correlationId: string,
  ) {}
}
