import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserCredentialsRecord, TUserId, TUserPreferencesRecord, TUserProfileRecord } from '@sh3pherd/shared-types';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { Injectable } from '@nestjs/common';
import { User } from '../domain/User.aggregate.js';
import { UserProfileEntity } from '../domain/UserProfileEntity.js';
import { UserCredentialEntity } from '../domain/UserCredential.entity.js';
import { UserPreferences } from '../domain/UserPreferences.entity.js';


export type TSaveUserCredentialsFn = (input: { user: TUserCredentialsRecord }) => Promise<boolean>;
export type TFindUserCredentialsByEmailFn = (filter: { email: string }) => Promise<TUserCredentialsRecord | null>;

export type IUserCredentialsRepository = IBaseCRUD<TUserCredentialsRecord> & {
  saveUser: TSaveUserCredentialsFn;
  findUserByEmail: TFindUserCredentialsByEmailFn;
  findOneUser: (user_id: TUserId) => Promise<User>;
};

@Injectable()
export class UserCredentialsMongoRepository
  extends BaseMongoRepository<TUserCredentialsRecord>
  implements IUserCredentialsRepository
{
  constructor(input: TBaseMongoRepoDeps) {
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
    return await this.findOne({ filter });
  }

  /**
   * Pipeline to get the current user details.
   * aggregate pipeline to fetch user profile and preferences by user_id.
   * @param user_id
   */
  //TODO: Move this to a dedicated repository 'UserQueryRepository'
  public async findOneUser(user_id: TUserId): Promise<User> {
      const [result] = await this.collection
        .aggregate([
          { $match: { id: user_id } },
          { $lookup: { from: "user_profiles", localField: "id", foreignField: "user_id", as: "profile" }},
          { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "user_preferences", localField: "id", foreignField: "user_id", as: "preferences"} },
          { $unwind: { path: '$preferences', preserveNullAndEmptyArrays: true } },
          { $unset: ["profile._id", "profile.user_id", "preferences._id", 'preferences.user_id'] },
          { $project: {
              _id: 0,
              credentials: {
                id: "$id",
                email: "$email",
                password: "$password",
                email_verified: "$email_verified",
                active: "$active",
              },
              profile: 1,
              preferences: 1
            }
          },
          { $limit: 1 }
        ])
        .toArray();

    if (!result) {
      throw new Error(`User with id ${user_id} not found`);
    }

    const { credentials, profile, preferences } = result;

    return new User(
      UserProfileEntity.fromRecord(profile as TUserProfileRecord),
      UserCredentialEntity.fromRecord(credentials as TUserCredentialsRecord),
      UserPreferences.fromRecord(preferences as TUserPreferencesRecord),
    );
  };
}
