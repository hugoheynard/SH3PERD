import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { ApiResponse, TMusicVersionCreationFormPayload, TMusicVersionDomainModel } from '@sh3pherd/shared-types';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import { apiCodes, buildApiResponse } from '../codes.js';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { SMusicVersionCreationFormPayloadSchema } from '@sh3pherd/shared-types';


/**
 * Controller for managing music versions.
 */
@Controller('music-versions')
export class MusicVersionsController {
  constructor(
    @Inject(USE_CASES_TOKENS.musicVersions)
    private readonly uc: TCoreUseCasesTypeMap['musicVersions'],
  ) {}

  @Post()
  async createOne(
    @Req() req: Request,
    @Body('formPayload',  new ZodValidationPipe(SMusicVersionCreationFormPayloadSchema)) formPayload: TMusicVersionCreationFormPayload
  ): Promise<ApiResponse<TMusicVersionDomainModel>> {
    console.log('calles')

    const result = await this.uc.createOne({ formPayload, asker_id: req.user_id });
    return buildApiResponse(
      apiCodes.music.MUSIC_VERSION_CREATED,
      result
    );
  };
}
