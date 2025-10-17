import { Module } from '@nestjs/common';
import { MusicLibraryUseCasesModule } from './music-library-use-cases.module.js';

@Module({
  imports: [MusicLibraryUseCasesModule]
})
export class MusicReferencesUseCasesModule {}
