import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { ApiResponse, TMusicVersionCreationFormPayload, TMusicVersionDomainModel } from '@sh3pherd/shared-types';
import { apiCodes, buildApiResponse } from '../codes.js';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { SMusicVersionCreationFormPayloadSchema } from '@sh3pherd/shared-types';
import { MUSIC_VERSIONS_USE_CASES } from '../music.tokens.js';
import type { TMusicVersionsUseCases } from '../useCases/versions/createMusicVersionsUseCases.js';


/**
 * Controller for managing music versions.
 */
@Controller('music-version')
export class MusicVersionsController {
  constructor(
    @Inject(MUSIC_VERSIONS_USE_CASES) private readonly uc: TMusicVersionsUseCases,
  ) {};

  @Post()
  async createOne(
    @Req() req: Request,
    @Body('payload',
      new ZodValidationPipe(SMusicVersionCreationFormPayloadSchema))
      payload: TMusicVersionCreationFormPayload
  ): Promise<ApiResponse<TMusicVersionDomainModel>> {

    const result = await this.uc.createOne({ payload, asker_id: req.user_id });
    return buildApiResponse(
      apiCodes.music.MUSIC_VERSION_CREATED,
      result
    );
  };
}
