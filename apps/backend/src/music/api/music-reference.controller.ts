import { Body, Controller, Get, Inject, Post, Query, Req } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type {
  TCreateMusicReferenceRequestDTO,
  TMusicReferenceCreationResponseDTO,
  TMusicReferenceDomainModel,
} from '@sh3pherd/shared-types';
import { apiCodes, buildApiResponse } from '../codes.js';
import type { Request } from 'express';


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
    return this.uc.dynamicSearchMusicReferences({ artist, title});
  };


  @Post()
  async createOne(
    @Req() req: Request,
    @Body('payload') payload: TCreateMusicReferenceRequestDTO,
  ): Promise<TMusicReferenceCreationResponseDTO> {
    const result = await this.uc.createOne(req.user_id, payload);

    return buildApiResponse<TMusicReferenceDomainModel>(
      apiCodes.music.MUSIC_REFERENCE_CREATED,
      result
    );
  }
}
