import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TCastRecord, TCastId, TCompanyId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface ICastRepository extends IBaseCRUD<TCastRecord> {
  findById(id: TCastId): Promise<TCastRecord | null>;
  findByCompany(companyId: TCompanyId): Promise<TCastRecord[]>;
}

export class CastMongoRepository
  extends BaseMongoRepository<TCastRecord>
  implements ICastRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findById(id: TCastId): Promise<TCastRecord | null> {
    return this.findOne({ filter: { id } });
  }

  async findByCompany(companyId: TCompanyId): Promise<TCastRecord[]> {
    return this.findMany({ filter: { company_id: companyId } });
  }
}
