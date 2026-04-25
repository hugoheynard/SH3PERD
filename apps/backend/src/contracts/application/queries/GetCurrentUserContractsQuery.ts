import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Filter } from 'mongodb';
import type { TContractDomainModel, TContractRecord, TUserId } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IBaseCRUD } from '../../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';

export class GetCurrentUserContractsQuery {
  constructor(public readonly userId: TUserId) {}
}

/**
 * Returns the contracts visible to the current user as domain models.
 *
 * Per sh3-contracts.md, the recipient does not see a contract until
 * the company has signed and sent it. Drafts that have never been
 * sent stay hidden — the user only ever discovers a contract via the
 * `received` notification fired from the company-side signature.
 */
@QueryHandler(GetCurrentUserContractsQuery)
export class GetCurrentUserContractsHandler implements IQueryHandler<
  GetCurrentUserContractsQuery,
  TContractDomainModel[]
> {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IBaseCRUD<TContractRecord>) {}

  async execute(query: GetCurrentUserContractsQuery): Promise<TContractDomainModel[]> {
    const filter: Filter<TContractRecord> = {
      user_id: query.userId,
      'signatures.company': { $exists: true },
    };
    const records = await this.contractRepo.findMany({ filter });

    if (!records) {
      return [];
    }

    return records.map((record) => {
      const entity = new ContractEntity(RecordMetadataUtils.stripDocMetadata(record));
      return entity.toDomain;
    });
  }
}
