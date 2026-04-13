import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TCompanyDetailViewModel, TContractRecord } from '@sh3pherd/shared-types';
import { COMPANY_REPO, ORG_NODE_REPO } from '../../company.tokens.js';
import { CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import type { IBaseCRUD } from '../../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import { CompanyEntity } from '../../domain/CompanyEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class GetCompanyByIdQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

/**
 * Returns the full company detail view model.
 *
 * Reconstitutes the entity via toDomain, then enriches with computed counts
 * (active org nodes, active contracts) to build the TCompanyDetailViewModel.
 *
 * @throws BusinessError COMPANY_NOT_FOUND (404) — company does not exist.
 */
@QueryHandler(GetCompanyByIdQuery)
export class GetCompanyByIdHandler implements IQueryHandler<
  GetCompanyByIdQuery,
  TCompanyDetailViewModel
> {
  constructor(
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IBaseCRUD<TContractRecord>,
  ) {}

  async execute(query: GetCompanyByIdQuery): Promise<TCompanyDetailViewModel> {
    const record = await this.companyRepo.findById(query.companyId);
    if (!record)
      throw new BusinessError('Company not found', { code: 'COMPANY_NOT_FOUND', status: 404 });

    const entity = new CompanyEntity(RecordMetadataUtils.stripDocMetadata(record));
    const domain = entity.toDomain;

    // TODO: replace with countDocuments() when IBaseCRUD supports it (perf issue at scale)
    const [orgNodes, contracts] = await Promise.all([
      this.orgNodeRepo.findByCompany(query.companyId),
      this.contractRepo.findMany({ filter: { company_id: query.companyId, status: 'active' } }),
    ]);

    const activeTeamCount = orgNodes.filter((n) => n.status === 'active').length;
    const activeContractCount = contracts?.length ?? 0;

    return {
      id: domain.id,
      name: domain.name,
      owner_id: domain.owner_id,
      status: domain.status,
      description: domain.description,
      address: domain.address,
      orgLayers: [...domain.orgLayers],
      activeTeamCount,
      activeContractCount,
    };
  }
}
