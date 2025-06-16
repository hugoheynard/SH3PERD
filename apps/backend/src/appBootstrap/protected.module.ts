import { Module } from '@nestjs/common';
import { MusicRepertoireController } from '../music/api/musicRepertoire.controller.js';
import { MusicRepertoireModule } from '../music/musicRepertoire.module.js';
import { CoreUseCasesAccessModule } from './core_modules/useCases/CoreUseCasesAccessModule.js';


@Module({
  imports: [
    MusicRepertoireModule,
    CoreUseCasesAccessModule.forMany(['musicRepertoire']),
  ],
  controllers: [MusicRepertoireController],
  exports: []
})
export class ProtectedModule {
  // This module is intended for protected routes and services.
  // It can be extended with additional controllers, providers, or imports as needed.
  // Currently, it does not contain any specific functionality.
}