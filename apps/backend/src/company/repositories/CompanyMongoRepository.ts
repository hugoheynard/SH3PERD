import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TCompanyRecord, TCompanyId, TUserId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface ICompanyRepository extends IBaseCRUD<TCompanyRecord> {
  findById(id: TCompanyId): Promise<TCompanyRecord | null>;
  findByOwner(ownerId: TUserId): Promise<TCompanyRecord | null>;
}

export class CompanyMongoRepository
  extends BaseMongoRepository<TCompanyRecord>
  implements ICompanyRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findById(id: TCompanyId): Promise<TCompanyRecord | null> {
    return this.findOne({ filter: { id } });
  }

  async findByOwner(ownerId: TUserId): Promise<TCompanyRecord | null> {
    return this.findOne({ filter: { owner_id: ownerId } as any });
  }
}
