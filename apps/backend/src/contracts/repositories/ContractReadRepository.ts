import { MONGO_CORE_DB } from '../../appBootstrap/database/db.tokens.js';
import type { TUserId, TContractRecord, TContractId, TUserProfileRecord, TCompanyId, TCompanyContractViewModel } from '@sh3pherd/shared-types';
import type { Collection } from 'mongodb';
import { Inject, Injectable } from '@nestjs/common';
import type { Db } from 'mongodb';


export interface IContractReadRepository {
  getContractListViewModel(userId: TUserId): Promise<any[]>;
  getContractWithUserProfile(idOrIds: TContractId | TContractId[] ): Promise<{ contract: TContractRecord; userProfile: TUserProfileRecord }[]>;
  getCompanyContractList(companyId: TCompanyId): Promise<TCompanyContractViewModel[]>;
}

@Injectable()
export class ContractReadRepository implements IContractReadRepository {
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

  async getCompanyContractList(companyId: TCompanyId): Promise<TCompanyContractViewModel[]> {
    return this.collection.aggregate<TCompanyContractViewModel>([
      { $match: { company_id: companyId } },
      {
        $lookup: {
          from: 'user_profiles',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'user_credentials',
          localField: 'user_id',
          foreignField: 'id',
          as: 'credentials',
        },
      },
      { $unwind: { path: '$credentials', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: 1,
          user_id: 1,
          user_first_name: '$profile.first_name',
          user_last_name: '$profile.last_name',
          user_email: '$credentials.email',
          status: 1,
          startDate: 1,
          endDate: 1,
        },
      },
    ]).toArray();
  }

  async getContractWithUserProfile(idOrIds: TContractId | TContractId[] ): Promise<{ contract: TContractRecord; userProfile: TUserProfileRecord }[]> {
    const isArray = Array.isArray(idOrIds);
    const ids = isArray ? idOrIds : [idOrIds];

    return this.collection.aggregate<{ contract: TContractRecord; userProfile: TUserProfileRecord }>([
      { $match: { id: { $in: ids } } },
      {
        $lookup: {
          from: "user_profiles",
          localField: "user_id",
          foreignField: "user_id",
          as: "userProfile"
        }
      },
      { $unwind: { path: "$userProfile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          contract: "$$ROOT",
          userProfile: "$userProfile",
        }
      },

      {
        $unset: ["contract.userProfile", "userProfile._id", "contract._id"]
      }
    ]).toArray();
  };
}