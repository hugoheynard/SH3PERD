import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { MusicApiCodes } from '../codes.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { apiRequestDTO, apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreateMusicReferenceRequestDTO, MusicReferencePayload } from '../dto/music.dto.js';
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
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_REFERENCES_SEARCHED, MusicReferencePayload))
  @RequirePermission(P.Music.Library.Read)
  @Get('dynamic-search')
  async searchReferences(
    @Query('q') searchValue: string,
  ): Promise<TApiResponse<TMusicReferenceDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCES_SEARCHED,
      await this.qryBus.execute<SearchMusicReferencesQuery, TMusicReferenceDomainModel[]>(
        new SearchMusicReferencesQuery(searchValue ?? ''),
      ),
    );
  }

  @ApiOperation({
    summary: 'Create a music reference',
    description:
      'Creates a new reference or returns the existing one if an exact (lowercased + trimmed) title+artist match exists (idempotent dedup). Rate-limited tightly (5/min/user) to enforce the expected UX: callers should GET /dynamic-search first and only POST when the search returns no match.',
  })
  @ApiBody(apiRequestDTO(CreateMusicReferenceRequestDTO))
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_REFERENCE_CREATED, MusicReferencePayload))
  @ApiResponse({
    status: 429,
    description: 'Too many creations. Call GET /dynamic-search before creating a new reference.',
  })
  @RequirePermission(P.Music.Library.Write)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
