import { Module } from '@nestjs/common';
import {
  CREATE_MUSIC_REPERTOIRE_ENTRY_USE_CASE,
  MUSIC_REPERTOIRE_USE_CASES,
  MUSIC_REPERTOIRE_USE_CASES_FACTORY,
} from '../music.tokens.js';
import { AddMusicRepertoireEntry } from './repertoire/AddMusicRepertoireEntry.js';
import { MusicRepertoireUseCaseFactory } from './repertoire/MusicRepertoireUseCasesFactory.js';

@Module({
  imports: [],
  providers: [
    { provide: MUSIC_REPERTOIRE_USE_CASES_FACTORY, useClass: MusicRepertoireUseCaseFactory },
    {
      provide: MUSIC_REPERTOIRE_USE_CASES,
      useFactory:  (factory: MusicRepertoireUseCaseFactory) => factory.create(),
      inject: [MUSIC_REPERTOIRE_USE_CASES_FACTORY],
    },
    { provide: CREATE_MUSIC_REPERTOIRE_ENTRY_USE_CASE, useClass: AddMusicRepertoireEntry },
  ],
  exports: [MUSIC_REPERTOIRE_USE_CASES],
})
export class MusicRepertoireUseCasesModule {}
