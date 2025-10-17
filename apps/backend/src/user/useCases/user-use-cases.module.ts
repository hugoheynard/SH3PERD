import { Module } from '@nestjs/common';
import { GET_USER_ME_USE_CASE, USER_USE_CASES, USER_USE_CASES_FACTORY } from '../user.tokens.js';
import { GetUserMeUseCase } from './GetUserMeUseCase.js';
import { UserUseCasesFactory } from './UserUseCasesFactory.js';

@Module({
  imports: [],
  providers: [
    { provide: USER_USE_CASES_FACTORY, useClass: UserUseCasesFactory },
    {
      provide: USER_USE_CASES,
      useFactory: (factory: UserUseCasesFactory) => factory.create(),
      inject: [USER_USE_CASES_FACTORY],
    },
    { provide: GET_USER_ME_USE_CASE, useClass: GetUserMeUseCase },

  ],
  exports: [USER_USE_CASES],
})
export class UserUseCasesModule {}
