import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserProfileRecord } from '@sh3pherd/shared-types';
import type { TFindUserProfileByUserIdFn, TSaveUserProfileFn } from './user.profile.contracts.js';
import { Injectable } from '@nestjs/common';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface IUserProfileRepository extends IBaseCRUD<TUserProfileRecord>{
  saveUserProfile: TSaveUserProfileFn;
  findUserProfileByUserId: TFindUserProfileByUserIdFn;
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

}