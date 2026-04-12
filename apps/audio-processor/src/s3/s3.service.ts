import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '@sh3pherd/storage';

/**
 * NestJS-injectable wrapper around the shared S3StorageService.
 * Exposes download + upload for audio processing pipelines.
 */
@Injectable()
export class S3Service {
  private readonly inner: S3StorageService;
  private readonly logger = new Logger(S3Service.name);

  constructor(private config: ConfigService) {
    this.inner = new S3StorageService({
      bucket: this.config.getOrThrow<string>('S3_BUCKET_NAME'),
      region: this.config.get<string>('S3_REGION', 'auto'),
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
    });
  }

  async downloadToBuffer(key: string): Promise<Buffer> {
    this.logger.log(`Downloading ${key}`);
    return this.inner.downloadToBuffer(key);
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType = 'audio/wav'): Promise<number> {
    this.logger.log(`Uploading ${key} (${buffer.byteLength} bytes)`);
    await this.inner.upload(key, buffer, contentType);
    return buffer.byteLength;
  }
}
