import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TOrgNodeRecord, TOrgNodeId, TCompanyId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { Filter } from 'mongodb';

export type IOrgNodeRepository = {
  findById(id: TOrgNodeId): Promise<TOrgNodeRecord | null>;
  findByCompany(companyId: TCompanyId): Promise<TOrgNodeRecord[]>;
  findByParentId(parentId: TOrgNodeId, companyId: TCompanyId): Promise<TOrgNodeRecord[]>;
  findRootNodes(companyId: TCompanyId): Promise<TOrgNodeRecord[]>;
} & IBaseCRUD<TOrgNodeRecord>;

export class OrgNodeMongoRepository
  extends BaseMongoRepository<TOrgNodeRecord>
  implements IOrgNodeRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findById(id: TOrgNodeId): Promise<TOrgNodeRecord | null> {
    return this.findOne({ filter: { id } });
  }

  async findByCompany(companyId: TCompanyId): Promise<TOrgNodeRecord[]> {
    return this.findMany({ filter: { company_id: companyId } });
  }

  async findByParentId(parentId: TOrgNodeId, companyId: TCompanyId): Promise<TOrgNodeRecord[]> {
    const filter: Filter<TOrgNodeRecord> = { parent_id: parentId, company_id: companyId };
    return this.findMany({ filter });
  }

  async findRootNodes(companyId: TCompanyId): Promise<TOrgNodeRecord[]> {
    const filter: Filter<TOrgNodeRecord> = {
      company_id: companyId,
      parent_id: { $exists: false },
    };
    return this.findMany({
      filter,
    });
  }
}
