import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3TrackStorageService } from '../../music/infra/storage/S3TrackStorageService.js';
import { CONTRACT_STORAGE_SERVICE } from '../../appBootstrap/nestTokens.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CONTRACT_STORAGE_SERVICE,
      useClass: S3TrackStorageService,
    },
  ],
  exports: [CONTRACT_STORAGE_SERVICE],
})
export class ContractStorageModule {}
