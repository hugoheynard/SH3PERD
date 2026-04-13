import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TUserGroupRecord, TContractId } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export type IUserGroupsMongoRepository = {
  getContractScopedUserGroups: (contract_scope: TContractId) => Promise<TUserGroupRecord[]>;
} & IBaseCRUD<TUserGroupRecord>;

export class UserGroupsMongoRepository extends BaseMongoRepository<TUserGroupRecord> {
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async getContractScopedUserGroups(contract_scope: TContractId): Promise<TUserGroupRecord[]> {
    const result = await this.collection
      .find({
        $or: [
          { groupLead: contract_scope },
          { referents: { $in: [contract_scope] } },
          { members: { $in: [contract_scope] } },
          { creation_context: contract_scope },
        ],
      })
      .toArray();

    return result ? result : [];
  }
}
