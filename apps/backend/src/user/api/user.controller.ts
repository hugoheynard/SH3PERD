import { Controller, Get, /*Req*/ } from '@nestjs/common';
//import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor() {};


  @Get('me')
  getUserProfile_Me(/*@Req() req: Request*/) {
  };
}
