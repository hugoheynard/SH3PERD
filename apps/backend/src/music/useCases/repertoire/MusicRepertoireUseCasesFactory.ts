import type { TMusicRepertoireUseCases } from '../../types/musicRepertoire.useCases.types.js';
import { Inject, Injectable } from '@nestjs/common';
import { CREATE_MUSIC_REPERTOIRE_ENTRY_USE_CASE } from '../../music.tokens.js';


@Injectable()
export class MusicRepertoireUseCaseFactory {
  constructor(
    @Inject(CREATE_MUSIC_REPERTOIRE_ENTRY_USE_CASE) private readonly createEntry: any,
  ) {};

  create(): TMusicRepertoireUseCases {
    return {
      createEntry: (dto) => this.createEntry.execute(dto),
      getEntriesBy: (dto) => { throw new Error('Method not implemented.');  },
    }
  }
}
