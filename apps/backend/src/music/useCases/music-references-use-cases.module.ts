import { Module } from '@nestjs/common';
import { MUSIC_REFERENCES_USE_CASES, MUSIC_REFERENCES_USE_CASES_FACTORY } from '../music.tokens.js';
import { MusicReferencesUseCasesFactory } from './references/createMusicReferencesUseCases.js';

@Module({
  providers: [
    { provide: MUSIC_REFERENCES_USE_CASES_FACTORY, useClass: MusicReferencesUseCasesFactory },
    {
      provide: MUSIC_REFERENCES_USE_CASES,
      useFactory: (factory: MusicReferencesUseCasesFactory) => factory.create(),
      inject: [MUSIC_REFERENCES_USE_CASES_FACTORY],
    },
  ],
  exports: [MUSIC_REFERENCES_USE_CASES],
})
export class MusicReferencesUseCasesModule {}
