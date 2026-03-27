import { Inject, Injectable } from '@nestjs/common';
import type { TContractId, TContractDetailViewModel } from '@sh3pherd/shared-types';
import { CONTRACT_READ_REPO } from '../../appBootstrap/nestTokens.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { ContractReadRepository } from '../repositories/ContractReadRepository.js';

@Injectable()
export class GetContractByIdUseCase {
  constructor(
    @Inject(CONTRACT_READ_REPO) private readonly readRepo: ContractReadRepository,
  ) {}

  async execute(contractId: TContractId): Promise<TContractDetailViewModel> {
    const results = await this.readRepo.getContractWithUserProfile(contractId);
    if (!results.length) {
      throw new TechnicalError('Contract not found', 'CONTRACT_NOT_FOUND', 404);
    }
    const { contract, userProfile } = results[0];
    return {
      id:                 contract.id,
      user_id:            contract.user_id,
      user_first_name:    userProfile?.first_name,
      user_last_name:     userProfile?.last_name,
      company_id:         contract.company_id,
      status:             contract.status,
      contract_type:      contract.contract_type,
      job_title:          contract.job_title,
      startDate:          contract.startDate,
      endDate:            contract.endDate,
      trial_period_days:  contract.trial_period_days,
      compensation:       contract.compensation,
      work_time:          contract.work_time,
      signatures:         contract.signatures,
    };
  }
}
