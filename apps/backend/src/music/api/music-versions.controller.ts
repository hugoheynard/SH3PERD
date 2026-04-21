import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { MusicApiCodes } from '../codes.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { apiRequestDTO, apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreateMusicVersionCommand } from '../application/commands/CreateMusicVersionCommand.js';
import { UpdateMusicVersionCommand } from '../application/commands/UpdateMusicVersionCommand.js';
import { DeleteMusicVersionCommand } from '../application/commands/DeleteMusicVersionCommand.js';
import {
  CreateMusicVersionRequestPayload,
  MusicVersionPayload,
  UpdateMusicVersionRequestPayload,
} from '../dto/music.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P, SCreateMusicVersionPayload, SUpdateMusicVersionPayload } from '@sh3pherd/shared-types';
import type {
  TUserId,
  TApiResponse,
  TMusicVersionDomainModel,
  TMusicVersionId,
  TCreateMusicVersionPayload,
  TUpdateMusicVersionPayload,
} from '@sh3pherd/shared-types';

/**
 * Music Version controller — platform-scoped (user's personal library).
 *
 * A version is a user's rendition of a music reference (cover, acoustic,
 * remix, pitch-shift). Ownership is enforced at the aggregate level.
 */
@ApiTags('music / versions')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@PlatformScoped()
@Controller('versions')
export class MusicVersionsController {
  constructor(private readonly cmdBus: CommandBus) {}

  @ApiOperation({
    summary: 'Create a version',
    description: 'Creates a new version linked to a music reference (cover, acoustic, remix…).',
  })
  @ApiBody(apiRequestDTO(CreateMusicVersionRequestPayload))
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_CREATED, MusicVersionPayload, 201))
  @ApiResponse({ status: 400, description: 'Validation failed (Zod or domain invariants).' })
  @ApiResponse({ status: 402, description: 'Quota exceeded for the current plan.' })
  @ApiResponse({ status: 404, description: 'Repertoire entry not found for this reference.' })
  @ApiResponse({ status: 409, description: 'Max versions per reference reached.' })
  @RequirePermission(P.Music.Library.Write)
  @Post()
  async createVersion(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateMusicVersionPayload))
    payload: TCreateMusicVersionPayload,
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED,
      await this.cmdBus.execute<CreateMusicVersionCommand, TMusicVersionDomainModel>(
        new CreateMusicVersionCommand(actorId, payload),
      ),
    );
  }

  @ApiOperation({
    summary: 'Update a version',
    description:
      "Partial update of a version's metadata (label, genre, ratings…). Ownership is verified.",
  })
  @ApiParam({ name: 'id', description: 'Version ID to update', example: 'musicVer_abc-123' })
  @ApiBody(apiRequestDTO(UpdateMusicVersionRequestPayload))
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_UPDATED, MusicVersionPayload, 200))
  @ApiResponse({ status: 400, description: 'Validation failed (Zod or domain invariants).' })
  @ApiResponse({ status: 404, description: 'Version not found.' })
  @RequirePermission(P.Music.Library.Write)
  @Patch(':id')
  async updateVersion(
    @ActorId() actorId: TUserId,
    @Param('id') versionId: TMusicVersionId,
    @Body('payload', new ZodValidationPipe(SUpdateMusicVersionPayload))
    payload: TUpdateMusicVersionPayload,
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_UPDATED,
      await this.cmdBus.execute<UpdateMusicVersionCommand, TMusicVersionDomainModel>(
        new UpdateMusicVersionCommand(actorId, versionId, payload),
      ),
    );
  }

  @ApiOperation({
    summary: 'Delete a version',
    description: 'Deletes a version and all its tracks (storage + DB). Ownership is verified.',
  })
  @ApiParam({ name: 'id', description: 'Version ID to delete', example: 'musicVer_abc-123' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_DELETED, Boolean, 200))
  @ApiResponse({ status: 404, description: 'Version not found.' })
  @RequirePermission(P.Music.Library.Write)
  @Delete(':id')
  async deleteVersion(
    @ActorId() actorId: TUserId,
    @Param('id') versionId: TMusicVersionId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_DELETED,
      await this.cmdBus.execute<DeleteMusicVersionCommand, boolean>(
        new DeleteMusicVersionCommand(actorId, versionId),
      ),
    );
  }
}
