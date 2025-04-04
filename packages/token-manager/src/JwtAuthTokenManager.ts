import type {
    TTokenManagerOptions,
    TAuthTokenPayload,
    IAbstractAuthTokenManager,
    TVerifyAuthTokenFunction,
    TGenerateAuthTokenFunction
} from "@sh3pherd/auth";
import jwt from 'jsonwebtoken'


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
    private readonly options: TTokenManagerOptions;

    /**
     * Initializes the JWT manager with required cryptographic options.
     *
     * @param input - Object containing configuration options for keys and expiration.
     */
    constructor(input: { options: TTokenManagerOptions }) {
        this.options = input.options;
    };

    /**
     * Signs and returns a new access token for the provided payload.
     *
     * @param input - Contains the payload to embed inside the JWT (e.g. user ID).
     * @returns A signed JWT as a string.
     */
    generateAuthToken:TGenerateAuthTokenFunction = async (input) => {
        const { payload } = input;

        return Promise.resolve(
            jwt.sign(payload, this.options.privateKey as string, {
                algorithm: 'RS256',
                expiresIn: this.options.accessTokenExpiresIn,
            })
        );
    };

    /**
     * Verifies a given access token and returns the decoded payload.
     *
     * @param input - Object containing the JWT string to verify.
     * @returns The decoded payload if valid, or throws if invalid/expired.
     */
    verifyAuthToken: TVerifyAuthTokenFunction = async (input) =>{
        const { token } = input;

        const payload = jwt.verify(token, this.options.publicKey as string, {
            algorithms: ['RS256'],
        });

        return Promise.resolve(payload as TAuthTokenPayload);
    };
}