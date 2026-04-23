import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractDetailViewModel, TContractId } from '@sh3pherd/shared-types';
import { ADDENDUM_REPO, CONTRACT_READ_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IContractReadRepository } from '../../repositories/ContractReadRepository.js';
import type { IAddendumRepository } from '../../repositories/AddendumMongoRepository.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class GetContractByIdQuery {
  constructor(public readonly contractId: TContractId) {}
}

@QueryHandler(GetContractByIdQuery)
export class GetContractByIdHandler implements IQueryHandler<
  GetContractByIdQuery,
  TContractDetailViewModel
> {
  constructor(
    @Inject(CONTRACT_READ_REPO) private readonly readRepo: IContractReadRepository,
    @Inject(ADDENDUM_REPO) private readonly addendumRepo: IAddendumRepository,
  ) {}

  async execute(query: GetContractByIdQuery): Promise<TContractDetailViewModel> {
    const [results, addenda] = await Promise.all([
      this.readRepo.getContractWithUserProfile(query.contractId),
      this.addendumRepo.findByContractId(query.contractId),
    ]);

    if (!results.length)
      throw new BusinessError('Contract not found', { code: 'CONTRACT_NOT_FOUND', status: 404 });

    const { contract, userProfile } = results[0];

    return {
      id: contract.id,
      user_id: contract.user_id,
      user_first_name: userProfile?.first_name,
      user_last_name: userProfile?.last_name,
      company_id: contract.company_id,
      roles: contract.roles ?? [],
      status: contract.status,
      contract_type: contract.contract_type,
      job_title: contract.job_title,
      startDate: contract.startDate,
      endDate: contract.endDate,
      trial_period_days: contract.trial_period_days,
      compensation: contract.compensation,
      work_time: contract.work_time,
      signatures: contract.signatures,
      documents: contract.documents,
      addenda,
    };
  }
}
