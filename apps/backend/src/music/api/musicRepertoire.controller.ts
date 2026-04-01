import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreateRepertoireEntryCommand } from '../application/commands/CreateRepertoireEntryCommand.js';
import { DeleteRepertoireEntryCommand } from '../application/commands/DeleteRepertoireEntryCommand.js';
import { GetUserRepertoireQuery } from '../application/queries/GetUserRepertoireQuery.js';
import { RepertoireEntryPayload } from '../dto/music.dto.js';
import type { TUserId, TApiResponse, TMusicRepertoireEntryDomainModel, TRepertoireEntryId } from '@sh3pherd/shared-types';
import { SCreateRepertoireEntryPayload } from '@sh3pherd/shared-types';

@ApiTags('music / repertoire')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required. Missing or invalid Bearer token.' })
@Controller('repertoire')
export class MusicRepertoireController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Get my repertoire entries', description: 'Returns all repertoire entries owned by the authenticated user.' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRIES_FETCHED, RepertoireEntryPayload, 200))
  @Get('me')
  async getMyRepertoire(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRIES_FETCHED,
      await this.qryBus.execute(new GetUserRepertoireQuery(actorId)),
    );
  }

  @ApiOperation({ summary: 'Add song to repertoire', description: 'Creates a repertoire entry linking the user to a music reference — "this song is in my repertoire".' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRY_CREATED, RepertoireEntryPayload, 200))
  @Post()
  async createEntry(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateRepertoireEntryPayload)) payload: any,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRY_CREATED,
      await this.cmdBus.execute(new CreateRepertoireEntryCommand(actorId, payload)),
    );
  }

  @ApiOperation({ summary: 'Remove song from repertoire', description: 'Deletes a repertoire entry. Ownership is verified — only the owner can delete.' })
  @ApiParam({ name: 'id', description: 'Repertoire entry ID to delete' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.REPERTOIRE_ENTRY_DELETED, undefined as any, 200))
  @Delete(':id')
  async deleteEntry(
    @ActorId() actorId: TUserId,
    @Param('id') entryId: TRepertoireEntryId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRY_DELETED,
      await this.cmdBus.execute(new DeleteRepertoireEntryCommand(actorId, entryId)),
    );
  }
}
