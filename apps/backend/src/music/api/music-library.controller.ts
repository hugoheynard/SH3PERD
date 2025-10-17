import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { TSingleUserMusicLibraryRequestDTO, TUserMusicLibraryResponseDTO } from '@sh3pherd/shared-types';
import { apiCodes, buildApiResponse } from '../codes.js';
import type { TMusicLibraryUseCases } from '../useCases/library/createMusicLibraryUseCases.js';
import { MUSIC_LIBRARY_USE_CASES } from '../music.tokens.js';

/**
  * Controller for managing the music library.
 */
@Controller('music-library')
export class MusicLibraryController {
  constructor(@Inject(MUSIC_LIBRARY_USE_CASES) private readonly uc: TMusicLibraryUseCases) {};
  /**
    * Endpoint to fetch the music library of a single user.
    * This will return the music versions associated with the user.
    */
  @Post('single-user')
  async getUserMusicLibrary(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: TSingleUserMusicLibraryRequestDTO
  ): Promise<TUserMusicLibraryResponseDTO> {
    console.log('getUserMusicLibrary called with requestDTO:', req.cookies);
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
