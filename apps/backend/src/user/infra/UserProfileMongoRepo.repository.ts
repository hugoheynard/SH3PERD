import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserProfileRecord } from '@sh3pherd/shared-types';
import { Injectable } from '@nestjs/common';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export type IUserProfileRepository = IBaseCRUD<TUserProfileRecord>;

@Injectable()
export class UserProfileMongoRepository
  extends BaseMongoRepository<TUserProfileRecord>
  implements IUserProfileRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }
}
