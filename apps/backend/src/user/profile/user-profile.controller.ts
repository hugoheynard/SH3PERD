import { Controller, Get, Patch } from '@nestjs/common';

@Controller()
export class UserProfileController {
  constructor() {};


  @Get('me')
  async getCurrentUserProfile() {

  };

  @Patch('me')
  async updateUserProfile() {

  };

}
