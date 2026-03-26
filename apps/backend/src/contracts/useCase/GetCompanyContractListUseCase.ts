import { Inject, Injectable } from '@nestjs/common';
import type { TCompanyContractViewModel, TCompanyId } from '@sh3pherd/shared-types';
import { CONTRACT_READ_REPO } from '../../appBootstrap/nestTokens.js';
import type { ContractReadRepository } from '../repositories/ContractReadRepository.js';

@Injectable()
export class GetCompanyContractListUseCase {
  constructor(
    @Inject(CONTRACT_READ_REPO) private readonly readRepo: ContractReadRepository,
  ) {}

  async execute(companyId: TCompanyId): Promise<TCompanyContractViewModel[]> {
    return this.readRepo.getCompanyContractList(companyId);
  }
}
