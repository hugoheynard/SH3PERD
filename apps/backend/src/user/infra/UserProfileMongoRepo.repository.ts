import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserProfileRecord, TUserId} from '@sh3pherd/shared-types';
import type { TFindUserProfileByUserIdFn, TSaveUserProfileFn } from '../profile/user.profile.contracts.js';
import { Injectable } from '@nestjs/common';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { UserProfileAggregateRoot } from '../domain/UserProfileAggregateRoot.js';
import { UserProfileMapper } from './UserProfileMapper.js';

export interface IUserProfileRepository extends IBaseCRUD<TUserProfileRecord>{
  saveUserProfile: TSaveUserProfileFn;
  findUserProfileByUserId: TFindUserProfileByUserIdFn;
  findOneByUserId: (user_id: TUserId) => Promise<UserProfileAggregateRoot | null>
  updateOneFromAR: (ar: UserProfileAggregateRoot) => Promise<TUserProfileRecord | null>;
}

@Injectable()
export class UserProfileMongoRepository
  extends BaseMongoRepository<TUserProfileRecord>
  implements IUserProfileRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  };

  /**
   * saves a user profile to the database.
   * @param input
   * */
  @failThrows500('USER_PROFILE_SAVE_FAILED')
  public async saveUserProfile(input: Parameters<TSaveUserProfileFn>[0]): ReturnType<TSaveUserProfileFn> {
    return this.save(input);
  };

  /**
   * Finds a user profile by user ID.
   * @param filter
   */
  @failThrows500('USER_PROFILE_FIND_BY_ID_FAILED')
  public async findUserProfileByUserId(filter: Parameters<TFindUserProfileByUserIdFn>[0]): ReturnType<TFindUserProfileByUserIdFn> {
    return await this.findOne({ filter });
  };

  /**
   * Finds one UserProfileAggregateRoot by user ID.
   * @param user_id
   * @return {Promise<UserProfileAggregateRoot | null>}
   */
  async findOneByUserId(user_id: TUserId): Promise<UserProfileAggregateRoot | null> {
    const result = await this.findOne({ filter: { user_id } });

    if (!result) {
      return null;
    }

    return UserProfileMapper.recordToAggregate(result);
  };

  /**
   * Updates one user profile from an aggregate root.
   * @param ar
   */
  async updateOneFromAR(ar: UserProfileAggregateRoot): Promise<TUserProfileRecord | null> {

    const result = await this.updateOne({
      filter: { id: ar.id },
      update: ar.getUpdateObject()
    });

    if (!result) {
      return null;
    }

    ar.commit();
    return result;
  };

}