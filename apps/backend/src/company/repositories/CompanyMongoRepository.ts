import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TCompanyRecord, TCompanyId, TUserId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export type ICompanyRepository = {
  findById(id: TCompanyId): Promise<TCompanyRecord | null>;
  findByUser(userId: TUserId): Promise<TCompanyRecord[]>;
} & IBaseCRUD<TCompanyRecord>;

export class CompanyMongoRepository
  extends BaseMongoRepository<TCompanyRecord>
  implements ICompanyRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findById(id: TCompanyId): Promise<TCompanyRecord | null> {
    return this.findOne({ filter: { id } });
  }

  /**
   * Returns all companies where the user has an active contract.
   * Uses a MongoDB aggregation to join contracts → companies in a single query.
   */
  async findByUser(userId: TUserId): Promise<TCompanyRecord[]> {
    const results = await this.collection
      .aggregate<TCompanyRecord>([
        {
          $lookup: {
            from: 'contracts',
            localField: 'id',
            foreignField: 'company_id',
            as: '_contracts',
          },
        },
        {
          $match: {
            _contracts: {
              $elemMatch: { user_id: userId, status: 'active' },
            },
          },
        },
        { $project: { _id: 0, _contracts: 0 } },
      ])
      .toArray();

    return results;
  }
}
