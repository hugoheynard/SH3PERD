import { Module } from '@nestjs/common';
import { UserProfileController } from '../api/user-profile.controller.js';

@Module({
  imports: [],
  controllers: [UserProfileController],
})
export class UserProfileModule {}
