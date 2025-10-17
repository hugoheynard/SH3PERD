import { Module } from '@nestjs/common';
import { MUSIC_LIBRARY_USE_CASES, MUSIC_LIBRARY_USE_CASES_FACTORY } from '../music.tokens.js';
import { MusicLibraryUseCasesFactory } from './library/createMusicLibraryUseCases.js';

@Module({
  imports: [],
  providers: [
    { provide: MUSIC_LIBRARY_USE_CASES_FACTORY, useClass: MusicLibraryUseCasesFactory },
    {
      provide: MUSIC_LIBRARY_USE_CASES,
      useFactory: (factory: MusicLibraryUseCasesFactory) => factory.create(),
      inject: [MUSIC_LIBRARY_USE_CASES_FACTORY],
    },

  ],
  exports: [MUSIC_LIBRARY_USE_CASES],
})
export class MusicLibraryUseCasesModule {}
