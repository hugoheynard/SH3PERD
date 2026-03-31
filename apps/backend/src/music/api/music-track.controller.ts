import { Controller, Post, Delete, Patch, Get, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { UploadTrackCommand } from '../application/commands/UploadTrackCommand.js';
import { DeleteTrackCommand } from '../application/commands/DeleteTrackCommand.js';
import { SetTrackFavoriteCommand } from '../application/commands/SetTrackFavoriteCommand.js';
import { MasterTrackCommand } from '../application/commands/MasterTrackCommand.js';
import { PitchShiftVersionCommand } from '../application/commands/PitchShiftVersionCommand.js';
import { GetTrackDownloadUrlQuery } from '../application/queries/GetTrackDownloadUrlQuery.js';
import type {
  TUserId, TApiResponse, TMusicVersionId, TVersionTrackId,
  TVersionTrackDomainModel, TMusicVersionDomainModel, TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

@Controller('versions/:versionId/tracks')
export class MusicTrackController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } })) // 50MB
  async uploadTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TApiResponse<TVersionTrackDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED, // TODO: add TRACK_UPLOADED code
      await this.cmdBus.execute(
        new UploadTrackCommand(
          actorId,
          versionId,
          file.buffer,
          file.mimetype,
          { fileName: file.originalname },
        ),
      ),
    );
  }

  @Delete(':trackId')
  async deleteTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED, // TODO: add TRACK_DELETED code
      await this.cmdBus.execute(new DeleteTrackCommand(actorId, versionId, trackId)),
    );
  }

  @Patch(':trackId/favorite')
  async setFavorite(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED, // TODO: add TRACK_FAVORITE_SET code
      await this.cmdBus.execute(new SetTrackFavoriteCommand(actorId, versionId, trackId)),
    );
  }

  @Get(':trackId/download')
  async getDownloadUrl(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
  ): Promise<TApiResponse<{ url: string }>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_LIBRARY_SINGLE_USER_SUCCESS, // TODO: add TRACK_DOWNLOAD_URL code
      await this.qryBus.execute(new GetTrackDownloadUrlQuery(actorId, versionId, trackId)),
    );
  }

  @Post(':trackId/master')
  async masterTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: TMasteringTargetSpecs,
  ): Promise<TApiResponse<TVersionTrackDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED, // TODO: add TRACK_MASTERED code
      await this.cmdBus.execute(new MasterTrackCommand(actorId, versionId, trackId, body)),
    );
  }

  @Post(':trackId/pitch-shift')
  async pitchShiftTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: { semitones: number },
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_VERSION_CREATED, // TODO: add VERSION_PITCH_SHIFTED code
      await this.cmdBus.execute(new PitchShiftVersionCommand(actorId, versionId, trackId, body.semitones)),
    );
  }
}
