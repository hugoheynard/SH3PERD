import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type { Request } from 'express';
import type { TSingleUserMusicLibraryRequestDTO, TUserMusicLibraryResponseDTO } from '@sh3pherd/shared-types';
import { apiCodes, buildApiResponse } from '../codes.js';

/**
  * Controller for managing the music library.
 */
@Controller('music-library')
export class MusicLibraryController {
  constructor(
    @Inject(USE_CASES_TOKENS.musicLibrary)
    private readonly uc: TCoreUseCasesTypeMap['musicLibrary']) {};
  /**
    * Endpoint to fetch the music library of a single user.
    * This will return the music versions associated with the user.
    */
  @Post('single-user')
  async getUserMusicLibrary(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: TSingleUserMusicLibraryRequestDTO
  ): Promise<TUserMusicLibraryResponseDTO> {
    console.log('getUserMusicLibrary called with requestDTO:', req);
    const result = await this.uc.getUserMusicLibrary({ target_id: requestDTO.target_id });
    return buildApiResponse(apiCodes.music.MUSIC_LIBRARY_SINGLE_USER_SUCCESS, result)
  };

  /*
  @Post('multi-users')
  async getMultipleUsersMusicLibrary(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: {
      target_ids: string[],
      filter?: { genre: string[]; type: string[] },
      crossRefs?: boolean //activates cross-referencing of music versions between users
    },
  ): Promise<void> {

  };

   */


}
