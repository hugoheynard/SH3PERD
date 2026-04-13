import type { TApiMessage } from '@sh3pherd/shared-types';

export const USERGROUP_SUCCESS = {
  GET_CURRENT_USER_USERGROUPS: {
    code: 'GET_CURRENT_USER_USERGROUPS_SUCCESS',
    message: 'Successfully retrieved user groups for the current user.',
  },

  GET_SUBGROUP_INITIAL_FORM_VALUES: {
    code: 'GET_SUBGROUP_INITIAL_FORM_VALUES_SUCCESS',
    message: 'Successfully retrieved initial form values for creating a subgroup.',
  },
} as const satisfies Record<string, TApiMessage>;
