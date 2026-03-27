import type { TApiMessage } from '@sh3pherd/shared-types';

export const COMPANY_CODES_SUCCESS = {
  CREATE_COMPANY:     { code: 'COMPANY_CREATED',     message: 'Company created successfully.' },
  GET_COMPANY:        { code: 'COMPANY_FOUND',        message: 'Company retrieved successfully.' },
  ADD_SERVICE:        { code: 'SERVICE_ADDED',        message: 'Service added to company.' },
  REMOVE_SERVICE:     { code: 'SERVICE_REMOVED',      message: 'Service removed from company.' },
  CREATE_TEAM:        { code: 'TEAM_CREATED',         message: 'Team created successfully.' },
  GET_COMPANY_TEAMS:  { code: 'TEAMS_FOUND',          message: 'Company teams retrieved.' },
  ADD_TEAM_MEMBER:    { code: 'TEAM_MEMBER_ADDED',    message: 'Member added to team.' },
  REMOVE_TEAM_MEMBER: { code: 'TEAM_MEMBER_REMOVED',  message: 'Member removed from team.' },
  GET_MY_COMPANIES:   { code: 'MY_COMPANIES_FOUND',   message: 'User companies retrieved.' },
  GET_COMPANY_BY_ID:   { code: 'COMPANY_FOUND_BY_ID',   message: 'Company retrieved successfully.' },
  DELETE_COMPANY:      { code: 'COMPANY_DELETED',        message: 'Company deleted successfully.' },
  UPDATE_COMPANY_INFO: { code: 'COMPANY_INFO_UPDATED',   message: 'Company info updated successfully.' },
  ADD_ADMIN:           { code: 'ADMIN_ADDED',             message: 'Admin added successfully.' },
  REMOVE_ADMIN:        { code: 'ADMIN_REMOVED',           message: 'Admin removed successfully.' },
  GET_SERVICE_DETAIL:  { code: 'SERVICE_DETAIL_FOUND',    message: 'Service detail retrieved successfully.' },
  UPDATE_SERVICE:      { code: 'SERVICE_UPDATED',         message: 'Service updated successfully.' },
  GET_COMPANY_ORGCHART: { code: 'ORGCHART_FOUND',         message: 'Company org chart retrieved.' },
} as const satisfies Record<string, TApiMessage>;
