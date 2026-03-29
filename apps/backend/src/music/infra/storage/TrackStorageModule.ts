import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3TrackStorageService } from './S3TrackStorageService.js';
import { TRACK_STORAGE_SERVICE } from './storage.tokens.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TRACK_STORAGE_SERVICE,
      useClass: S3TrackStorageService,
    },
  ],
  exports: [TRACK_STORAGE_SERVICE],
})
export class TrackStorageModule {}
