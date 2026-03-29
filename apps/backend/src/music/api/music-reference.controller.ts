import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { CreateMusicReferenceCommand } from '../application/commands/CreateMusicReferenceCommand.js';
import { SearchMusicReferencesQuery } from '../application/queries/SearchMusicReferencesQuery.js';
import type { TUserId, TApiResponse, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { SCreateMusicReferencePayload } from '@sh3pherd/shared-types';

@Controller('music-reference')
export class MusicReferenceController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @Get('dynamic-search')
  async searchReferences(
    @Query('q') searchValue: string,
  ): Promise<TApiResponse<TMusicReferenceDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED,
      await this.qryBus.execute(new SearchMusicReferencesQuery(searchValue ?? '')),
    );
  }

  @Post()
  async createReference(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateMusicReferencePayload)) payload: any,
  ): Promise<TApiResponse<TMusicReferenceDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED,
      await this.cmdBus.execute(new CreateMusicReferenceCommand(actorId, payload)),
    );
  }
}
