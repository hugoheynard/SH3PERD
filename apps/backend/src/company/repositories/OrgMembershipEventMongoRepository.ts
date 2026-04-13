import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TOrgMembershipEventRecord, TOrgNodeId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export type IOrgMembershipEventRepository = {
  findByOrgNode(orgNodeId: TOrgNodeId): Promise<TOrgMembershipEventRecord[]>;
} & IBaseCRUD<TOrgMembershipEventRecord>;

export class OrgMembershipEventMongoRepository
  extends BaseMongoRepository<TOrgMembershipEventRecord>
  implements IOrgMembershipEventRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findByOrgNode(orgNodeId: TOrgNodeId): Promise<TOrgMembershipEventRecord[]> {
    return this.findMany({ filter: { org_node_id: orgNodeId } });
  }
}
