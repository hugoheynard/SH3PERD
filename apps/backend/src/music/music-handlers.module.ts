import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TrackStorageModule } from './infra/storage/TrackStorageModule.js';
import { QuotaModule } from '../quota/quota.module.js';
import {
  REPERTOIRE_ENTRY_AGGREGATE_REPO,
  MUSIC_VERSION_REPO,
  MUSIC_REPERTOIRE_REPO,
  MUSIC_REFERENCE_REPO,
} from '../appBootstrap/nestTokens.js';
import { RepertoireEntryAggregateRepository } from './repositories/RepertoireEntryAggregateRepository.js';
import type { IMusicVersionRepository } from './repositories/MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from './repositories/MusicRepertoireRepository.js';
import type { IMusicReferenceRepository } from './types/musicReferences.types.js';

// Commands
import { CreateMusicReferenceHandler } from './application/commands/CreateMusicReferenceCommand.js';
import { CreateMusicVersionHandler } from './application/commands/CreateMusicVersionCommand.js';
import { UpdateMusicVersionHandler } from './application/commands/UpdateMusicVersionCommand.js';
import { DeleteMusicVersionHandler } from './application/commands/DeleteMusicVersionCommand.js';
import { CreateRepertoireEntryHandler } from './application/commands/CreateRepertoireEntryCommand.js';
import { DeleteRepertoireEntryHandler } from './application/commands/DeleteRepertoireEntryCommand.js';
import { UploadTrackHandler } from './application/commands/UploadTrackCommand.js';
import { DeleteTrackHandler } from './application/commands/DeleteTrackCommand.js';
import { SetTrackFavoriteHandler } from './application/commands/SetTrackFavoriteCommand.js';
import { MasterTrackHandler } from './application/commands/MasterTrackCommand.js';
import { AiMasterTrackHandler } from './application/commands/AiMasterTrackCommand.js';
import { PitchShiftVersionHandler } from './application/commands/PitchShiftVersionCommand.js';
import { SaveMusicTabConfigsHandler } from './application/commands/SaveMusicTabConfigsCommand.js';
import { DeleteMusicTabConfigsHandler } from './application/commands/DeleteMusicTabConfigsCommand.js';

// Events
import { TrackUploadedHandler } from './application/events/TrackUploadedHandler.js';

// Queries
import { SearchMusicReferencesHandler } from './application/queries/SearchMusicReferencesQuery.js';
import { GetUserRepertoireHandler } from './application/queries/GetUserRepertoireQuery.js';
import { GetUserMusicLibraryHandler } from './application/queries/GetUserMusicLibraryQuery.js';
import { GetTrackDownloadUrlHandler } from './application/queries/GetTrackDownloadUrlQuery.js';
import { GetMusicTabConfigsHandler } from './application/queries/GetMusicTabConfigsQuery.js';
import { GetCompanyCrossLibraryHandler } from './application/queries/GetCompanyCrossLibraryQuery.js';

const CommandHandlers = [
  CreateMusicReferenceHandler,
  CreateMusicVersionHandler,
  UpdateMusicVersionHandler,
  DeleteMusicVersionHandler,
  CreateRepertoireEntryHandler,
  DeleteRepertoireEntryHandler,
  UploadTrackHandler,
  DeleteTrackHandler,
  SetTrackFavoriteHandler,
  MasterTrackHandler,
  AiMasterTrackHandler,
  PitchShiftVersionHandler,
  SaveMusicTabConfigsHandler,
  DeleteMusicTabConfigsHandler,
];

const QueryHandlers = [
  SearchMusicReferencesHandler,
  GetUserRepertoireHandler,
  GetUserMusicLibraryHandler,
  GetTrackDownloadUrlHandler,
  GetMusicTabConfigsHandler,
  GetCompanyCrossLibraryHandler,
];

const EventHandlers = [
  TrackUploadedHandler,
];

@Module({
  imports: [
    CqrsModule,
    TrackStorageModule,
    QuotaModule,
    ClientsModule.register([{
      name: 'AUDIO_PROCESSOR',
      transport: Transport.TCP,
      options: { host: 'localhost', port: 3001 },
    }]),
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: REPERTOIRE_ENTRY_AGGREGATE_REPO,
      useFactory: (
        versionRepo: IMusicVersionRepository,
        repertoireRepo: IMusicRepertoireRepository,
        referenceRepo: IMusicReferenceRepository,
      ) => new RepertoireEntryAggregateRepository(versionRepo, repertoireRepo, referenceRepo),
      inject: [MUSIC_VERSION_REPO, MUSIC_REPERTOIRE_REPO, MUSIC_REFERENCE_REPO],
    },
  ],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class MusicHandlersModule {}
