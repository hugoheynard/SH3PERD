import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TCastMembershipEventRecord, TTeamId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export interface ICastMembershipEventRepository extends IBaseCRUD<TCastMembershipEventRecord> {
  findByCast(castId: TTeamId): Promise<TCastMembershipEventRecord[]>;
}

export class CastMembershipEventMongoRepository
  extends BaseMongoRepository<TCastMembershipEventRecord>
  implements ICastMembershipEventRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findByCast(castId: TTeamId): Promise<TCastMembershipEventRecord[]> {
    return this.findMany({ filter: { cast_id: castId } });
  }
}
