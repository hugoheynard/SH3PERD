import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TIntegrationCredentialsRecord,
  TIntegrationCredentialsId,
  TCompanyId,
  TCommunicationPlatform,
} from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface IIntegrationCredentialsRepository extends IBaseCRUD<TIntegrationCredentialsRecord> {
  findById(id: TIntegrationCredentialsId): Promise<TIntegrationCredentialsRecord | null>;
  findByCompanyAndPlatform(companyId: TCompanyId, platform: TCommunicationPlatform): Promise<TIntegrationCredentialsRecord | null>;
  findByCompany(companyId: TCompanyId): Promise<TIntegrationCredentialsRecord[]>;
}

export class IntegrationCredentialsMongoRepository
  extends BaseMongoRepository<TIntegrationCredentialsRecord>
  implements IIntegrationCredentialsRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findById(id: TIntegrationCredentialsId): Promise<TIntegrationCredentialsRecord | null> {
    return this.findOne({ filter: { id } });
  }

  async findByCompanyAndPlatform(companyId: TCompanyId, platform: TCommunicationPlatform): Promise<TIntegrationCredentialsRecord | null> {
    return this.findOne({ filter: { company_id: companyId, platform } as any });
  }

  async findByCompany(companyId: TCompanyId): Promise<TIntegrationCredentialsRecord[]> {
    return this.findMany({ filter: { company_id: companyId } as any });
  }
}
