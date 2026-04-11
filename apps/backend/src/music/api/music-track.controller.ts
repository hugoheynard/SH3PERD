import { Controller, Post, Delete, Patch, Get, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { UploadTrackCommand } from '../application/commands/UploadTrackCommand.js';
import { DeleteTrackCommand } from '../application/commands/DeleteTrackCommand.js';
import { SetTrackFavoriteCommand } from '../application/commands/SetTrackFavoriteCommand.js';
import { MasterTrackCommand } from '../application/commands/MasterTrackCommand.js';
import { PitchShiftVersionCommand } from '../application/commands/PitchShiftVersionCommand.js';
import { GetTrackDownloadUrlQuery } from '../application/queries/GetTrackDownloadUrlQuery.js';
import { VersionTrackPayload, TrackDownloadUrlPayload, MusicVersionPayload } from '../dto/music.dto.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TUserId, TApiResponse, TMusicVersionId, TVersionTrackId,
  TVersionTrackDomainModel, TMusicVersionDomainModel, TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';


@ApiTags('music / tracks')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required. Missing or invalid Bearer token.' })
@ContractScoped()
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
      await this.cmdBus.execute(new UploadTrackCommand(actorId, versionId, file.buffer, file.mimetype, { fileName: file.originalname })),
    );
  }

  @ApiOperation({ summary: 'Delete a track', description: 'Deletes a track from a version and removes the file from storage.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the track' })
  @ApiParam({ name: 'trackId', description: 'Track to delete' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_DELETED, undefined as any, 200))
  @RequirePermission(P.Music.Track.Write)
  @Delete(':trackId')
  async deleteTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_DELETED,
      await this.cmdBus.execute(new DeleteTrackCommand(actorId, versionId, trackId)),
    );
  }

  @ApiOperation({ summary: 'Set track as favorite', description: 'Marks a track as the favorite for its version. Only one favorite per version.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the track' })
  @ApiParam({ name: 'trackId', description: 'Track to set as favorite' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_FAVORITE_SET, undefined as any, 200))
  @RequirePermission(P.Music.Track.Write)
  @Patch(':trackId/favorite')
  async setFavorite(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_FAVORITE_SET,
      await this.cmdBus.execute(new SetTrackFavoriteCommand(actorId, versionId, trackId)),
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
      await this.qryBus.execute(new GetTrackDownloadUrlQuery(actorId, versionId, trackId)),
    );
  }

  @ApiOperation({ summary: 'Master a track', description: 'Creates a mastered copy of a track with target loudness specs. Uses analysis data from the original for precision.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the source track' })
  @ApiParam({ name: 'trackId', description: 'Source track to master' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_MASTERED, VersionTrackPayload, 200))
  @RequirePermission(P.Music.Track.Write)
  @Post(':trackId/master')
  async masterTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: TMasteringTargetSpecs,
  ): Promise<TApiResponse<TVersionTrackDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_MASTERED,
      await this.cmdBus.execute(new MasterTrackCommand(actorId, versionId, trackId, body)),
    );
  }

  @ApiOperation({ summary: 'Pitch-shift a version', description: 'Creates a new version with all tracks pitch-shifted by the specified semitones. The new version is linked to the original via parentVersionId.' })
  @ApiParam({ name: 'versionId', description: 'Source version to pitch-shift' })
  @ApiParam({ name: 'trackId', description: 'Reference track for the operation' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.VERSION_PITCH_SHIFTED, MusicVersionPayload, 200))
  @RequirePermission(P.Music.Track.Write)
  @Post(':trackId/pitch-shift')
  async pitchShiftTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: { semitones: number },
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.VERSION_PITCH_SHIFTED,
      await this.cmdBus.execute(new PitchShiftVersionCommand(actorId, versionId, trackId, body.semitones)),
    );
  }
}
