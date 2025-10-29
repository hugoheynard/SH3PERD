import { Inject, Injectable } from '@nestjs/common';
import type { TContractId,  TUserProfileDomainModel,TContractDomainModel, TUserGroupDomainModel, TUserGroupListViewModel } from '@sh3pherd/shared-types';
import { CONTRACT_REPO, USER_GROUPS_REPO, USER_PROFILE_REPO } from '../../appBootstrap/nestTokens.js';
import type { IUserGroupsMongoRepository } from '../infra/UserGroupsMongoRepository.js';
import type { IContractRepository } from '../../contracts/repositories/ContractMongoRepository.js';
import type { IUserProfileRepository } from '../../user/profile/UserProfileMongoRepo.repository.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';



@Injectable()
export class UserGroupListByContractAssembler {

  constructor(
    @Inject(USER_GROUPS_REPO) private readonly userGroupsRepo: IUserGroupsMongoRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
  ) {};

  /**
   * Get user group list view model for a specific contract scope
   * @param contract_id
   */
  async execute(contract_id: TContractId): Promise<TUserGroupListViewModel> {
    const userGroups: TUserGroupDomainModel[] = [];
    const userGroupsRecord = await this.userGroupsRepo.getContractScopedUserGroups(contract_id);

    const uniqueContractIds = new Set<TContractId>();

    for (const ug of userGroupsRecord) {
      uniqueContractIds.add(ug.groupLead);
      ug.members.forEach(id => uniqueContractIds.add(id));
      ug.hasDelegatedRights.forEach(id => uniqueContractIds.add(id));
      userGroups.push(RecordMetadataUtils.stripDocMetadata(ug));
    }

    const { contracts, userProfiles } = await this.generateContractAndUserProfileObjects([...uniqueContractIds]);

    return {
      userGroups,
      contracts,
      userProfiles,
    };
  };

  /**
   * Generates contract and user profile objects for the given contract IDs.
   * @param contractIds
   * @private
   */
  private async generateContractAndUserProfileObjects(
    contractIds: TContractId[],
  ): Promise<{
    contracts: Record<TContractId, TContractDomainModel>;
    userProfiles: Record<TContractId, TUserProfileDomainModel>;
  }> {
    const contracts = await this.contractRepo.findMany({ filter: { id: { $in: contractIds } }, }) ?? [];

    const userIds = [...new Set(contracts.map(c => c.user_id))];

    const userProfiles = await this.userProfileRepo.findMany({ filter: { user_id: { $in: userIds } }, }) ?? [];

    const userProfileMap = new Map(userProfiles.map(u => [u.user_id, RecordMetadataUtils.stripDocMetadata(u)]));

    const contractObject: Record<TContractId, TContractDomainModel> = {};
    const contractUserProfiles: Record<TContractId, TUserProfileDomainModel> = {};

    for (const contract of contracts) {
      RecordMetadataUtils.stripDocMetadata(contract);
      contractObject[contract.id] = contract;

      const userProfile = userProfileMap.get(contract.user_id);

      if (userProfile) {
        contractUserProfiles[contract.id] = userProfile;
      }
    }

    return { contracts: contractObject, userProfiles: contractUserProfiles };
  };
}