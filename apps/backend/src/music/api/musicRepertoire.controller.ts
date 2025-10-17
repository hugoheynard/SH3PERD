import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MUSIC_REPERTOIRE_USE_CASES } from '../music.tokens.js';
import type { TMusicRepertoireUseCases } from '../types/musicRepertoire.useCases.types.js';

@Controller('musicRepertoire')
export class MusicRepertoireController {
  // This controller will handle routes related to music repertoire.
  // You can define methods here to handle specific requests, such as getting repertoire data,
  // adding new repertoire, updating existing ones, etc.

  constructor(
    @Inject(MUSIC_REPERTOIRE_USE_CASES) private readonly uc: TMusicRepertoireUseCases,
  ) {}

  @Post('/me')
  async me(@Body() requestDTO: any, @Req() req: Request): Promise<any> {
    return this.uc.getEntriesBy({
      asker_user_id: req.user_id,
      target_user_id: req.user_id,
      filter: requestDTO.filter
    });
  }

  @Post('/')
  async getRepertoire(@Body() requestDTO: any): Promise<any> {
    return this.uc.getEntriesBy(requestDTO);
  }
}
