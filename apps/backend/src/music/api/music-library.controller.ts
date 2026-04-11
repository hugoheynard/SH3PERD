import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { GetUserMusicLibraryQuery } from '../application/queries/GetUserMusicLibraryQuery.js';
import { UserMusicLibraryViewModelPayload } from '../dto/music.dto.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type { TUserId, TApiResponse, TUserMusicLibraryViewModel } from '@sh3pherd/shared-types';

@ApiTags('music / library')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required. Missing or invalid Bearer token.' })
@ContractScoped()
@Controller('library')
export class MusicLibraryController {
  constructor(private readonly qryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get my music library', description: 'Returns the full music library for the authenticated user — all repertoire entries with their references and versions.' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.MUSIC_LIBRARY_SINGLE_USER_SUCCESS, UserMusicLibraryViewModelPayload, 200))
  @RequirePermission(P.Music.Library.Read)
  @Get('me')
  async getMyLibrary(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TUserMusicLibraryViewModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.MUSIC_LIBRARY_SINGLE_USER_SUCCESS,
      await this.qryBus.execute(new GetUserMusicLibraryQuery(actorId)),
    );
  };
}
