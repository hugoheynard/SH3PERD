import { Module } from '@nestjs/common';
import { MusicRepertoireController } from '../music/api/musicRepertoire.controller.js';
import { MusicModule } from '../music/music.module.js';
import { CoreUseCasesAccessModule } from './core_modules/useCases/CoreUseCasesAccessModule.js';
import { MusicReferenceController } from '../music/api/music-reference.controller.js';
import { MusicVersionsController } from '../music/api/music-versions.controller.js';
import { MusicLibraryController } from '../music/api/music-library.controller.js';

@Module({
  imports: [
    MusicModule, CoreUseCasesAccessModule.forMany([
      'musicReferences',
      'musicVersions',
      'musicRepertoireEntries',
      'musicLibrary',
    ])
  ],
  controllers: [MusicRepertoireController, MusicReferenceController, MusicVersionsController, MusicLibraryController],
  exports: [],
})
export class ProtectedModule {
  // This module is intended for protected routes and services.
  // It can be extended with additional controllers, providers, or imports as needed.
  // Currently, it does not contain any specific functionality.
}
