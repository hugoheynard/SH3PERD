import { Controller, Post, Delete, Patch, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { UploadTrackCommand } from '../application/commands/UploadTrackCommand.js';
import { DeleteTrackCommand } from '../application/commands/DeleteTrackCommand.js';
import { SetTrackFavoriteCommand } from '../application/commands/SetTrackFavoriteCommand.js';
import { GetTrackDownloadUrlQuery } from '../application/queries/GetTrackDownloadUrlQuery.js';
import { VersionTrackPayload, TrackDownloadUrlPayload } from '../dto/music.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TUserId, TApiResponse, TMusicVersionId, TVersionTrackId,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

/**
 * Track CRUD + download + favorite — user-scoped (no contract required).
 *
 * Processing operations (mastering, AI mastering, pitch-shift) live
 * in {@link MusicTrackProcessingController}.
 */
@ApiTags('music / tracks')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@PlatformScoped()
@Controller('versions/:versionId/tracks')
export class MusicTrackController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Upload a track', description: 'Uploads an audio file to a version. Triggers async analysis (BPM, key, loudness).' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'versionId', description: 'Version to attach the track to' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_UPLOADED, VersionTrackPayload, 201))
  @RequirePermission(P.Music.Track.Write)
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TApiResponse<TVersionTrackDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_UPLOADED,
      await this.cmdBus.execute<UploadTrackCommand, TVersionTrackDomainModel>(
        new UploadTrackCommand(actorId, versionId, file.buffer, file.mimetype, { fileName: file.originalname }),
      ),
    );
  }

  @ApiOperation({ summary: 'Delete a track', description: 'Deletes a track from a version and removes the file from storage.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the track' })
  @ApiParam({ name: 'trackId', description: 'Track to delete' })
  @RequirePermission(P.Music.Track.Write)
  @Delete(':trackId')
  async deleteTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_DELETED,
      await this.cmdBus.execute<DeleteTrackCommand, boolean>(
        new DeleteTrackCommand(actorId, versionId, trackId),
      ),
    );
  }

  @ApiOperation({ summary: 'Set track as favorite', description: 'Marks a track as the favorite for its version. Only one favorite per version.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the track' })
  @ApiParam({ name: 'trackId', description: 'Track to set as favorite' })
  @RequirePermission(P.Music.Track.Write)
  @Patch(':trackId/favorite')
  async setFavorite(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_FAVORITE_SET,
      await this.cmdBus.execute<SetTrackFavoriteCommand, boolean>(
        new SetTrackFavoriteCommand(actorId, versionId, trackId),
      ),
    );
  }

  @ApiOperation({ summary: 'Get track download URL', description: 'Returns a presigned URL to download the track audio file. Expires after 1 hour.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the track' })
  @ApiParam({ name: 'trackId', description: 'Track to download' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_DOWNLOAD_URL, TrackDownloadUrlPayload, 200))
  @RequirePermission(P.Music.Track.Read)
  @Get(':trackId/download')
  async getDownloadUrl(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<{ url: string }>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_DOWNLOAD_URL,
      await this.qryBus.execute<GetTrackDownloadUrlQuery, { url: string }>(
        new GetTrackDownloadUrlQuery(actorId, versionId, trackId),
      ),
    );
  }
}
