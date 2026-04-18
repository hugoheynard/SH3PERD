import { Controller, Post, Delete, Patch, Body, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildPlaylistApiResponse, PlaylistApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { AddPlaylistTrackCommand } from '../application/commands/AddPlaylistTrackHandler.js';
import { RemovePlaylistTrackCommand } from '../application/commands/RemovePlaylistTrackHandler.js';
import { ReorderPlaylistTrackCommand } from '../application/commands/ReorderPlaylistTrackHandler.js';
import { PlaylistTrackPayload } from '../dto/playlist.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TUserId,
  TPlaylistId,
  TPlaylistTrackId,
  TApiResponse,
  TPlaylistTrackDomainModel,
  TAddPlaylistTrackPayload,
  TReorderPlaylistTrackPayload,
} from '@sh3pherd/shared-types';
import { SAddPlaylistTrackPayload, SReorderPlaylistTrackPayload } from '@sh3pherd/shared-types';

@ApiTags('playlists / tracks')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@PlatformScoped()
@Controller()
export class PlaylistTracksController {
  constructor(private readonly cmdBus: CommandBus) {}

  @ApiOperation({
    summary: 'Add a track to a playlist',
    description: 'Adds a music version to the end of the playlist. Ownership is verified.',
  })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_TRACK_ADDED, PlaylistTrackPayload, 200))
  @RequirePermission(P.Music.Playlist.Own)
  @Post(':playlistId/tracks')
  async addTrack(
    @ActorId() actorId: TUserId,
    @Param('playlistId') playlistId: TPlaylistId,
    @Body('payload', new ZodValidationPipe(SAddPlaylistTrackPayload))
    payload: TAddPlaylistTrackPayload,
  ): Promise<TApiResponse<TPlaylistTrackDomainModel>> {
    const result = await this.cmdBus.execute<AddPlaylistTrackCommand, TPlaylistTrackDomainModel>(
      new AddPlaylistTrackCommand(actorId, playlistId, payload),
    );

    return buildPlaylistApiResponse(PlaylistApiCodes.PLAYLIST_TRACK_ADDED, result);
  }

  @ApiOperation({
    summary: 'Remove a track from a playlist',
    description: 'Removes a track and renumbers remaining positions. Ownership is verified.',
  })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  @ApiParam({ name: 'trackId', description: 'Playlist track ID to remove' })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_TRACK_REMOVED, Boolean, 200))
  @RequirePermission(P.Music.Playlist.Own)
  @Delete(':playlistId/tracks/:trackId')
  async removeTrack(
    @ActorId() actorId: TUserId,
    @Param('playlistId') playlistId: TPlaylistId,
    @Param('trackId') trackId: TPlaylistTrackId,
  ): Promise<TApiResponse<boolean>> {
    const result = await this.cmdBus.execute<RemovePlaylistTrackCommand, boolean>(
      new RemovePlaylistTrackCommand(actorId, playlistId, trackId),
    );

    return buildPlaylistApiResponse(PlaylistApiCodes.PLAYLIST_TRACK_REMOVED, result);
  }

  @ApiOperation({
    summary: 'Reorder a playlist track',
    description:
      'Moves a track to a new position and renumbers all sibling positions. Ownership is verified.',
  })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  @ApiParam({ name: 'trackId', description: 'Playlist track ID to reorder' })
  @ApiResponse(apiSuccessDTO(PlaylistApiCodes.PLAYLIST_TRACK_REORDERED, Boolean, 200))
  @RequirePermission(P.Music.Playlist.Own)
  @Patch(':playlistId/tracks/:trackId/reorder')
  async reorderTrack(
    @ActorId() actorId: TUserId,
    @Param('playlistId') playlistId: TPlaylistId,
    @Param('trackId') trackId: TPlaylistTrackId,
    @Body('payload', new ZodValidationPipe(SReorderPlaylistTrackPayload))
    payload: TReorderPlaylistTrackPayload,
  ): Promise<TApiResponse<boolean>> {
    const result = await this.cmdBus.execute<ReorderPlaylistTrackCommand, boolean>(
      new ReorderPlaylistTrackCommand(actorId, playlistId, trackId, payload.newPosition),
    );

    return buildPlaylistApiResponse(PlaylistApiCodes.PLAYLIST_TRACK_REORDERED, result);
  }
}
