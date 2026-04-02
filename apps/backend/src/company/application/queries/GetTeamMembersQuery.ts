import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TOrgNodeId, TOrgNodeMember } from '@sh3pherd/shared-types';
import { ORG_NODE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import { OrgNodeEntity } from '../../domain/OrgNodeEntity.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export class GetOrgNodeMembersQuery {
  constructor(
    public readonly orgNodeId: TOrgNodeId,
    public readonly at?: Date,
  ) {}
}

@QueryHandler(GetOrgNodeMembersQuery)
export class GetOrgNodeMembersHandler implements IQueryHandler<GetOrgNodeMembersQuery, TOrgNodeMember[]> {
  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
  ) {}

  async execute(query: GetOrgNodeMembersQuery): Promise<TOrgNodeMember[]> {
    const record = await this.orgNodeRepo.findOne({ filter: { id: query.orgNodeId } });
    if (!record) throw new BusinessError('Org node not found', 'ORGNODE_NOT_FOUND', 404);

    const entity = new OrgNodeEntity(record);
    return query.at ? entity.getMembersAt(query.at) : entity.getActiveMembers();
  }
}
