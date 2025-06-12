import { Body, Controller, Get, Post } from '@nestjs/common';


@Controller('musicRepertoire')
export class MusicRepertoireController {
  // This controller will handle routes related to music repertoire.
  // You can define methods here to handle specific requests, such as getting repertoire data,
  // adding new repertoire, updating existing ones, etc.

  constructor(){};

  @Get('/me')
  async me(@Body() requestDTO: any): Promise<void> {};


  @Post('/')
  async getRepertoire(@Body() requestDTO: any): Promise<any> {};
}