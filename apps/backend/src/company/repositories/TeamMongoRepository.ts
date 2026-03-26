import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TTeamRecord, TTeamId, TCompanyId, TServiceId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface ITeamRepository extends IBaseCRUD<TTeamRecord> {
  findById(id: TTeamId): Promise<TTeamRecord | null>;
  findByCompany(companyId: TCompanyId): Promise<TTeamRecord[]>;
  findByServiceId(serviceId: TServiceId, companyId: TCompanyId): Promise<TTeamRecord[]>;
}

export class TeamMongoRepository
  extends BaseMongoRepository<TTeamRecord>
  implements ITeamRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findById(id: TTeamId): Promise<TTeamRecord | null> {
    return this.findOne({ filter: { id } });
  }

  async findByCompany(companyId: TCompanyId): Promise<TTeamRecord[]> {
    return this.findMany({ filter: { company_id: companyId } });
  }

  async findByServiceId(serviceId: TServiceId, companyId: TCompanyId): Promise<TTeamRecord[]> {
    return this.findMany({ filter: { service_id: serviceId, company_id: companyId } as any });
  }
}
