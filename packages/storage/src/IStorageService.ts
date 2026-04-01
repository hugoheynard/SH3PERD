import type { Readable } from 'stream';

/**
 * Generic S3-compatible storage service interface.
 *
 * Consumers build their own key conventions (e.g. `tracks/{owner}/{version}/{file}`).
 * This service only deals with raw keys — no domain-specific logic.
 */
export interface IStorageService {
  /** Upload a file to storage. */
  upload(key: string, body: Buffer | Readable, contentType: string): Promise<void>;

  /** Delete a file from storage. */
  delete(key: string): Promise<void>;

  /** Download a file from storage as a Buffer. */
  downloadToBuffer(key: string): Promise<Buffer>;

  /** Get a presigned download URL (default: 1 hour). */
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
