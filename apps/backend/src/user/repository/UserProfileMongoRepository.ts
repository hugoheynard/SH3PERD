import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserProfileRecord } from '@sh3pherd/shared-types';
import type {
  IUserProfileRepository,
  TFindUserProfileByUserIdFn,
  TSaveUserProfileFn,
} from '../types/user.profile.contracts.js';


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
    return this.create(input);
  };

  /**
   * Finds a user profile by user ID.
   * @param filter
   */
  @failThrows500('USER_PROFILE_FIND_BY_ID_FAILED')
  public async findUserProfileByUserId(filter: Parameters<TFindUserProfileByUserIdFn>[0]): ReturnType<TFindUserProfileByUserIdFn> {
    return await this.findOneDocBy(filter);
  };

}