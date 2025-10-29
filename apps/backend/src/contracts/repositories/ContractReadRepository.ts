import { MONGO_CORE_DB } from '../../appBootstrap/database/db.tokens.js';
import type { TUserId, TContractRecord } from '@sh3pherd/shared-types';
import type { Collection } from 'mongodb';
import { Inject, Injectable } from '@nestjs/common';
import type { Db } from 'mongodb';


@Injectable()
export class ContractReadRepository {
  private readonly collection: Collection<TContractRecord>;

  constructor(@Inject(MONGO_CORE_DB) private readonly db: Db) {
    this.collection = this.db.collection('contracts');
  };

  /**
   * Get contract list view model for a specific user
   * @param userId
   */
  async getContractListViewModel(userId: TUserId): Promise<any[]> {

    return this.collection.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: 'id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          id: 1,
          company_id: '$company.id',
          company_name: '$company.name',
          startDate: 1,
          endDate: 1,
          status: 1,
        },
      },
    ]).toArray();
  };
}