import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
import type { ITrackStorageService } from './ITrackStorageService.js';

@Injectable()
export class S3TrackStorageService implements ITrackStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const bucket = this.config.get<string>('S3_BUCKET_NAME');

    if (!bucket) {
      console.warn('[TrackStorage] S3_BUCKET_NAME not set — file operations will be no-ops');
      this.bucket = '';
      this.client = null as any;
      this.enabled = false;
      return;
    }

    this.bucket = bucket;
    this.enabled = true;
    this.client = new S3Client({
      region: this.config.get<string>('S3_REGION', 'us-east-1'),
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      forcePathStyle: true, // Required for MinIO
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async upload(key: string, body: Buffer | Readable, contentType: string): Promise<void> {
    if (!this.enabled) { console.warn('[TrackStorage] upload skipped (S3 not configured)'); return; }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    if (!this.enabled) return;
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (!this.enabled) return `[no-s3]/${key}`;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client as any, command as any, { expiresIn: expiresInSeconds });
  }
}
