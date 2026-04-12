import { Module } from '@nestjs/common';
import { MusicHandlersModule } from './music-handlers.module.js';
import { MusicRepertoireController } from './api/musicRepertoire.controller.js';
import { MusicReferenceController } from './api/music-reference.controller.js';
import { MusicVersionsController } from './api/music-versions.controller.js';
import { MusicTrackController } from './api/music-track.controller.js';
import { MusicTrackProcessingController } from './api/music-track-processing.controller.js';
import { MusicLibraryController } from './api/music-library.controller.js';
import { MusicTabConfigsController } from './api/music-tab-configs.controller.js';

@Module({
  imports: [MusicHandlersModule],
  controllers: [
    MusicReferenceController,
    MusicVersionsController,
    MusicRepertoireController,
    MusicTrackController,
    MusicTrackProcessingController,
    MusicLibraryController,
    MusicTabConfigsController,
  ],
})
export class MusicModule {}
