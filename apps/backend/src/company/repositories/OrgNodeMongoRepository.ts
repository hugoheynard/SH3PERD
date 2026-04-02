import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TOrgNodeRecord, TOrgNodeId, TCompanyId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface IOrgNodeRepository extends IBaseCRUD<TOrgNodeRecord> {
  findById(id: TOrgNodeId): Promise<TOrgNodeRecord | null>;
  findByCompany(companyId: TCompanyId): Promise<TOrgNodeRecord[]>;
  /** Find direct children of a parent node */
  findByParentId(parentId: TOrgNodeId, companyId: TCompanyId): Promise<TOrgNodeRecord[]>;
  /** Find root nodes (depth 0) — those with no parent */
  findRootNodes(companyId: TCompanyId): Promise<TOrgNodeRecord[]>;
}

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
    return this.findMany({ filter: { parent_id: parentId, company_id: companyId } as any });
  }

  async findRootNodes(companyId: TCompanyId): Promise<TOrgNodeRecord[]> {
    return this.findMany({
      filter: {
        company_id: companyId,
        $or: [{ parent_id: { $exists: false } }, { parent_id: null }],
      } as any,
    });
  }
}
