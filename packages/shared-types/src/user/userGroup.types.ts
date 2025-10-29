import z from 'zod';
import { createIdSchema } from '../utils/createIdSchema.js';
import type { TContractId } from '../contracts.domain.types.js';
import type { TRecordMetadata } from '../metadata.types.js';


export const SUserGroupId = createIdSchema('userGroup');
export type TUserGroupId = `userGroup_${string}` | z.infer<typeof SUserGroupId>;

export enum UserGroupType {
  ORGANIZATION = 'organization',
  DEPARTMENT = 'department',
  TEAM = 'team',
  PROJECT = 'project',
  OTHER = 'other',
}

/**
 * Domain model representing a user group within the organization.
 * A user group can be a department, team, project group, etc.
 * It contains metadata about the group and references to its members.
 *
 */
export type TUserGroupDomainModel = {
  id: TUserGroupId;
  type: UserGroupType;
  name:string;
  description?:string;
  /**
   * Contract ID of the group lead (e.g., manager or team lead)
   * Group lead can give permissions to other employees in the group
   * and create sub-groups within this user group.
   */
  groupLead: TContractId;
  /** List of contract IDs that have delegated rights within this user group */
  hasDelegatedRights: TContractId[];
  /** List of employee contract IDs associated with this user group */
  members:TContractId[];
  /** Parent user group ID if this group is a sub-group */
  parent_group_id: TUserGroupId | null;
  created_by?: TContractId;
}

export type TUserGroupRecord = TUserGroupDomainModel & TRecordMetadata