import { Module } from '@nestjs/common';
import { MusicHandlersModule } from './music-handlers.module.js';
import { MusicRepertoireController } from './api/musicRepertoire.controller.js';
import { MusicReferenceController } from './api/music-reference.controller.js';
import { MusicVersionsController } from './api/music-versions.controller.js';
import { MusicTrackController } from './api/music-track.controller.js';
import { MusicLibraryController } from './api/music-library.controller.js';

@Module({
  imports: [MusicHandlersModule],
  controllers: [
    MusicReferenceController,
    MusicVersionsController,
    MusicRepertoireController,
    MusicTrackController,
    MusicLibraryController,
  ],
})
export class MusicModule {}
