import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { CreateMusicReferenceCommand } from '../application/commands/CreateMusicReferenceCommand.js';
import { SearchMusicReferencesQuery } from '../application/queries/SearchMusicReferencesQuery.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type { TUserId, TApiResponse, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { SCreateMusicReferencePayload } from '@sh3pherd/shared-types';


/**
 * MusicReferenceController
 *
 * REST controller for the Music Reference subdomain.
 * Mounted under `music/references` via the MusicModule RouterModule.
 *
 * A **music reference** is a canonical song entry (title + artist),
 * shared across all users. References are created once and reused —
 * each user links to them via repertoire entries.
 *
 * ────────────────────────────────────────────────────────────────
 * Endpoints
 * ────────────────────────────────────────────────────────────────
 *
 * GET  /music/references/dynamic-search?q=<query>
 *   Fuzzy-searches existing references by title and artist
 *   using MongoDB Atlas Search. Returns matching references
 *   ordered by relevance. Used by the "Add to repertoire" panel.
 *
 * POST /music/references
 *   Creates a new music reference. The handler normalises
 *   title + artist to lowercase and deduplicates: if an exact
 *   match already exists, the existing reference is returned
 *   instead of creating a duplicate.
 *   Body: { payload: { title: string, artist: string } }
 *
 * ────────────────────────────────────────────────────────────────
 * TODO
 * ────────────────────────────────────────────────────────────────
 *
 * - DELETE /music/references/:id — delete a reference.
 *   Restricted to system administrators only (role guard).
 *   Must cascade: remove all repertoire entries and versions
 *   linked to this reference across all users.
 *
 */
@ContractScoped()
@Controller('references')
export class MusicReferenceController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  /**
   * Fuzzy search across all music references.
   *
   * @param searchValue - The search query string (min 2 characters for results).
   * @returns Matching references sorted by Atlas Search relevance score.
   *
   * @example
   * GET /api/protected/music/references/dynamic-search?q=bohemian
   * → { data: [{ id: "musicRef_...", title: "bohemian rhapsody", artist: "queen", ... }], ... }
   */
  @RequirePermission(P.Music.Library.Read)
  @Get('dynamic-search')
  async searchReferences(
    @Query('q') searchValue: string,
  ): Promise<TApiResponse<TMusicReferenceDomainModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED,
      await this.qryBus.execute(new SearchMusicReferencesQuery(searchValue ?? '')),
    );
  }

  /**
   * Create a new music reference (or return existing if duplicate).
   *
   * The handler normalises title and artist to lowercase before
   * checking for duplicates. If an exact match is found, the
   * existing document is returned (idempotent).
   *
   * @param actorId  - Authenticated user ID (extracted from JWT by @ActorId).
   * @param payload  - Validated by Zod: `{ title: string, artist: string }`.
   * @returns The created (or existing) music reference.
   *
   * @example
   * POST /api/protected/music/references
   * Body: { "payload": { "title": "Bohemian Rhapsody", "artist": "Queen" } }
   * → { data: { id: "musicRef_...", title: "bohemian rhapsody", artist: "queen", owner_id: "user_..." }, ... }
   */
  @RequirePermission(P.Music.Library.Write)
  @Post()
  async createReference(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateMusicReferencePayload)) payload: any,
  ): Promise<TApiResponse<TMusicReferenceDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_REFERENCE_CREATED,
      await this.cmdBus.execute(new CreateMusicReferenceCommand(actorId, payload)),
    );
  }
}
