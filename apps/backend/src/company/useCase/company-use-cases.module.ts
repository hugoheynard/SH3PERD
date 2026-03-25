import { Module } from '@nestjs/common';
import {
  COMPANY_USE_CASES,
  COMPANY_USE_CASES_FACTORY,
  CREATE_COMPANY_USE_CASE,
  CREATE_CAST_USE_CASE,
  ADD_CAST_MEMBER_USE_CASE,
  REMOVE_CAST_MEMBER_USE_CASE,
  GET_CAST_MEMBERS_USE_CASE,
} from '../company.tokens.js';
import { CompanyUseCasesFactory } from './CompanyUseCasesFactory.js';
import { CreateCompanyUseCase } from './company/CreateCompanyUseCase.js';
import { CreateCastUseCase } from './cast/CreateCastUseCase.js';
import { AddCastMemberUseCase } from './cast/AddCastMemberUseCase.js';
import { RemoveCastMemberUseCase } from './cast/RemoveCastMemberUseCase.js';
import { GetCastMembersUseCase } from './cast/GetCastMembersUseCase.js';

@Module({
  providers: [
    { provide: COMPANY_USE_CASES_FACTORY, useClass: CompanyUseCasesFactory },
    {
      provide: COMPANY_USE_CASES,
      useFactory: (factory: CompanyUseCasesFactory) => factory.create(),
      inject: [COMPANY_USE_CASES_FACTORY],
    },
    { provide: CREATE_COMPANY_USE_CASE, useClass: CreateCompanyUseCase },
    { provide: CREATE_CAST_USE_CASE, useClass: CreateCastUseCase },
    { provide: ADD_CAST_MEMBER_USE_CASE, useClass: AddCastMemberUseCase },
    { provide: REMOVE_CAST_MEMBER_USE_CASE, useClass: RemoveCastMemberUseCase },
    { provide: GET_CAST_MEMBERS_USE_CASE, useClass: GetCastMembersUseCase },
  ],
  exports: [COMPANY_USE_CASES],
})
export class CompanyUseCasesModule {}
