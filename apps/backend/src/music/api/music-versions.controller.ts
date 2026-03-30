import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { CreateMusicVersionCommand } from '../application/commands/CreateMusicVersionCommand.js';
import { UpdateMusicVersionCommand } from '../application/commands/UpdateMusicVersionCommand.js';
import { DeleteMusicVersionCommand } from '../application/commands/DeleteMusicVersionCommand.js';
import type { TUserId, TApiResponse, TMusicVersionDomainModel, TMusicVersionId } from '@sh3pherd/shared-types';
import { SCreateMusicVersionPayload, SUpdateMusicVersionPayload } from '@sh3pherd/shared-types';

/**
 * MusicVersionsController
 *
 * REST controller for music version CRUD.
 * Mounted under `music/versions` via the MusicModule RouterModule.
 *
 * A **version** is a user's rendition of a music reference
 * (cover, pitch variant, acoustic…). Versions hold tracks (audio files).
 *
 * ────────────────────────────────────────────────────────────────
 * Endpoints
 * ────────────────────────────────────────────────────────────────
 *
 * POST   /music/versions
 *   Creates a new version linked to a music reference.
 *   Body: { payload: TCreateMusicVersionPayload }
 *
 * PATCH  /music/versions/:id
 *   Partial update of a version's metadata (label, genre, ratings…).
 *   Ownership is verified in the command handler.
 *
 * DELETE /music/versions/:id
 *   Deletes a version and all its tracks (S3 + DB).
 *   Ownership is verified in the command handler.
 */
@Controller('versions')
export class MusicVersionsController {
  constructor(private readonly cmdBus: CommandBus) {}

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
