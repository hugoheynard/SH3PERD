import z from 'zod';
import { createIdSchema } from '../utils/createIdSchema.js';
import {
  SContractDomainModel,
  SContractId,
  type TContractDomainModel,
  type TContractId,
} from '../contracts.domain.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import { SUserProfileDomainModel, type TUserProfileDomainModel } from './user-profile.js';
import { SCompanyId, type TCompanyId } from '../ids.js';
import { type TFormOption, zFormOption } from '../utils/form.js';


export const SUserGroupId = createIdSchema('userGroup');
export type TUserGroupId = `userGroup_${string}`;

/**
 * Enumeration of possible user group types within the organization.
 * These types help categorize user groups based on their purpose and structure.
 */
export enum UserGroupTypesEnum {
  ROOT = 'root',
  DEPARTMENT = 'department',
  TEAM = 'team',
  PROJECT = 'project',
}

export const SUserGroupTypesEnum = z.nativeEnum(UserGroupTypesEnum, { message : 'Invalid user group type' });

/**
 * Domain model representing a user group within the organization.
 * A user group can be a department, team, project group, etc.
 * It contains metadata about the group and references to its members.
 *
 */
export type TUserGroupDomainModel = {
  id: TUserGroupId;
  type: UserGroupTypesEnum;
  name: string;
  description?: string;
  /**
   * Contract ID of the group lead (e.g., manager or team lead)
   * Group lead can give permissions to other employees in the group
   * and create sub-groups within this user group.
   */
  groupLead: TContractId;
  /** List of contract IDs that have delegated rights within this user group */
  referents: TContractId[];
  /** List of employee contract IDs associated with this user group */
  members:TContractId[];
  /** Parent user group ID if this group is a sub-group */
  parent_group_id: TUserGroupId | null;
  company_id: TCompanyId;
  created_by?: TContractId;
};


export const SUserGroupDomainModel = z.object({
  id: SUserGroupId,
  type: SUserGroupTypesEnum,
  name: z.string(),
  description: z.string().optional(),
  groupLead: SContractId,
  referents: z.array(SContractId),
  members: z.array(SContractId),
  parent_group_id: SUserGroupId.or(z.null()),
  company_id: SCompanyId,
})

export type TUserGroupRecord = TUserGroupDomainModel & TRecordMetadata;


/**
 * View model representing a list of user groups along with related contracts and user profiles.
 * This model is used to present user groups in the context of a specific contract scope
 */
export type TUserGroupListViewModel = {
  userGroups: TUserGroupDomainModel[];
  contracts: Record<TContractId, TContractDomainModel>;
  userProfiles: Record<TContractId, TUserProfileDomainModel>;
};


/**
 * Zod schema for UserGroupListViewModel
 * @see TUserGroupListViewModel
 * to use for UserGroupListDTO
 */
export const SUserGroupListViewModel = z.object({
  userGroups: z.array(SUserGroupDomainModel),
  contracts: z.record(SContractId, SContractDomainModel).describe('Map of contracts keyed by contract_id (e.g. "contract_abcd1234")'),
  userProfiles: z.record(SContractId, SUserProfileDomainModel).describe('Map of contracts keyed by contract_id (e.g. "contract_abcd1234")'),
});



export type TSubgroupInitialFormValuesObject = {
  name: string;
  typeOptions: TFormOption<UserGroupTypesEnum>[];
  referentsOptions: TFormOption<TContractId>[];
  membersOptions: TFormOption<TContractId>[];
}


export const SSubgroupInitialFormValuesObject = z.object({
  name: z.string(),
  typeOptions: z.array(zFormOption(SUserGroupTypesEnum)),
  referentsOptions: z.array(zFormOption(SContractId)),
  membersOptions: z.array(zFormOption(SContractId)),
});

