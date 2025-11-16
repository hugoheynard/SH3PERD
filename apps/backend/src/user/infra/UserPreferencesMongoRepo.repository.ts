
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserPreferencesRecord } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { Injectable } from '@nestjs/common';



/**
 * Repository interface for user preferences, extending basic CRUD operations.
 */
export interface IUserPreferencesRepository extends IBaseCRUD<TUserPreferencesRecord> {}

@Injectable()
export class UserPreferencesMongoRepository
  extends BaseMongoRepository<TUserPreferencesRecord>
  implements IUserPreferencesRepository {

  constructor(deps: TBaseMongoRepoDeps) {
    super(deps);
  };



}