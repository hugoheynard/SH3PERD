import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TOrgNodeRecord } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';

export class GetCompanyOrgNodesQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

@QueryHandler(GetCompanyOrgNodesQuery)
export class GetCompanyOrgNodesHandler implements IQueryHandler<GetCompanyOrgNodesQuery, TOrgNodeRecord[]> {
  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
  ) {}

  async execute(query: GetCompanyOrgNodesQuery): Promise<TOrgNodeRecord[]> {
    return this.orgNodeRepo.findByCompany(query.companyId);
  }
}
