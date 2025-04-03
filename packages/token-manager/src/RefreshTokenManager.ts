import type {UserId} from "@sh3pherd/user";
import type {
    TRefreshToken,
    TRefreshTokenRecord,
    IRefreshTokenRepository,
    IRefreshTokenManager,
    TRefreshTokenManagerInput, TRevokeRefreshTokenResult,
} from "@sh3pherd/auth";

/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 *
 * This class follows a clean architecture principle where responsibilities
 * like token generation, persistence, and validation are injected.
 */
export class RefreshTokenManager implements IRefreshTokenManager {
    private readonly refreshTokenRepository: IRefreshTokenRepository;
    private readonly generatorFunction: () => Promise<TRefreshToken>;
    private readonly validateRefreshTokenFunction: (input: { refreshToken: TRefreshToken }) => Promise<boolean>;
    private readonly ttlMs: number;

    constructor(input: TRefreshTokenManagerInput) {
        this.refreshTokenRepository = input.refreshTokenRepository;
        this.generatorFunction = input.generatorFunction;
        this.validateRefreshTokenFunction = input.validateRefreshTokenFunction;
        this.ttlMs = input.ttlMs;
    };

    /**
     * Generates a new refresh token for a given user.
     *
     * @param input - The user ID for which to generate the refresh token.
     * @returns A promise that resolves to a new refresh token string.
     * @throws If token generation or saving fails.
     */
    async generateRefreshToken(input: { user_id: UserId }): Promise<TRefreshToken> {
        try {
            const newRefreshToken = await this.generatorFunction();

            if (!newRefreshToken) {
                throw new Error("Failed to generate refresh token");
            }

            const record: TRefreshTokenRecord = {
                refreshToken: newRefreshToken,
                user_id: input.user_id,
                expiresAt: new Date(Date.now() + this.ttlMs),
                createdAt: new Date()
            };

            await this.refreshTokenRepository.saveRefreshToken({ refreshTokenRecord: record });

            return newRefreshToken
        } catch (error){
            throw new Error(`Unable to save refresh token for user ${input.user_id}: ${(error as Error).message}`)

        }
    };

    /**
     * Verifies the validity of a refresh token.
     *
     * @param input - The refresh token to validate.
     * @returns A promise that resolves to a boolean indicating whether the token is valid.
     */
    async verifyRefreshToken(input : { refreshToken: TRefreshToken }): Promise<boolean> {
        const { refreshToken } = input;

        return this.validateRefreshTokenFunction({ refreshToken });
    };

    /**
     * Revokes a given refresh token.
     *
     * @param input - The refresh token to revoke.
     * @returns A promise that resolves to an object containing the revoked token.
     * @throws If the revocation fails or the token does not exist.
     */
    async revokeRefreshToken(input : { refreshToken: TRefreshToken }): Promise<TRevokeRefreshTokenResult> {
        try {
            await this.refreshTokenRepository.revokeRefreshToken({ refreshToken: input.refreshToken});

            return { revokedToken: input.refreshToken };
        } catch (error) {
            throw new Error(`Unable to revoke refresh token: ${(error as Error).message}`);
        }
    };
}