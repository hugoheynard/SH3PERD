import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
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
import { buildPlaylistApiResponse, PlaylistApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { CreatePlaylistCommand } from '../application/commands/CreatePlaylistHandler.js';
import { UpdatePlaylistCommand } from '../application/commands/UpdatePlaylistHandler.js';
import { DeletePlaylistCommand } from '../application/commands/DeletePlaylistHandler.js';
import { GetUserPlaylistsQuery } from '../application/queries/GetUserPlaylistsHandler.js';
import { GetPlaylistDetailQuery } from '../application/queries/GetPlaylistDetailHandler.js';
import {
  PlaylistPayload,
  PlaylistSummaryPayload,
  PlaylistDetailPayload,
} from '../dto/playlist.dto.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TUserId,
  TPlaylistId,
  TApiResponse,
  TPlaylistDomainModel,
  TPlaylistSummaryViewModel,
  TPlaylistDetailViewModel,
} from '@sh3pherd/shared-types';
import { SCreatePlaylistPayload, SUpdatePlaylistPayload } from '@sh3pherd/shared-types';

@ApiTags('playlists')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@ContractScoped()
@Controller()
export class PlaylistController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create a playlist',
    description: 'Creates a new empty playlist for the authenticated user.',
  })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_CREATED, PlaylistPayload, 200))
  @RequirePermission(P.Music.Playlist.Own)
  @Post()
  async createPlaylist(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SCreatePlaylistPayload)) payload: any,
  ): Promise<TApiResponse<TPlaylistDomainModel>> {
    return buildPlaylistApiResponse(
      PlaylistApiCodes.PLAYLIST_CREATED,
      await this.cmdBus.execute(new CreatePlaylistCommand(actorId, payload)),
    );
  }

  @ApiOperation({
    summary: 'Get my playlists',
    description: 'Returns all playlists owned by the authenticated user with track counts.',
  })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLISTS_FETCHED, PlaylistSummaryPayload, 200))
  @RequirePermission(P.Music.Playlist.Read)
  @Get('me')
  async getMyPlaylists(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TPlaylistSummaryViewModel[]>> {
    return buildPlaylistApiResponse(
      PlaylistApiCodes.PLAYLISTS_FETCHED,
      await this.qryBus.execute(new GetUserPlaylistsQuery(actorId)),
    );
  }

  @ApiOperation({
    summary: 'Get playlist detail',
    description:
      'Returns the playlist with all its resolved tracks (title, artist, version label). Ownership is verified.',
  })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_DETAIL_FETCHED, PlaylistDetailPayload, 200))
  @RequirePermission(P.Music.Playlist.Read)
  @Get(':id')
  async getPlaylistDetail(
    @ActorId() actorId: TUserId,
    @Param('id') playlistId: TPlaylistId,
  ): Promise<TApiResponse<TPlaylistDetailViewModel>> {
    return buildPlaylistApiResponse(
      PlaylistApiCodes.PLAYLIST_DETAIL_FETCHED,
      await this.qryBus.execute(new GetPlaylistDetailQuery(actorId, playlistId)),
    );
  }

  @ApiOperation({
    summary: 'Update a playlist',
    description:
      "Partial update of a playlist's metadata (name, color, description). Ownership is verified.",
  })
  @ApiParam({ name: 'id', description: 'Playlist ID to update' })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_UPDATED, PlaylistPayload, 200))
  @RequirePermission(P.Music.Playlist.Own)
  @Patch(':id')
  async updatePlaylist(
    @ActorId() actorId: TUserId,
    @Param('id') playlistId: TPlaylistId,
    @Body('payload', new ZodValidationPipe(SUpdatePlaylistPayload)) payload: any,
  ): Promise<TApiResponse<TPlaylistDomainModel>> {
    return buildPlaylistApiResponse(
      PlaylistApiCodes.PLAYLIST_UPDATED,
      await this.cmdBus.execute(new UpdatePlaylistCommand(actorId, playlistId, payload)),
    );
  }

  @ApiOperation({
    summary: 'Delete a playlist',
    description: 'Deletes a playlist and all its tracks. Ownership is verified.',
  })
  @ApiParam({ name: 'id', description: 'Playlist ID to delete' })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_DELETED, undefined as any, 200))
  @RequirePermission(P.Music.Playlist.Own)
  @Delete(':id')
  async deletePlaylist(
    @ActorId() actorId: TUserId,
    @Param('id') playlistId: TPlaylistId,
  ): Promise<TApiResponse<boolean>> {
    return buildPlaylistApiResponse(
      PlaylistApiCodes.PLAYLIST_DELETED,
      await this.cmdBus.execute(new DeletePlaylistCommand(actorId, playlistId)),
    );
  }
}
