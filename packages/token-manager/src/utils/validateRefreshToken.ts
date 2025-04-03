import type {TRefreshTokenRecord} from "@sh3pherd/auth";

/**
 * Validates whether a refresh token is still active (not expired).
 *
 * @param input - The refresh token record to validate.
 * @returns True if the token is valid (not expired), false otherwise.
 */
export const validateRefreshToken = (input: { refreshToken: TRefreshTokenRecord }): boolean => {
    return input.refreshToken.expiresAt.getTime() > Date.now()
};
