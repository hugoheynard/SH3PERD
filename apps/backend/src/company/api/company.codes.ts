import type { TApiMessage } from '@sh3pherd/shared-types';

export const COMPANY_CODES_SUCCESS = {
  CREATE_COMPANY:        { code: 'COMPANY_CREATED',        message: 'Company created successfully.' },
  GET_COMPANY:           { code: 'COMPANY_FOUND',           message: 'Company retrieved successfully.' },
  GET_COMPANY_BY_ID:     { code: 'COMPANY_FOUND_BY_ID',     message: 'Company retrieved successfully.' },
  GET_MY_COMPANIES:      { code: 'MY_COMPANIES_FOUND',      message: 'User companies retrieved.' },
  UPDATE_COMPANY_INFO:   { code: 'COMPANY_INFO_UPDATED',    message: 'Company info updated successfully.' },
  DELETE_COMPANY:        { code: 'COMPANY_DELETED',          message: 'Company deleted successfully.' },
  CREATE_ORGNODE:        { code: 'ORGNODE_CREATED',          message: 'Org node created successfully.' },
  GET_COMPANY_ORGNODES:  { code: 'ORGNODES_FOUND',          message: 'Company org nodes retrieved.' },
  GET_ORGNODE_MEMBERS:   { code: 'ORGNODE_MEMBERS_FOUND',   message: 'Org node members retrieved.' },
  ADD_ORGNODE_MEMBER:    { code: 'ORGNODE_MEMBER_ADDED',    message: 'Member added to org node.' },
  REMOVE_ORGNODE_MEMBER: { code: 'ORGNODE_MEMBER_REMOVED',  message: 'Member removed from org node.' },
  UPDATE_ORGNODE:        { code: 'ORGNODE_UPDATED',          message: 'Org node updated successfully.' },
  GET_COMPANY_ORGCHART:  { code: 'ORGCHART_FOUND',          message: 'Company org chart retrieved.' },
  ADD_GUEST_MEMBER:      { code: 'GUEST_MEMBER_ADDED',      message: 'Guest member added to org node.' },
  REMOVE_GUEST_MEMBER:   { code: 'GUEST_MEMBER_REMOVED',    message: 'Guest member removed from org node.' },
} as const satisfies Record<string, TApiMessage>;
