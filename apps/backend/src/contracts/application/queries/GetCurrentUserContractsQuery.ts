import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TContractDomainModel, TContractRecord, TUserId } from '@sh3pherd/shared-types';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IBaseCRUD } from '../../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { ContractEntity } from '../../domain/ContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';

export class GetCurrentUserContractsQuery {
  constructor(public readonly userId: TUserId) {}
}

/**
 * Returns all contracts belonging to the current user as domain models.
 *
 * Fetches raw records, reconstitutes each through ContractEntity,
 * and returns typed TContractDomainModel[].
 */
@QueryHandler(GetCurrentUserContractsQuery)
export class GetCurrentUserContractsHandler implements IQueryHandler<
  GetCurrentUserContractsQuery,
  TContractDomainModel[]
> {
  constructor(@Inject(CONTRACT_REPO) private readonly contractRepo: IBaseCRUD<TContractRecord>) {}

  async execute(query: GetCurrentUserContractsQuery): Promise<TContractDomainModel[]> {
    const records = await this.contractRepo.findMany({ filter: { user_id: query.userId } });

    if (!records) {
      return [];
    }

    return records.map((record) => {
      const entity = new ContractEntity(RecordMetadataUtils.stripDocMetadata(record));
      return entity.toDomain;
    });
  }
}
