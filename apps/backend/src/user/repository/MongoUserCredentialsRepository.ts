import { autoBind } from '../../utils/classUtils/autoBind.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserCredentialsRecord } from '@sh3pherd/shared-types';
import type {
  IUserCredentialsRepository,
  TFindUserCredentialsByEmailFn,
  TUserCredentialsMongoRepositoryDeps,
} from '../types/user.credentials.contracts.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { TUserId, TUserMeViewModel } from '@sh3pherd/shared-types';



@autoBind
export class UserCredentialsMongoRepository
  extends BaseMongoRepository<TUserCredentialsRecord>
  implements IUserCredentialsRepository
{
  constructor(input: TUserCredentialsMongoRepositoryDeps) {
    super(input);
  }

  @failThrows500('USER_PROFILE_SAVE_FAILED')
  public async saveUser(input: { user: TUserCredentialsRecord }): Promise<boolean> {
    const result = await this.collection.insertOne(input.user);

    return !(!result.acknowledged || !result.insertedId);
  }

  @failThrows500('USER_PROFILE_FIND_BY_EMAIL_FAILED')
  public async findUserByEmail(
    filter: Parameters<TFindUserCredentialsByEmailFn>[0],
  ): ReturnType<TFindUserCredentialsByEmailFn> {
    return await this.findOneDocBy(filter);
  }

  /**
   * Pipeline to get the current user details.
   * aggregate pipeline to fetch user profile and preferences by user_id.
   * @param user_id
   */
  //TODO: Move this to a dedicated repository 'UserQueryRepository'
  public async getUserMe(user_id: TUserId): Promise<TUserMeViewModel> {
      const results = await this.collection
        .aggregate<TUserMeViewModel>([
          { $match: { user_id } },
          { $lookup: { from: "user_profiles", localField: "user_id", foreignField: "user_id", as: "profile" }},
          { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "user_preferences", localField: "user_id", foreignField: "user_id", as: "preferences"} },
          { $unwind: { path: '$preferences', preserveNullAndEmptyArrays: true } },
          { $unset: ["profile._id", "profile.user_id", "preferences._id", 'preferences.user_id'] },
          { $project: {
              _id: 0,
              user_id: 1,
              profile: 1,
              preferences: 1
            }
          },
          { $limit: 1 }
        ])
        .toArray();

    return results[0];
  };
}
