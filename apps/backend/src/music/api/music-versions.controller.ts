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
import { Throttle } from '@nestjs/throttler';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { MusicApiCodes } from '../codes.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { apiRequestDTO, apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreateMusicVersionCommand } from '../application/commands/CreateMusicVersionCommand.js';
import { UpdateMusicVersionCommand } from '../application/commands/UpdateMusicVersionCommand.js';
import { DeleteMusicVersionCommand } from '../application/commands/DeleteMusicVersionCommand.js';
import {
  CreateMusicVersionRequestDTO,
  MusicVersionDeletedPayload,
  MusicVersionPayload,
  UpdateMusicVersionRequestDTO,
} from '../dto/music.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import {
  P,
  SCreateMusicVersionPayload,
  SMusicVersionId,
  SUpdateMusicVersionPayload,
} from '@sh3pherd/shared-types';
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
 * pitch-shift, remix). Ownership is enforced at the aggregate level via
 * `MusicPolicy`. Writes are throttled, path params go through Zod.
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
    description:
      'Creates a new version linked to a music reference (cover, acoustic, remix…). The user must already have the reference in their repertoire (call POST /music/repertoire first). The `track_version` quota is recorded on success; `MAX_VERSIONS_PER_REFERENCE` guards the per-reference count.',
  })
  @ApiBody(apiRequestDTO(CreateMusicVersionRequestDTO))
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_CREATED, MusicVersionPayload, 201))
  @ApiResponse({ status: 400, description: 'Validation failed or domain invariant violated.' })
  @ApiResponse({ status: 402, description: 'Quota exceeded for the current plan.' })
  @ApiResponse({ status: 404, description: 'Repertoire entry not found for this reference.' })
  @ApiResponse({ status: 429, description: 'Too many creations. Slow down.' })
  @RequirePermission(P.Music.Library.Write)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
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
      "Partial update of a version's metadata (label, genre, ratings…). Ownership is verified (403 if not owner). An empty patch short-circuits (no DB write, no analytics).",
  })
  @ApiParam({ name: 'id', description: 'Version ID (prefixed: musicVer_…)' })
  @ApiBody(apiRequestDTO(UpdateMusicVersionRequestDTO))
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_UPDATED, MusicVersionPayload, 200))
  @ApiResponse({ status: 400, description: 'Validation failed or domain invariant violated.' })
  @ApiResponse({ status: 403, description: 'Actor does not own this version.' })
  @ApiResponse({ status: 404, description: 'Version not found.' })
  @RequirePermission(P.Music.Library.Write)
  @Patch(':id')
  async updateVersion(
    @ActorId() actorId: TUserId,
    @Param('id', new ZodValidationPipe(SMusicVersionId)) versionId: TMusicVersionId,
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
    description:
      'Deletes a version and every version derived from it (pitch-shift children), cascade-removing their tracks from object storage (best-effort) and crediting back the `storage_bytes` quota counter. Ownership is verified (403 if not owner).',
  })
  @ApiParam({ name: 'id', description: 'Version ID (prefixed: musicVer_…)' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_VERSION_DELETED, MusicVersionDeletedPayload, 200))
  @ApiResponse({ status: 403, description: 'Actor does not own this version.' })
  @ApiResponse({ status: 404, description: 'Version not found.' })
  @RequirePermission(P.Music.Library.Write)
  @Delete(':id')
  async deleteVersion(
    @ActorId() actorId: TUserId,
    @Param('id', new ZodValidationPipe(SMusicVersionId)) versionId: TMusicVersionId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_DELETED,
      await this.cmdBus.execute<DeleteMusicVersionCommand, boolean>(
        new DeleteMusicVersionCommand(actorId, versionId),
      ),
    );
  }
}
