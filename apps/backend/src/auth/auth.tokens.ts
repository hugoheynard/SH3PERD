export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');
export const JWT_SERVICE = Symbol('JWT_SERVICE');
export const REFRESH_TOKEN_SERVICE = Symbol('REFRESH_TOKEN_SERVICE');
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

/**
 * @token AUTH_USE_CASES
 * @description
 * Injection token for the Auth use case facade.
 *
 * Provides access to all authentication-related use cases,
 * such as user registration, login, and token refresh.
 */
export const AUTH_USE_CASES_FACTORY = Symbol('AUTH_USE_CASES_FACTORY');
export const AUTH_USE_CASES = Symbol('AUTH_USE_CASES');
export const REGISTER_USER_USE_CASE = Symbol('REGISTER_USER_USE_CASE');
export const LOGIN_USE_CASE = Symbol('LOGIN_USE_CASE');
export const LOGOUT_USE_CASE = Symbol('LOGOUT_USE_CASE');
export const REFRESH_SESSION_USE_CASE = Symbol('REFRESH_SESSION_USE_CASE');