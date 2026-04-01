import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { CreatePlaylistHandler } from './application/commands/CreatePlaylistHandler.js';
import { UpdatePlaylistHandler } from './application/commands/UpdatePlaylistHandler.js';
import { DeletePlaylistHandler } from './application/commands/DeletePlaylistHandler.js';
import { AddPlaylistTrackHandler } from './application/commands/AddPlaylistTrackHandler.js';
import { RemovePlaylistTrackHandler } from './application/commands/RemovePlaylistTrackHandler.js';
import { ReorderPlaylistTrackHandler } from './application/commands/ReorderPlaylistTrackHandler.js';

// Queries
import { GetUserPlaylistsHandler } from './application/queries/GetUserPlaylistsHandler.js';
import { GetPlaylistDetailHandler } from './application/queries/GetPlaylistDetailHandler.js';

const CommandHandlers = [
  CreatePlaylistHandler,
  UpdatePlaylistHandler,
  DeletePlaylistHandler,
  AddPlaylistTrackHandler,
  RemovePlaylistTrackHandler,
  ReorderPlaylistTrackHandler,
];

const QueryHandlers = [
  GetUserPlaylistsHandler,
  GetPlaylistDetailHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class PlaylistHandlersModule {}
