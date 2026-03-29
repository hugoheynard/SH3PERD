import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TrackStorageModule } from './infra/storage/TrackStorageModule.js';

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

// Queries
import { SearchMusicReferencesHandler } from './application/queries/SearchMusicReferencesQuery.js';
import { GetUserRepertoireHandler } from './application/queries/GetUserRepertoireQuery.js';
import { GetUserMusicLibraryHandler } from './application/queries/GetUserMusicLibraryQuery.js';
import { GetTrackDownloadUrlHandler } from './application/queries/GetTrackDownloadUrlQuery.js';

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
];

const QueryHandlers = [
  SearchMusicReferencesHandler,
  GetUserRepertoireHandler,
  GetUserMusicLibraryHandler,
  GetTrackDownloadUrlHandler,
];

@Module({
  imports: [CqrsModule, TrackStorageModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class MusicHandlersModule {}
