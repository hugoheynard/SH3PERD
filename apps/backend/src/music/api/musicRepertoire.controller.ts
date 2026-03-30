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

/**
 * MusicRepertoireController
 *
 * REST controller for repertoire entry management.
 * Mounted under `music/repertoire` via the MusicModule RouterModule.
 *
 * A **repertoire entry** links a user to a music reference —
 * "this song is in my repertoire". Versions are attached to entries.
 *
 * ────────────────────────────────────────────────────────────────
 * Endpoints
 * ────────────────────────────────────────────────────────────────
 *
 * GET    /music/repertoire/me
 *   Returns all repertoire entries owned by the authenticated user.
 *
 * POST   /music/repertoire
 *   Creates a new repertoire entry linking the user to a music reference.
 *   Body: { payload: { musicReference_id: TMusicReferenceId } }
 *
 * DELETE /music/repertoire/:id
 *   Deletes a repertoire entry. Ownership is verified — only the owner
 *   can delete their own entries.
 *
 */
@Controller('repertoire')
export class MusicRepertoireController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  /**
   * Get all repertoire entries for the authenticated user.
   *
   * @param actorId - Authenticated user ID (from JWT).
   * @returns Array of repertoire entries.
   */
  @Get('me')
  async getMyRepertoire(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TMusicRepertoireEntryDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.REPERTOIRE_ENTRIES_FETCHED,
      await this.qryBus.execute(new GetUserRepertoireQuery(actorId)),
    );
  }

  /**
   * Create a repertoire entry — "add this song to my repertoire".
   *
   * @param actorId - Authenticated user ID (from JWT).
   * @param payload - Validated: { musicReference_id: TMusicReferenceId }
   * @returns The created repertoire entry.
   */
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

  /**
   * Delete a repertoire entry.
   * Ownership is verified in the command handler.
   *
   * @param actorId - Authenticated user ID (from JWT).
   * @param entryId - The repertoire entry ID to delete.
   * @returns true if deleted.
   */
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
