import { Inject, Injectable } from '@nestjs/common';
import {
  CREATE_COMPANY_USE_CASE,
  CREATE_CAST_USE_CASE,
  ADD_CAST_MEMBER_USE_CASE,
  REMOVE_CAST_MEMBER_USE_CASE,
  GET_CAST_MEMBERS_USE_CASE,
} from '../company.tokens.js';
import type { CreateCompanyUseCase, TCreateCompanyDTO } from './company/CreateCompanyUseCase.js';
import type { CreateCastUseCase, TCreateCastDTO } from './cast/CreateCastUseCase.js';
import type { AddCastMemberUseCase, TAddCastMemberDTO } from './cast/AddCastMemberUseCase.js';
import type { RemoveCastMemberUseCase, TRemoveCastMemberDTO } from './cast/RemoveCastMemberUseCase.js';
import type { GetCastMembersUseCase, TGetCastMembersDTO } from './cast/GetCastMembersUseCase.js';
import type { TUserId, TCompanyRecord, TCastRecord, TCastMembershipEventRecord, TCastMemberViewModel } from '@sh3pherd/shared-types';

export type TCompanyUseCases = {
  createCompany: (dto: TCreateCompanyDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  createCast: (dto: TCreateCastDTO, actorId: TUserId) => Promise<TCastRecord>;
  addCastMember: (dto: TAddCastMemberDTO, actorId: TUserId) => Promise<TCastMembershipEventRecord>;
  removeCastMember: (dto: TRemoveCastMemberDTO, actorId: TUserId) => Promise<TCastMembershipEventRecord>;
  getCastMembers: (dto: TGetCastMembersDTO) => Promise<TCastMemberViewModel[]>;
};

@Injectable()
export class CompanyUseCasesFactory {
  constructor(
    @Inject(CREATE_COMPANY_USE_CASE) private readonly createCompanyUC: CreateCompanyUseCase,
    @Inject(CREATE_CAST_USE_CASE) private readonly createCastUC: CreateCastUseCase,
    @Inject(ADD_CAST_MEMBER_USE_CASE) private readonly addMemberUC: AddCastMemberUseCase,
    @Inject(REMOVE_CAST_MEMBER_USE_CASE) private readonly removeMemberUC: RemoveCastMemberUseCase,
    @Inject(GET_CAST_MEMBERS_USE_CASE) private readonly getMembersUC: GetCastMembersUseCase,
  ) {}

  create(): TCompanyUseCases {
    return {
      createCompany: (dto, actorId) => this.createCompanyUC.execute(dto, actorId),
      createCast: (dto, actorId) => this.createCastUC.execute(dto, actorId),
      addCastMember: (dto, actorId) => this.addMemberUC.execute(dto, actorId),
      removeCastMember: (dto, actorId) => this.removeMemberUC.execute(dto, actorId),
      getCastMembers: (dto) => this.getMembersUC.execute(dto),
    };
  }
}
