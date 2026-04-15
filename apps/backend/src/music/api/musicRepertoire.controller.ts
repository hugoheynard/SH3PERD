import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { MusicApiCodes } from '../codes.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreateRepertoireEntryCommand } from '../application/commands/CreateRepertoireEntryCommand.js';
import { DeleteRepertoireEntryCommand } from '../application/commands/DeleteRepertoireEntryCommand.js';
import { GetUserRepertoireQuery } from '../application/queries/GetUserRepertoireQuery.js';
import { RepertoireEntryPayload } from '../dto/music.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P, SCreateRepertoireEntryPayload } from '@sh3pherd/shared-types';
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
    description: 'Creates a repertoire entry linking the user to a music reference.',
  })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRY_CREATED, RepertoireEntryPayload, 200))
  @RequirePermission(P.Music.Library.Write)
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
    description: 'Deletes a repertoire entry. Ownership is verified.',
  })
  @ApiParam({ name: 'id', description: 'Repertoire entry ID to delete' })
  @RequirePermission(P.Music.Library.Write)
  @Delete(':id')
  async deleteEntry(
    @ActorId() actorId: TUserId,
    @Param('id') entryId: TRepertoireEntryId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRY_DELETED,
      await this.cmdBus.execute<DeleteRepertoireEntryCommand, boolean>(
        new DeleteRepertoireEntryCommand(actorId, entryId),
      ),
    );
  }
}
