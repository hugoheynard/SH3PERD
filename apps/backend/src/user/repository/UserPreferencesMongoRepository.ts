import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserPreferencesRecord } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

/**
 * Repository interface for user preferences, extending basic CRUD operations.
 */
export type TUserPreferencesRepository = IBaseCRUD<TUserPreferencesRecord> & {};

export class UserPreferencesMongoRepository
  extends BaseMongoRepository<TUserPreferencesRecord>
  implements TUserPreferencesRepository {

  constructor(deps: TBaseMongoRepoDeps) {
    super(deps);
  };



}