import { Module } from '@nestjs/common';
import { MusicRepertoireController } from './api/musicRepertoire.controller.js';
import { UseCasesModule } from '../appBootstrap/core_modules/useCases/UseCaseModule.js';


@Module({
  imports: [UseCasesModule.for('musicRepertoire')],
  controllers: [MusicRepertoireController]
})
export class MusicRepertoireModule {
  // This module is responsible for handling music repertoire-related functionality.
  // It currently contains the MusicRepertoireController, which will manage routes related to music repertoire.
  // Additional providers or exports can be added as needed in the future.
}