import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { GetUserMusicLibraryQuery } from '../application/queries/GetUserMusicLibraryQuery.js';
import type { TUserId, TApiResponse, TUserMusicLibraryViewModel } from '@sh3pherd/shared-types';

@Controller('music-library')
export class MusicLibraryController {
  constructor(private readonly qryBus: QueryBus) {}

  @Get('me')
  async getMyLibrary(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TUserMusicLibraryViewModel[]>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_LIBRARY_SINGLE_USER_SUCCESS,
      await this.qryBus.execute(new GetUserMusicLibraryQuery(actorId)),
    );
  }
}
