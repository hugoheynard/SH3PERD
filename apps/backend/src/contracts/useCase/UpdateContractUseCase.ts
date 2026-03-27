import { Inject, Injectable } from '@nestjs/common';
import type { TContractRecord, TUpdateContractDTO } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../appBootstrap/nestTokens.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { IContractRepository } from '../repositories/ContractMongoRepository.js';

@Injectable()
export class UpdateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
  ) {}

  async execute(dto: TUpdateContractDTO): Promise<TContractRecord> {
    const $set:   Record<string, unknown> = {};
    const $unset: Record<string, ''> = {};

    if (dto.status        !== undefined) $set['status']        = dto.status;
    if (dto.contract_type !== undefined) $set['contract_type'] = dto.contract_type;
    if (dto.job_title     !== undefined) $set['job_title']     = dto.job_title;
    if (dto.startDate     !== undefined) $set['startDate']     = dto.startDate;

    if ('endDate' in dto) {
      dto.endDate === null ? $unset['endDate'] = '' : $set['endDate'] = dto.endDate;
    }
    if ('trial_period_days' in dto) {
      dto.trial_period_days === null ? $unset['trial_period_days'] = '' : $set['trial_period_days'] = dto.trial_period_days;
    }
    if ('compensation' in dto) {
      dto.compensation === null ? $unset['compensation'] = '' : $set['compensation'] = dto.compensation;
    }
    if ('work_time' in dto) {
      dto.work_time === null ? $unset['work_time'] = '' : $set['work_time'] = dto.work_time;
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length)   update['$set']   = $set;
    if (Object.keys($unset).length) update['$unset'] = $unset;

    if (!Object.keys(update).length) {
      throw new TechnicalError('Nothing to update', 'CONTRACT_EMPTY_UPDATE', 400);
    }

    const updated = await this.contractRepo.updateOne({
      filter:  { id: dto.contract_id } as any,
      update,
      options: { returnDocument: 'after' },
    });

    if (!updated) {
      throw new TechnicalError('Contract not found or update failed', 'CONTRACT_UPDATE_FAILED', 404);
    }
    return updated;
  }
}
