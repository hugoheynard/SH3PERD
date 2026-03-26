import { Inject, Injectable } from '@nestjs/common';
import type { TTeamRecord, TCompanyId } from '@sh3pherd/shared-types';
import { CAST_REPO } from '../../company.tokens.js';
import type { ITeamRepository } from '../../repositories/TeamMongoRepository.js';

export type TGetCompanyTeamsDTO = {
  company_id: TCompanyId;
};

@Injectable()
export class GetCompanyTeamsUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly teamRepo: ITeamRepository,
  ) {}

  async execute(dto: TGetCompanyTeamsDTO): Promise<TTeamRecord[]> {
    return this.teamRepo.findByCompany(dto.company_id);
  }
}
