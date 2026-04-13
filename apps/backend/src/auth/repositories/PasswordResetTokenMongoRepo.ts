import { Injectable } from '@nestjs/common';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TPasswordResetTokenRecord } from '@sh3pherd/shared-types';

export type IPasswordResetTokenRepository = IBaseCRUD<TPasswordResetTokenRecord>;

@Injectable()
export class PasswordResetTokenMongoRepository
  extends BaseMongoRepository<TPasswordResetTokenRecord>
  implements IPasswordResetTokenRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }
}
