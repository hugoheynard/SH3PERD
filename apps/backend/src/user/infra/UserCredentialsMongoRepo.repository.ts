import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserCredentialsRecord } from '@sh3pherd/shared-types';
import { technicalFailThrows500 } from '../../utils/errorManagement/tryCatch/technicalFailThrows500.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { Injectable } from '@nestjs/common';

export type TSaveUserCredentialsFn = (input: { user: TUserCredentialsRecord }) => Promise<boolean>;
export type TFindUserCredentialsByEmailFn = (filter: {
  email: string;
}) => Promise<TUserCredentialsRecord | null>;

export type IUserCredentialsRepository = IBaseCRUD<TUserCredentialsRecord> & {
  saveUser: TSaveUserCredentialsFn;
  findUserByEmail: TFindUserCredentialsByEmailFn;
};

@Injectable()
export class UserCredentialsMongoRepository
  extends BaseMongoRepository<TUserCredentialsRecord>
  implements IUserCredentialsRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  @technicalFailThrows500('USER_PROFILE_SAVE_FAILED')
  public async saveUser(input: { user: TUserCredentialsRecord }): Promise<boolean> {
    const result = await this.collection.insertOne(input.user);
    return !(!result.acknowledged || !result.insertedId);
  }

  @technicalFailThrows500('USER_PROFILE_FIND_BY_EMAIL_FAILED')
  public async findUserByEmail(
    filter: Parameters<TFindUserCredentialsByEmailFn>[0],
  ): ReturnType<TFindUserCredentialsByEmailFn> {
    return await this.findOne({ filter });
  }
}
