import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { P } from '@sh3pherd/shared-types';
import type {
  TApiResponse,
  TCreateShowPayload,
  TPlaylistDomainModel,
  TShowDetailViewModel,
  TShowDomainModel,
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TShowSummaryViewModel,
  TUpdateShowPayload,
  TUserId,
} from '@sh3pherd/shared-types';
import {
  SAddShowSectionItemPayload,
  SAddShowSectionPayload,
  SConvertSectionToPlaylistPayload,
  SCreateShowPayload,
  SMarkShowPlayedPayload,
  SReorderShowSectionItemsPayload,
  SReorderShowSectionsPayload,
  SUpdateShowPayload,
  SUpdateShowSectionPayload,
} from '@sh3pherd/shared-types';

import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { buildShowApiResponse, ShowApiCodes } from '../codes.js';
import { ShowDetailPayload, ShowPayload, ShowSummaryPayload } from '../dto/show.dto.js';

import { CreateShowCommand } from '../application/commands/CreateShowHandler.js';
import { UpdateShowInfoCommand } from '../application/commands/UpdateShowInfoHandler.js';
import { DeleteShowCommand } from '../application/commands/DeleteShowHandler.js';
import { DuplicateShowCommand } from '../application/commands/DuplicateShowHandler.js';
import {
  AddShowSectionCommand,
  RemoveShowSectionCommand,
  ReorderShowSectionsCommand,
  UpdateShowSectionCommand,
} from '../application/commands/SectionCommands.js';
import {
  AddShowSectionItemCommand,
  MoveShowSectionItemCommand,
  RemoveShowSectionItemCommand,
  ReorderShowSectionItemsCommand,
} from '../application/commands/ItemCommands.js';
import {
  MarkSectionPlayedCommand,
  MarkShowPlayedCommand,
} from '../application/commands/MarkPlayedHandlers.js';
import { ConvertSectionToPlaylistCommand } from '../application/commands/ConvertSectionToPlaylistHandler.js';
import { ListUserShowsQuery } from '../application/queries/ListUserShowsHandler.js';
import { GetShowDetailQuery } from '../application/queries/GetShowDetailHandler.js';

