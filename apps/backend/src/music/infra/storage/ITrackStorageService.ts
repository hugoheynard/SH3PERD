import type { IStorageService } from '@sh3pherd/storage';

/** @deprecated Use IStorageService from @sh3pherd/storage directly */
export type ITrackStorageService = IStorageService;

/** Builds the S3 object key for a track file. Music-domain specific. */
export function buildTrackS3Key(
  ownerId: string,
  versionId: string,
  trackId: string,
  fileName: string,
): string {
  return `tracks/${ownerId}/${versionId}/${trackId}/${fileName}`;
}
