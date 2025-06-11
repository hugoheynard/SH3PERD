import jwt from 'jsonwebtoken'
import type { SignOptions, Secret } from 'jsonwebtoken';
import type {IAbstractAuthTokenManager} from "../../types/auth.core.tokens.contracts.js";
import type {TAuthTokenManagerOptions, TAuthTokenPayload} from "../../types/auth.domain.tokens.js";
import type {TGenerateAuthTokenFn, TVerifyAuthTokenFn} from "../../types/auth.core.contracts.js";



/**
 * JwtAuthTokenManager
 *
 * Concrete implementation of access token generation and verification using
 * the JWT (JSON Web Token) standard with RS256 (asymmetric) signing algorithm.
 *
 * This class is focused solely on stateless access tokens.
 * Refresh token logic (rotation, persistence, revocation) should be handled
 * by a separate RefreshTokenManager.
 */
export class JwtAuthTokenManager implements IAbstractAuthTokenManager{
    private readonly options: TAuthTokenManagerOptions;

    /**
     * Initializes the JWT manager with required cryptographic options.
     *
     * @param input - Object containing configuration options for keys and expiration.
     */
    constructor(input: { options: TAuthTokenManagerOptions }) {
        this.options = input.options;
    };

    /**
     * Signs and returns a new access token for the provided payload.
     *
     * @param input - Contains the payload to embed inside the JWT (e.g. user ID).
     * @returns A signed JWT as a string.
     */
    generateAuthToken:TGenerateAuthTokenFn = async (input) => {
        const { payload } = input;

        return Promise.resolve(
            jwt.sign(payload, this.options.privateKey as Secret, {
                algorithm: 'RS256',
                expiresIn: this.options.accessTokenExpiresIn as SignOptions['expiresIn'],
            })
        );
    };

    /**
     * Verifies a given access token and returns the decoded payload.
     *
     * @param input - Object containing the JWT string to verify.
     * @returns The decoded payload if valid, or throws if invalid/expired.
     */
    verifyAuthToken: TVerifyAuthTokenFn = async (input) => {
        try {
            const { authToken } = input;

            const payload = jwt.verify(authToken, this.options.publicKey as string, {
                algorithms: ['RS256'],
            });

            return Promise.resolve(payload as TAuthTokenPayload);
        } catch(error) {
            console.error("Token verification failed:", error);
            return null;
        }
    };
}