import { inject, Injectable } from '@angular/core';
import type { UserGroup } from '../../program-types';
import { ProgramHistoryService } from '../program-history.service';

@Injectable({ providedIn: 'root' })
export class UserGroupService {

  private history = inject(ProgramHistoryService);


  /**
   * Creates a new user group and adds it to the program state. The method takes a UserGroup object as a parameter and updates the program state by appending the new group to the existing array of user groups. This allows for dynamic management of user groups within the program, enabling features such as access control, permissions, or categorization of users based on their group affiliations.
   * @param group
   */
  createUserGroup(group: UserGroup) {
    this.history.updateState(state => ({

      ...state,

      userGroups: [
        ...state.userGroups,
        group
      ]
    }));
  };

}
