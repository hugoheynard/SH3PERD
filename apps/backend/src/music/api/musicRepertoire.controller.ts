import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
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
import { CreateRepertoireEntryCommand } from '../application/commands/CreateRepertoireEntryCommand.js';
import { DeleteRepertoireEntryCommand } from '../application/commands/DeleteRepertoireEntryCommand.js';
import { GetUserRepertoireQuery } from '../application/queries/GetUserRepertoireQuery.js';
import {
  CreateRepertoireEntryRequestDTO,
  RepertoireEntryDeletedPayload,
  RepertoireEntryPayload,
} from '../dto/music.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P, SCreateRepertoireEntryPayload, SRepertoireEntryId } from '@sh3pherd/shared-types';
import type {
  TUserId,
  TApiResponse,
  TMusicRepertoireEntryDomainModel,
  TRepertoireEntryId,
  TCreateRepertoireEntryPayload,
} from '@sh3pherd/shared-types';

/**
 * Repertoire controller — user-scoped (no contract required).
 */
@ApiTags('music / repertoire')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@PlatformScoped()
@Controller('repertoire')
export class MusicRepertoireController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Get my repertoire entries',
    description: 'Returns all repertoire entries owned by the authenticated user.',
  })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRIES_FETCHED, RepertoireEntryPayload, 200))
  @RequirePermission(P.Music.Library.Read)
  @Get('me')
  async getMyRepertoire(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRIES_FETCHED,
      await this.qryBus.execute<GetUserRepertoireQuery, TMusicRepertoireEntryDomainModel[]>(
        new GetUserRepertoireQuery(actorId),
      ),
    );
  }

  @ApiOperation({
    summary: 'Add song to repertoire',
    description:
      'Creates a repertoire entry linking the authenticated user to a music reference. Idempotent: reposting the same reference returns the existing entry. Rate-limited to discourage repeated probing — a well-behaved client searches its library first.',
  })
  @ApiBody(apiRequestDTO(CreateRepertoireEntryRequestDTO))
  @ApiResponse(apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRY_CREATED, RepertoireEntryPayload, 200))
  @ApiResponse({ status: 404, description: 'Music reference does not exist.' })
  @ApiResponse({ status: 429, description: 'Too many creations. Slow down.' })
  @RequirePermission(P.Music.Library.Write)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post()
  async createEntry(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateRepertoireEntryPayload))
    payload: TCreateRepertoireEntryPayload,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRY_CREATED,
      await this.cmdBus.execute<CreateRepertoireEntryCommand, TMusicRepertoireEntryDomainModel>(
        new CreateRepertoireEntryCommand(actorId, payload),
      ),
    );
  }

  @ApiOperation({
    summary: 'Remove song from repertoire',
    description:
      'Deletes the repertoire entry and cascades the cleanup: every user version for this reference is removed, the underlying audio tracks are deleted from object storage (best-effort), and the `storage_bytes` + `repertoire_entry` quota counters are credited back. Ownership is verified (403 if not owner).',
  })
  @ApiParam({ name: 'id', description: 'Repertoire entry ID (prefixed: repEntry_…)' })
  @ApiResponse(
    apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRY_DELETED, RepertoireEntryDeletedPayload, 200),
  )
  @ApiResponse({ status: 403, description: 'Actor does not own this repertoire entry.' })
  @ApiResponse({ status: 404, description: 'Repertoire entry not found.' })
  @RequirePermission(P.Music.Library.Write)
  @Delete(':id')
  async deleteEntry(
    @ActorId() actorId: TUserId,
    @Param('id', new ZodValidationPipe(SRepertoireEntryId)) entryId: TRepertoireEntryId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRY_DELETED,
      await this.cmdBus.execute<DeleteRepertoireEntryCommand, boolean>(
        new DeleteRepertoireEntryCommand(actorId, entryId),
      ),
    );
  }
}
