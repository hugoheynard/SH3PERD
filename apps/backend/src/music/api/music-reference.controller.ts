import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { MusicApiCodes } from '../codes.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { CreateMusicReferenceCommand } from '../application/commands/CreateMusicReferenceCommand.js';
import { SearchMusicReferencesQuery } from '../application/queries/SearchMusicReferencesQuery.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P, SCreateMusicReferencePayload } from '@sh3pherd/shared-types';
import type {
  TUserId,
  TApiResponse,
  TMusicReferenceDomainModel,
  TCreateMusicReferenceRequestDTO,
} from '@sh3pherd/shared-types';

/**
 * Music Reference controller — user-scoped (no contract required).
 *
 * A music reference is a canonical song entry (title + artist) shared
 * across all users. References are created once and reused — each user
 * links to them via repertoire entries.
 */
@ApiTags('music / references')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@PlatformScoped()
@Controller('references')
export class MusicReferenceController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Fuzzy search references',
    description: 'Search existing references by title/artist via Atlas Search.',
  })
  @RequirePermission(P.Music.Library.Read)
  @Get('dynamic-search')
  async searchReferences(
    @Query('q') searchValue: string,
  ): Promise<TApiResponse<TMusicReferenceDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED,
      await this.qryBus.execute<SearchMusicReferencesQuery, TMusicReferenceDomainModel[]>(
        new SearchMusicReferencesQuery(searchValue ?? ''),
      ),
    );
  }

  @ApiOperation({
    summary: 'Create a music reference',
    description:
      'Creates a new reference or returns existing if duplicate (dedup by title+artist).',
  })
  @RequirePermission(P.Music.Library.Write)
  @Post()
  async createReference(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateMusicReferencePayload))
    payload: TCreateMusicReferenceRequestDTO,
  ): Promise<TApiResponse<TMusicReferenceDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED,
      await this.cmdBus.execute<CreateMusicReferenceCommand, TMusicReferenceDomainModel>(
        new CreateMusicReferenceCommand(actorId, payload),
      ),
    );
  }
}
