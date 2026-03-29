import { Controller, Post, Delete, Patch, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { UploadTrackCommand } from '../application/commands/UploadTrackCommand.js';
import { DeleteTrackCommand } from '../application/commands/DeleteTrackCommand.js';
import { SetTrackFavoriteCommand } from '../application/commands/SetTrackFavoriteCommand.js';
import { GetTrackDownloadUrlQuery } from '../application/queries/GetTrackDownloadUrlQuery.js';
import type { TUserId, TApiResponse, TMusicVersionId, TVersionTrackId, TVersionTrackDomainModel } from '@sh3pherd/shared-types';

@Controller('music-version/:versionId/tracks')
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
    // TODO: fix Multer typing after TS6 migration — @types/multer namespace augmentation broken
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
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
}
