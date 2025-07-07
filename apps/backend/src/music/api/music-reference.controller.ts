import { Controller, Get, Inject, Query } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';


@Controller('music-reference')
export class MusicReferenceController {
  constructor(
    @Inject(USE_CASES_TOKENS.musicReferences)
    private readonly uc: TCoreUseCasesTypeMap['musicReferences'],
  ) {};

  /**
   * Search music references by a query string.
   * used for dynamic search of music references to map with versions
   * or used in search bar
   */
  @Get('dynamic-search')
  async fuzzySearch(
    @Query('title') title: string,
    @Query('artist') artist: string,
  ): Promise<TMusicReferenceDomainModel[]> {

    if (!title && !artist) {
      return [];
    }

    return this.uc.dynamicSearchMusicReferences({ artist, title});
  };
}
