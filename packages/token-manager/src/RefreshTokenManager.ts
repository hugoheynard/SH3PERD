import type {
    TRefreshToken,
    TRefreshTokenDomainModel,
    IRefreshTokenRepository,
    IAbstractRefreshTokenManager,
    TGenerateRefreshToken,
    TVerifyRefreshToken,
    TRevokeRefreshToken,
    TRefreshTokenManagerDeps,
} from "@sh3pherd/auth";


/**
 * RefreshTokenManager handles the lifecycle of refresh tokens,
 * including generation, validation, and revocation.
 *
 * This class follows a clean architecture principle where responsibilities
 * like token generation, persistence, and validation are injected.
 */
export class RefreshTokenManager implements IAbstractRefreshTokenManager {
    private readonly refreshTokenRepository: IRefreshTokenRepository;
    private readonly generatorFunction: () => Promise<TRefreshToken>;
    private readonly validateRefreshTokenDateFunction: TCheckExpirationDateFunction;
    private readonly ttlMs: number;

    constructor(input: TRefreshTokenManagerDeps) {
        this.refreshTokenRepository = input.refreshTokenRepository;
        this.generatorFunction = input.generatorFunction;
        this.validateRefreshTokenDateFunction = input.validateRefreshTokenDateFn;
        this.ttlMs = input.ttlMs;
    };

    /**
     * Generates a new refresh token for a given user.
     *
     * @param input - The user ID for which to generate the refresh token.
     * @returns A promise that resolves to a new refresh token string.
     * @throws If token generation or saving fails.
     */
    generateRefreshToken: TGenerateRefreshToken = async (input)=> {
        try {
            const newRefreshToken = await this.generatorFunction();

            if (!newRefreshToken) {
                throw new Error("Failed to generate refresh token");
            }

            const record: TRefreshTokenDomainModel = {
                refreshToken: newRefreshToken,
                user_id: input.user_id,
                expiresAt: new Date(Date.now() + this.ttlMs),
                createdAt: new Date()
            };

            await this.refreshTokenRepository.saveRefreshToken({ refreshTokenDomainModel: record });

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
    verifyRefreshToken: TVerifyRefreshToken = (input) => {
        const { refreshTokenRecord } = input;

        return this.validateRefreshTokenDateFunction({ expirationDate: refreshTokenRecord.expiresAt });
    };

    /**
     * Revokes a given refresh token.
     *
     * @param input - The refresh token to revoke.
     * @returns A promise that resolves to an object containing the revoked token.
     * @throws If the revocation fails or the token does not exist.
     */
    revokeRefreshToken: TRevokeRefreshToken = async (input) => {
        try {
            await this.refreshTokenRepository.revokeRefreshToken({ refreshToken: input.refreshToken});

            return { revokedToken: input.refreshToken };
        } catch (error) {
            throw new Error(`Unable to revoke refresh token: ${(error as Error).message}`);
        }
    };
}