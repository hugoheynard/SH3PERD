import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '@sh3pherd/storage';
import type { IStorageService } from '@sh3pherd/storage';
import type { Readable } from 'stream';

/**
 * NestJS-injectable wrapper around the shared S3StorageService.
 * Reads config from environment via ConfigService.
 *
 * When S3_BUCKET_NAME is not set, all operations are no-ops (dev mode).
 */
@Injectable()
export class S3TrackStorageService implements IStorageService {
  private readonly inner: S3StorageService | null;

  constructor(private readonly config: ConfigService) {
    const bucket = this.config.get<string>('S3_BUCKET_NAME');

    if (!bucket) {
      console.warn('[Storage] S3_BUCKET_NAME not set — file operations will be no-ops');
      this.inner = null;
      return;
    }

    this.inner = new S3StorageService({
      bucket,
      region: this.config.get<string>('S3_REGION', 'auto'),
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID', ''),
      secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY', ''),
    });
  }

  async upload(key: string, body: Buffer | Readable, contentType: string): Promise<void> {
    if (!this.inner) return;
    return this.inner.upload(key, body, contentType);
  }

  async delete(key: string): Promise<void> {
    if (!this.inner) return;
    return this.inner.delete(key);
  }

  async downloadToBuffer(key: string): Promise<Buffer> {
    if (!this.inner) throw new Error('S3 not configured');
    return this.inner.downloadToBuffer(key);
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (!this.inner) return `[no-s3]/${key}`;
    return this.inner.getSignedDownloadUrl(key, expiresInSeconds);
  }
}
