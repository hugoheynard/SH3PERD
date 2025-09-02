import { autoBind } from '../../../../utils/classUtils/autoBind.js';
import { BaseMongoRepository } from '../../../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserCredentialsRecord } from '@sh3pherd/shared-types';
import type {
  IUserCredentialsRepository,
  TFindUserCredentialsByEmailFn,
  TUserCredentialsMongoRepositoryDeps,
} from '../../../types/user.credentials.contracts.js';
import { failThrows500 } from '../../../../utils/errorManagement/tryCatch/failThrows500.js';


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

    if (!result.acknowledged || !result.insertedId) {
      return false;
    }
    return true;
  }

  @failThrows500('USER_PROFILE_FIND_BY_EMAIL_FAILED')
  public async findUserByEmail(
    filter: Parameters<TFindUserCredentialsByEmailFn>[0],
  ): ReturnType<TFindUserCredentialsByEmailFn> {
    return await this.findDocBy(filter);
  }
}
