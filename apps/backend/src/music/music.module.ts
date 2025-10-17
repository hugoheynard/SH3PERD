import { Module } from '@nestjs/common';
import { MusicRepertoireController } from './api/musicRepertoire.controller.js';
import { MusicReferenceController } from './api/music-reference.controller.js';
import { MusicVersionsController } from './api/music-versions.controller.js';
import { MusicLibraryController } from './api/music-library.controller.js';
import { MusicRepertoireUseCasesModule } from './useCases/music-repertoire-use-cases.module.js';
import { MusicVersionUseCasesModule } from './useCases/music-version-use-cases.module.js';
import { MusicReferencesUseCasesModule } from './useCases/music-references-use-cases.module.js';
import { MusicLibraryUseCasesModule } from './useCases/music-library-use-cases.module.js';


@Module({
  imports: [
    MusicRepertoireUseCasesModule,
    MusicVersionUseCasesModule,
    MusicReferencesUseCasesModule,
    MusicLibraryUseCasesModule
  ],
  controllers: [
    MusicRepertoireController,
    MusicReferenceController,
    MusicVersionsController,
    MusicLibraryController
  ],
})
export class MusicModule {
  // This module is responsible for handling music repertoire-related functionality.
  // It currently contains the MusicRepertoireController, which will manage routes related to music repertoire.
  // Additional providers or exports can be added as needed in the future.
}
