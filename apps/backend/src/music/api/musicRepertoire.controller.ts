import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';

@Controller('musicRepertoire')
export class MusicRepertoireController {
  // This controller will handle routes related to music repertoire.
  // You can define methods here to handle specific requests, such as getting repertoire data,
  // adding new repertoire, updating existing ones, etc.

  constructor(
    @Inject(USE_CASES_TOKENS.musicRepertoire)
    private readonly uc: TCoreUseCasesTypeMap['musicRepertoire'],
  ) {}

  @Get('/me')
  async me(@Body() requestDTO: any): Promise<unknown> {
    return this.uc.getMusicRepertoireByUserId(requestDTO);
  }

  @Post('/')
  async getRepertoire(@Body() requestDTO: any): Promise<any> {
    return this.uc.getMusicRepertoireByUserId(requestDTO);
  }
}
