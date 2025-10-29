import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { TContractRecord, TUserId, TContractId } from '@sh3pherd/shared-types';
import type { Filter } from 'mongodb';
import type { TContractViewModel } from '../useCase/GetCurrentUserContracts.useCase.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';


export interface IContractRepository extends IBaseCRUD<TContractRecord> {
  markContractAsFavorite: (input: {
    contract_id: TContractId;
    user_id: TUserId;
  }) => Promise<TContractRecord | null>;
}

export type TCreateContractFn = IContractRepository['save'];
export type TMarkContractAsFavoriteFn = IContractRepository['markContractAsFavorite'];

export class ContractMongoRepository
  extends BaseMongoRepository<TContractRecord>
  implements IContractRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async contractViewModelPipelineByFilter(
    filter: Filter<TContractRecord>
  ): Promise<TContractViewModel[]> {

    return this.collection
      .aggregate<TContractViewModel>([
        { $match: filter },
        {
          $lookup: {
            from: 'user_profiles',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'companies',
            localField: 'company_id',
            foreignField: 'company_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        {
          $project: {
            contract_id: 1,
            //company_id: 1,
            //user_id: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            'viewDetails.user.firstname': '$user.firstname',
            'viewDetails.user.lastname': '$user.lastname',
            'viewDetails.company.name': '$company.name',
          },
        },
      ])
      .toArray();
  };












  @failThrows500('', '')
  async findById(filter: any) {
    const contract = await this.collection.findOne(filter);
    if (!contract) {
      return null;
    }
    return contract;
  }

  @failThrows500('FIND_FAVORITE_USER_CONTRACT_FAILED', 'Error while finding favorite user contract')
  async findUsersFavorite(user_id: TUserId): Promise<TContractRecord | null> {
    const result = await this.findOne({ filter: { user_id, favorite: true }});

    if (!result) {
      return null;
    }
    return result;
  }

  /**
   * Marks a specific contract as the user's favorite, ensuring only one favorite exists at a time.
   *
   * This method runs within a MongoDB transaction. It first un marks any existing favorite
   * contract associated with the given user, then marks the specified contract as favorite.
   *
   * @param input - The input object containing `contract_id` and `user_id`.
   * @returns The updated contract marked as favorite, or `null` if the update fails.
   *
   * @throws If the transaction fails or MongoDB encounters an error.
   */
  @failThrows500('MARK_CONTRACT_AS_FAVORITE_FAILED', 'Error while marking as favorite')
  async markContractAsFavorite(
    input: Parameters<TMarkContractAsFavoriteFn>[0],
  ): ReturnType<TMarkContractAsFavoriteFn> {
    const { contract_id, user_id } = input;

    let result: TContractRecord | null = null;
    const session = this.startSession();

    try {
      await session.withTransaction(async () => {
        // Unmark any existing favorite contract for the user
        await this.updateOne({
          filter: { user_id, favorite: true },
          update: { $set: { favorite: false } },
          options: { session },
        });

        // Mark the new favorite
        const newFavorite = await this.updateOne({
          filter: { contract_id },
          update: { $set: { favorite: true } },
          options: {
            returnDocument: 'after',
            session,
          },
        });

        result = newFavorite ?? null;
      });
    } finally {
      await session.endSession();
    }

    return result;
  }
}
