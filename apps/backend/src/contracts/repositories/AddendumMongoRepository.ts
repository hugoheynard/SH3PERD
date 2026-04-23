import type { Filter } from 'mongodb';
import type { TContractAddendumRecord, TContractId, TAddendumId } from '@sh3pherd/shared-types';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';

export type IAddendumRepository = {
  insert(record: TContractAddendumRecord): Promise<TContractAddendumRecord>;
  findById(id: TAddendumId): Promise<TContractAddendumRecord | null>;
  findByContractId(contractId: TContractId): Promise<TContractAddendumRecord[]>;
  patch(input: {
    filter: Filter<TContractAddendumRecord>;
    update: object;
    options?: object;
  }): Promise<TContractAddendumRecord | null>;
};

export class AddendumMongoRepository
  extends BaseMongoRepository<TContractAddendumRecord>
  implements IAddendumRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @technicalFailThrows500('ADDENDUM_SAVE_FAILED', 'Failed to save addendum')
  async insert(record: TContractAddendumRecord): Promise<TContractAddendumRecord> {
    await this.save(record);
    return record;
  }

  @technicalFailThrows500('ADDENDUM_FIND_FAILED', 'Failed to find addendum')
  async findById(id: TAddendumId): Promise<TContractAddendumRecord | null> {
    return this.findOne({ filter: { id } as Filter<TContractAddendumRecord> });
  }

  @technicalFailThrows500('ADDENDUM_LIST_FAILED', 'Failed to list addenda')
  async findByContractId(contractId: TContractId): Promise<TContractAddendumRecord[]> {
    return this.findMany({
      filter: { contract_id: contractId } as Filter<TContractAddendumRecord>,
      options: { sort: { createdAt: -1 } },
    });
  }

  @technicalFailThrows500('ADDENDUM_UPDATE_FAILED', 'Failed to update addendum')
  async patch(input: {
    filter: Filter<TContractAddendumRecord>;
    update: object;
    options?: object;
  }): Promise<TContractAddendumRecord | null> {
    return this.updateOne(input as Parameters<typeof this.updateOne>[0]);
  }
}
