import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserPreferencesRecord } from '@sh3pherd/shared-types';

export class UserPreferencesMongoRepository
  extends BaseMongoRepository<TUserPreferencesRecord> {
  constructor(deps: TBaseMongoRepoDeps) {
    super(deps);
  };



}