import { Module } from '@nestjs/common';
import { MusicVersionsUseCasesFactory } from './versions/createMusicVersionsUseCases.js';
import {
  MUSIC_VERSIONS_USE_CASES,
  MUSIC_VERSIONS_USE_CASES_FACTORY,
} from '../music.tokens.js';

@Module({
  providers: [
    { provide: MUSIC_VERSIONS_USE_CASES_FACTORY, useClass: MusicVersionsUseCasesFactory },
    {
      provide: MUSIC_VERSIONS_USE_CASES,
      useFactory: (factory: MusicVersionsUseCasesFactory) => factory.create(),
      inject: [MUSIC_VERSIONS_USE_CASES_FACTORY],
    }
  ],
  exports: [MUSIC_VERSIONS_USE_CASES],
})
export class MusicVersionUseCasesModule {}
