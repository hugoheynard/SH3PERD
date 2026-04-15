import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TIntegrationCredentialsRecord,
  TIntegrationCredentialsId,
  TCompanyId,
  TCommunicationPlatform,
} from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { Filter } from 'mongodb';

export type IIntegrationCredentialsRepository = {
  findById(id: TIntegrationCredentialsId): Promise<TIntegrationCredentialsRecord | null>;
  findByCompanyAndPlatform(
    companyId: TCompanyId,
    platform: TCommunicationPlatform,
  ): Promise<TIntegrationCredentialsRecord | null>;
  findByCompany(companyId: TCompanyId): Promise<TIntegrationCredentialsRecord[]>;
} & IBaseCRUD<TIntegrationCredentialsRecord>;

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

  async findByCompanyAndPlatform(
    companyId: TCompanyId,
    platform: TCommunicationPlatform,
  ): Promise<TIntegrationCredentialsRecord | null> {
    const filter: Filter<TIntegrationCredentialsRecord> = { company_id: companyId, platform };
    return this.findOne({ filter });
  }

  async findByCompany(companyId: TCompanyId): Promise<TIntegrationCredentialsRecord[]> {
    const filter: Filter<TIntegrationCredentialsRecord> = { company_id: companyId };
    return this.findMany({ filter });
  }
}
