import { Module } from '@nestjs/common';
import { GET_USER_ME_USE_CASE } from '../user.tokens.js';
import { GetUserMeUseCase } from './GetUserMeUseCase.js';

@Module({
  imports: [],
  providers: [
    { provide: GET_USER_ME_USE_CASE, useClass: GetUserMeUseCase },

  ],
  exports: [],
})
export class UserUseCasesModule {}
