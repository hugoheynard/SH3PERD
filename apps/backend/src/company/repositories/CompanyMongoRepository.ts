import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type { TCompanyRecord } from '@sh3pherd/shared-types';

export class CompanyMongoRepository
  extends BaseMongoRepository<TCompanyRecord>
  //implements ICompanyRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  };

  async saveOne(doc: TCompanyRecord): Promise<boolean> {
    return this.save(doc)
  };
}