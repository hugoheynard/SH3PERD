import { Module } from '@nestjs/common';
import { PlaylistHandlersModule } from './playlist-handlers.module.js';
import { PlaylistController } from './api/playlist.controller.js';
import { PlaylistTracksController } from './api/playlist-tracks.controller.js';

@Module({
  imports: [PlaylistHandlersModule],
  controllers: [
    PlaylistController,
    PlaylistTracksController,
  ],
})
export class PlaylistModule {}
