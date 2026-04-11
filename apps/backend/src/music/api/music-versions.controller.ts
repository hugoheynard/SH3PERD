import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreateMusicVersionCommand } from '../application/commands/CreateMusicVersionCommand.js';
import { UpdateMusicVersionCommand } from '../application/commands/UpdateMusicVersionCommand.js';
import { DeleteMusicVersionCommand } from '../application/commands/DeleteMusicVersionCommand.js';
import { MusicVersionPayload } from '../dto/music.dto.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type { TUserId, TApiResponse, TMusicVersionDomainModel, TMusicVersionId } from '@sh3pherd/shared-types';
import { SCreateMusicVersionPayload, SUpdateMusicVersionPayload } from '@sh3pherd/shared-types';


@ApiTags('music / versions')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required. Missing or invalid Bearer token.' })
@ContractScoped()
@Controller('versions')
export class MusicVersionsController {
  constructor(private readonly cmdBus: CommandBus) {}

  @ApiOperation({ summary: 'Create a version', description: 'Creates a new version linked to a music reference (cover, acoustic, remix…).' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_CREATED, MusicVersionPayload, 200))
  @RequirePermission(P.Music.Library.Write)
  @Post()
  async createVersion(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateMusicVersionPayload)) payload: any,
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED,
      await this.cmdBus.execute(new CreateMusicVersionCommand(actorId, payload)),
    );
  }

  @ApiOperation({ summary: 'Update a version', description: 'Partial update of a version\'s metadata (label, genre, ratings…). Ownership is verified.' })
  @ApiParam({ name: 'id', description: 'Version ID to update' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_UPDATED, MusicVersionPayload, 200))
  @RequirePermission(P.Music.Library.Write)
  @Patch(':id')
  async updateVersion(
    @ActorId() actorId: TUserId,
    @Param('id') versionId: TMusicVersionId,
    @Body('payload', new ZodValidationPipe(SUpdateMusicVersionPayload)) payload: any,
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_UPDATED,
      await this.cmdBus.execute(new UpdateMusicVersionCommand(actorId, versionId, payload)),
    );
  }

  @ApiOperation({ summary: 'Delete a version', description: 'Deletes a version and all its tracks (storage + DB). Ownership is verified.' })
  @ApiParam({ name: 'id', description: 'Version ID to delete' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_DELETED, undefined as any, 200))
  @RequirePermission(P.Music.Library.Write)
  @Delete(':id')
  async deleteVersion(
    @ActorId() actorId: TUserId,
    @Param('id') versionId: TMusicVersionId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_DELETED,
      await this.cmdBus.execute(new DeleteMusicVersionCommand(actorId, versionId)),
    );
  }
}
