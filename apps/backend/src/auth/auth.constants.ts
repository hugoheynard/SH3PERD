export const REFRESH_COOKIE_NAME = 'sh3pherd_refreshToken';
/**
 * Cookie path covers all auth routes (/refresh, /logout, /change-password).
 * Was previously '/api/auth/refresh' which prevented the cookie from being
 * sent on logout and change-password requests.
 */
export const REFRESH_COOKIE_PATH = '/api/auth';
