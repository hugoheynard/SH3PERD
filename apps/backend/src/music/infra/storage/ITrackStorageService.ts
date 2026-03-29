import type { Readable } from 'stream';

export interface ITrackStorageService {
  upload(key: string, body: Buffer | Readable, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

/** Builds the S3 object key for a track file. */
export function buildTrackS3Key(
  ownerId: string,
  versionId: string,
  trackId: string,
  fileName: string,
): string {
  return `tracks/${ownerId}/${versionId}/${trackId}/${fileName}`;
}
