import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { CreateRepertoireEntryCommand } from '../application/commands/CreateRepertoireEntryCommand.js';
import { DeleteRepertoireEntryCommand } from '../application/commands/DeleteRepertoireEntryCommand.js';
import { GetUserRepertoireQuery } from '../application/queries/GetUserRepertoireQuery.js';
import type { TUserId, TApiResponse, TMusicRepertoireEntryDomainModel, TRepertoireEntryId } from '@sh3pherd/shared-types';
import { SCreateRepertoireEntryPayload } from '@sh3pherd/shared-types';

@Controller('repertoire')
export class MusicRepertoireController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @Get('me')
  async getMyRepertoire(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_LIBRARY_SINGLE_USER_SUCCESS,
      await this.qryBus.execute(new GetUserRepertoireQuery(actorId)),
    );
  }

  @Post()
  async createEntry(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateRepertoireEntryPayload)) payload: any,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED, // TODO: add REPERTOIRE_ENTRY_CREATED code
      await this.cmdBus.execute(new CreateRepertoireEntryCommand(actorId, payload)),
    );
  }

  @Delete(':id')
  async deleteEntry(
    @ActorId() actorId: TUserId,
    @Param('id') entryId: TRepertoireEntryId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED, // TODO: add REPERTOIRE_ENTRY_DELETED code
      await this.cmdBus.execute(new DeleteRepertoireEntryCommand(actorId, entryId)),
    );
  }
}
