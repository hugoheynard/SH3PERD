import { Module } from '@nestjs/common';
import { MusicVersionUseCasesModule } from './music-version-use-cases.module.js';
import { CREATE_MUSIC_REPERTOIRE_ENTRY_USE_CASE } from '../music.tokens.js';
import { AddMusicRepertoireEntry } from './repertoire/AddMusicRepertoireEntry.js';
import { MusicReferencesUseCasesModule } from './music-references-use-cases.module.js';

@Module({
  imports: [MusicVersionUseCasesModule, MusicReferencesUseCasesModule],
  providers: [
    { provide: CREATE_MUSIC_REPERTOIRE_ENTRY_USE_CASE, useClass: AddMusicRepertoireEntry },
  ],
  exports: [],
})
export class MusicRepertoireUseCasesModule {}