@ApiTags('shows')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@PlatformScoped()
@Controller()
export class ShowController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  // ── Shows ─────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a show' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOW_CREATED, ShowPayload, 200))
  @RequirePermission(P.Music.Show.Own)
  @Post()
  async createShow(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreateShowPayload)) payload: TCreateShowPayload,
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<CreateShowCommand, TShowDomainModel>(
      new CreateShowCommand(actorId, payload),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_CREATED, result);
  }

  @ApiOperation({ summary: 'List my shows' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOWS_FETCHED, ShowSummaryPayload, 200))
  @RequirePermission(P.Music.Show.Read)
  @Get('me')
  async listMyShows(@ActorId() actorId: TUserId): Promise<TApiResponse<TShowSummaryViewModel[]>> {
    const result = await this.qryBus.execute<ListUserShowsQuery, TShowSummaryViewModel[]>(
      new ListUserShowsQuery(actorId),
    );
    return buildShowApiResponse(ShowApiCodes.SHOWS_FETCHED, result);
  }

  @ApiOperation({ summary: 'Get a show with sections + items' })
  @ApiParam({ name: 'id' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOW_DETAIL_FETCHED, ShowDetailPayload, 200))
  @RequirePermission(P.Music.Show.Read)
  @Get(':id')
  async getShow(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
  ): Promise<TApiResponse<TShowDetailViewModel>> {
    const result = await this.qryBus.execute<GetShowDetailQuery, TShowDetailViewModel>(
      new GetShowDetailQuery(actorId, showId),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_DETAIL_FETCHED, result);
  }

  @ApiOperation({ summary: 'Update a show' })
  @ApiParam({ name: 'id' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOW_UPDATED, ShowPayload, 200))
  @RequirePermission(P.Music.Show.Own)
  @Patch(':id')
  async updateShow(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Body('payload', new ZodValidationPipe(SUpdateShowPayload)) payload: TUpdateShowPayload,
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<UpdateShowInfoCommand, TShowDomainModel>(
      new UpdateShowInfoCommand(actorId, showId, payload),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_UPDATED, result);
  }

  @ApiOperation({ summary: 'Delete a show' })
  @ApiParam({ name: 'id' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOW_DELETED, Boolean, 200))
  @RequirePermission(P.Music.Show.Delete)
  @Delete(':id')
  async deleteShow(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
  ): Promise<TApiResponse<boolean>> {
    const result = await this.cmdBus.execute<DeleteShowCommand, boolean>(
      new DeleteShowCommand(actorId, showId),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_DELETED, result);
  }

  @ApiOperation({ summary: 'Duplicate a show (deep copy)' })
  @ApiParam({ name: 'id' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOW_DUPLICATED, ShowPayload, 200))
  @RequirePermission(P.Music.Show.Own)
  @Post(':id/duplicate')
  async duplicateShow(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<DuplicateShowCommand, TShowDomainModel>(
      new DuplicateShowCommand(actorId, showId),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_DUPLICATED, result);
  }

  // ── Sections ──────────────────────────────────────────

  @ApiOperation({ summary: 'Add a section' })
  @ApiParam({ name: 'id' })
  @ApiResponse(apiSuccessDTO(ShowApiCodes.SHOW_SECTION_ADDED, ShowPayload, 200))
  @RequirePermission(P.Music.Show.Write)
  @Post(':id/sections')
  async addSection(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Body('payload', new ZodValidationPipe(SAddShowSectionPayload))
    payload: {
      name: string;
      target?:
        | { mode: 'duration'; duration_s: number }
        | { mode: 'track_count'; track_count: number };
    },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<AddShowSectionCommand, TShowDomainModel>(
      new AddShowSectionCommand(actorId, showId, payload),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_SECTION_ADDED, result);
  }

  // NOTE: `PATCH :id/sections/reorder` MUST come before
  // `PATCH :id/sections/:sectionId` — NestJS/Express match by registration
  // order, and the wildcard would otherwise swallow `reorder` as a
  // section id. `SUpdateShowSectionPayload` would then strip the
  // unknown `ordered_ids` key and the request would silently succeed
  // as a no-op update.
  @ApiOperation({ summary: 'Reorder sections' })
  @RequirePermission(P.Music.Show.Write)
  @Patch(':id/sections/reorder')
  async reorderSections(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Body('payload', new ZodValidationPipe(SReorderShowSectionsPayload))
    payload: { ordered_ids: TShowSectionId[] },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<ReorderShowSectionsCommand, TShowDomainModel>(
      new ReorderShowSectionsCommand(actorId, showId, payload.ordered_ids),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_SECTIONS_REORDERED, result);
  }

  @ApiOperation({ summary: 'Update a section' })
  @RequirePermission(P.Music.Show.Write)
  @Patch(':id/sections/:sectionId')
  async updateSection(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
    @Body('payload', new ZodValidationPipe(SUpdateShowSectionPayload))
    payload: {
      name?: string;
      target?:
        | { mode: 'duration'; duration_s: number }
        | { mode: 'track_count'; track_count: number }
        | null;
    },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<UpdateShowSectionCommand, TShowDomainModel>(
      new UpdateShowSectionCommand(actorId, showId, sectionId, payload),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_SECTION_UPDATED, result);
  }

  @ApiOperation({ summary: 'Remove a section (must keep ≥ 1)' })
  @RequirePermission(P.Music.Show.Write)
  @Delete(':id/sections/:sectionId')
  async removeSection(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<RemoveShowSectionCommand, TShowDomainModel>(
      new RemoveShowSectionCommand(actorId, showId, sectionId),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_SECTION_REMOVED, result);
  }

  // ── Items ─────────────────────────────────────────────

  @ApiOperation({ summary: 'Add an item (version or playlist) to a section' })
  @RequirePermission(P.Music.Show.Write)
  @Post(':id/sections/:sectionId/items')
  async addItem(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
    @Body('payload', new ZodValidationPipe(SAddShowSectionItemPayload))
    payload: { kind: 'version' | 'playlist'; ref_id: string; position?: number },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<AddShowSectionItemCommand, TShowDomainModel>(
      new AddShowSectionItemCommand(actorId, showId, sectionId, {
        kind: payload.kind,
        ref_id: payload.ref_id as never,
        position: payload.position,
      }),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_ITEM_ADDED, result);
  }

  @ApiOperation({ summary: 'Remove an item from a section' })
  @RequirePermission(P.Music.Show.Write)
  @Delete(':id/sections/:sectionId/items/:itemId')
  async removeItem(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
    @Param('itemId') itemId: TShowSectionItemId,
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<RemoveShowSectionItemCommand, TShowDomainModel>(
      new RemoveShowSectionItemCommand(actorId, showId, sectionId, itemId),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_ITEM_REMOVED, result);
  }

  @ApiOperation({ summary: 'Reorder items inside a section' })
  @RequirePermission(P.Music.Show.Write)
  @Patch(':id/sections/:sectionId/items/reorder')
  async reorderItems(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
    @Body('payload', new ZodValidationPipe(SReorderShowSectionItemsPayload))
    payload: { ordered_ids: TShowSectionItemId[] },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<ReorderShowSectionItemsCommand, TShowDomainModel>(
      new ReorderShowSectionItemsCommand(actorId, showId, sectionId, payload.ordered_ids),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_ITEMS_REORDERED, result);
  }

  @ApiOperation({ summary: 'Move an item across sections' })
  @RequirePermission(P.Music.Show.Write)
  @Patch(':id/items/:itemId/move')
  async moveItem(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('itemId') itemId: TShowSectionItemId,
    @Body('payload')
    payload: { from: TShowSectionId; to: TShowSectionId; position?: number },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<MoveShowSectionItemCommand, TShowDomainModel>(
      new MoveShowSectionItemCommand(
        actorId,
        showId,
        payload.from,
        payload.to,
        itemId,
        payload.position,
      ),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_ITEM_MOVED, result);
  }

  // ── Played ────────────────────────────────────────────

  @ApiOperation({ summary: 'Mark the whole show as played' })
  @RequirePermission(P.Music.Show.Write)
  @Post(':id/played')
  async markShowPlayed(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Body('payload', new ZodValidationPipe(SMarkShowPlayedPayload))
    payload: { playedAt?: number },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<MarkShowPlayedCommand, TShowDomainModel>(
      new MarkShowPlayedCommand(actorId, showId, payload.playedAt),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_MARKED_PLAYED, result);
  }

  @ApiOperation({ summary: 'Mark a single section as played' })
  @RequirePermission(P.Music.Show.Write)
  @Post(':id/sections/:sectionId/played')
  async markSectionPlayed(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
    @Body('payload', new ZodValidationPipe(SMarkShowPlayedPayload))
    payload: { playedAt?: number },
  ): Promise<TApiResponse<TShowDomainModel>> {
    const result = await this.cmdBus.execute<MarkSectionPlayedCommand, TShowDomainModel>(
      new MarkSectionPlayedCommand(actorId, showId, sectionId, payload.playedAt),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_SECTION_MARKED_PLAYED, result);
  }

  // ── Convert section to playlist ───────────────────────

  @ApiOperation({ summary: 'Convert a section into a new playlist' })
  @RequirePermission(P.Music.Show.Own, P.Music.Playlist.Own)
  @Post(':id/sections/:sectionId/to-playlist')
  async convertSectionToPlaylist(
    @ActorId() actorId: TUserId,
    @Param('id') showId: TShowId,
    @Param('sectionId') sectionId: TShowSectionId,
    @Body('payload', new ZodValidationPipe(SConvertSectionToPlaylistPayload))
    payload: { name?: string; color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' },
  ): Promise<TApiResponse<TPlaylistDomainModel>> {
    const result = await this.cmdBus.execute<ConvertSectionToPlaylistCommand, TPlaylistDomainModel>(
      new ConvertSectionToPlaylistCommand(actorId, showId, sectionId, payload),
    );
    return buildShowApiResponse(ShowApiCodes.SHOW_SECTION_CONVERTED_TO_PLAYLIST, result);
  }
}
