import { GET_USER_ME_USE_CASE } from '../user.tokens.js';
import { Inject, Injectable } from '@nestjs/common';

export type TUserUseCases = {
  getUserMe: any;
  updateUserPreferences: any;
};

@Injectable()
export class UserUseCasesFactory {
  constructor(
    @Inject(GET_USER_ME_USE_CASE) private readonly getUserMeUseCase: any,
  ){};

  create(): TUserUseCases {
    return {
      getUserMe: (dto: any) =>this.getUserMeUseCase.execute(dto),
      updateUserPreferences: () => { /* Implementation here */ },
    };
  }
}