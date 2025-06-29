import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type { Request } from 'express';

@Controller('musicRepertoire')
export class MusicRepertoireController {
  // This controller will handle routes related to music repertoire.
  // You can define methods here to handle specific requests, such as getting repertoire data,
  // adding new repertoire, updating existing ones, etc.

  constructor(
    @Inject(USE_CASES_TOKENS.musicRepertoire)
    private readonly uc: TCoreUseCasesTypeMap['musicRepertoire'],
  ) {}

  @Post('/me')
  async me(@Body() requestDTO: any, @Req() req: Request): Promise<any> {
    return this.uc.getMusicRepertoireByUserId({
      asker_user_id: req.user_id,
      target_user_id: req.user_id,
      filter: requestDTO.filter
    });
  }

  @Post('/')
  async getRepertoire(@Body() requestDTO: any): Promise<any> {
    return this.uc.getMusicRepertoireByUserId(requestDTO);
  }
}
