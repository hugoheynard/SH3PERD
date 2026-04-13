import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { CompanyAggregate } from '../domain/CompanyAggregate.js';
import { CompanyEntity } from '../domain/CompanyEntity.js';
import { OrgNodeEntity } from '../domain/OrgNodeEntity.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';
import type { ICompanyRepository } from './CompanyMongoRepository.js';
import type { IOrgNodeRepository } from './OrgNodeMongoRepository.js';

export type ICompanyAggregateRepository = {
  loadByCompanyId(companyId: TCompanyId): Promise<CompanyAggregate>;
  save(aggregate: CompanyAggregate, actorId: TUserId): Promise<void>;
};

export class CompanyAggregateRepository implements ICompanyAggregateRepository {
  constructor(
    private readonly companyRepo: ICompanyRepository,
    private readonly orgNodeRepo: IOrgNodeRepository,
  ) {}

  async loadByCompanyId(companyId: TCompanyId): Promise<CompanyAggregate> {
    const [companyRecord, nodeRecords] = await Promise.all([
      this.companyRepo.findById(companyId),
      this.orgNodeRepo.findByCompany(companyId),
    ]);

    if (!companyRecord) {
      throw new BusinessError('Company not found', { code: 'COMPANY_NOT_FOUND', status: 404 });
    }

    const company = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(companyRecord));
    const nodes = nodeRecords.map(
      (r) => new OrgNodeEntity(RecordMetadataUtils.stripDocMetadata(r)),
    );

    return new CompanyAggregate(company, nodes);
  }

  async save(aggregate: CompanyAggregate, actorId: TUserId): Promise<void> {
    const metadata = RecordMetadataUtils.create(actorId);

    // Insert new nodes
    for (const node of aggregate.newNodes) {
      await this.orgNodeRepo.save({ ...node.toDomain, ...metadata });
    }

    // Delete removed nodes
    for (const node of aggregate.removedNodes) {
      await this.orgNodeRepo.deleteOne({ id: node.id } as any);
    }

    // Update existing nodes with diffs
    for (const node of aggregate.existingNodes) {
      const diff = node.getDiffProps();
      if (Object.keys(diff).length > 0) {
        await this.orgNodeRepo.updateOne({
          filter: { id: node.id } as any,
          update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
        });
      }
    }
  }
}
