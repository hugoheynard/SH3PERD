import { autoBind } from '../../utils/classUtils/autoBind.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TContractDomainModel } from '../types/contracts.domain.types.js';
import type {
  IContractRepository,
  TContractMongoRepositoryDeps,
  TMarkContractAsFavoriteFn,
} from '../types/contracts.core.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { TUserId } from '@sh3pherd/shared-types';

@autoBind
export class ContractMongoRepository
  extends BaseMongoRepository<TContractDomainModel>
  implements IContractRepository
{
  constructor(input: TContractMongoRepositoryDeps) {
    super(input);
  }

  @failThrows500('', '')
  async findById(filter: any) {
    const contract = await this.collection.findOne(filter);
    if (!contract) {
      return null;
    }
    return contract;
  }

  @failThrows500('FIND_FAVORITE_USER_CONTRACT_FAILED', 'Error while finding favorite user contract')
  async findUsersFavorite(user_id: TUserId): Promise<TContractDomainModel | null> {
    const result = await this.findDocBy({
      user_id,
      favorite: true,
    });

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

    let result: TContractDomainModel | null = null;
    const session = this.startSession();

    try {
      await session.withTransaction(async () => {
        // Unmark any existing favorite contract for the user
        await this.findOneAndUpdateDoc({
          filter: { user_id, favorite: true },
          update: { $set: { favorite: false } },
          options: { session },
        });

        // Mark the new favorite
        const newFavorite = await this.findOneAndUpdateDoc({
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
