import { Injectable } from '@nestjs/common';

export type IUserGroupsService = {};

/**
 * UserGroupsService
 * @description Service to handle user groups related operations
 * aggregates use cases
 */
@Injectable()
export class UserGroupsService implements IUserGroupsService {
  constructor() {}
}
