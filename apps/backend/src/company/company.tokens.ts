// Use case tokens
export const COMPANY_USE_CASES              = Symbol('COMPANY_USE_CASES');
export const COMPANY_USE_CASES_FACTORY      = Symbol('COMPANY_USE_CASES_FACTORY');
export const CREATE_COMPANY_USE_CASE        = Symbol('CREATE_COMPANY_USE_CASE');
export const CREATE_TEAM_USE_CASE           = Symbol('CREATE_TEAM_USE_CASE');
export const ADD_TEAM_MEMBER_USE_CASE       = Symbol('ADD_TEAM_MEMBER_USE_CASE');
export const REMOVE_TEAM_MEMBER_USE_CASE    = Symbol('REMOVE_TEAM_MEMBER_USE_CASE');
export const GET_TEAM_MEMBERS_USE_CASE      = Symbol('GET_TEAM_MEMBERS_USE_CASE');

// New use case tokens
export const GET_COMPANY_BY_OWNER_USE_CASE  = Symbol('GET_COMPANY_BY_OWNER_USE_CASE');
export const GET_COMPANY_BY_ID_USE_CASE     = Symbol('GET_COMPANY_BY_ID_USE_CASE');
export const DELETE_COMPANY_USE_CASE        = Symbol('DELETE_COMPANY_USE_CASE');
export const UPDATE_COMPANY_INFO_USE_CASE   = Symbol('UPDATE_COMPANY_INFO_USE_CASE');
export const ADD_ADMIN_USE_CASE             = Symbol('ADD_ADMIN_USE_CASE');
export const REMOVE_ADMIN_USE_CASE          = Symbol('REMOVE_ADMIN_USE_CASE');
export const ADD_SERVICE_USE_CASE           = Symbol('ADD_SERVICE_USE_CASE');
export const REMOVE_SERVICE_USE_CASE        = Symbol('REMOVE_SERVICE_USE_CASE');
export const GET_COMPANY_TEAMS_USE_CASE     = Symbol('GET_COMPANY_TEAMS_USE_CASE');
export const GET_MY_COMPANIES_USE_CASE      = Symbol('GET_MY_COMPANIES_USE_CASE');
export const GET_SERVICE_DETAIL_USE_CASE    = Symbol('GET_SERVICE_DETAIL_USE_CASE');
export const UPDATE_SERVICE_USE_CASE        = Symbol('UPDATE_SERVICE_USE_CASE');
export const GET_COMPANY_ORGCHART_USE_CASE  = Symbol('GET_COMPANY_ORGCHART_USE_CASE');

// Repository tokens — sourced from nestTokens to match CoreRepositoriesModule registrations
export { COMPANY_REPO, CAST_REPO, CAST_MEMBERSHIP_EVENT_REPO, USER_PROFILE_REPO } from '../appBootstrap/nestTokens.js';
