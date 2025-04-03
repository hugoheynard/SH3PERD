import type {UserId} from "@sh3pherd/user";
import type {
    TRefreshToken,
    TRefreshTokenRecord,
    IRefreshTokenRepository,
    IRefreshTokenManager,
    TRefreshTokenManagerInput, TRevokeRefreshTokenResult,
} from "@sh3pherd/auth";


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

    async generateRefreshToken(input: { user_id: UserId }): Promise<TRefreshToken> {
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

        const result = await this.refreshTokenRepository.saveRefreshToken({ refreshTokenRecord: record });

        if (!result.success) {
            throw new Error("Failed to save refresh token");
        }
        return newRefreshToken
    };

    async verifyRefreshToken(input : { refreshToken: TRefreshToken }): Promise<boolean> {
        const { refreshToken } = input;

        return this.validateRefreshTokenFunction({ refreshToken });
    };

    async revokeRefreshToken(input : { refreshToken: TRefreshToken }): Promise<TRevokeRefreshTokenResult> {
        // Logic to revoke the refresh token
        const result = await this.refreshTokenRepository
            .revokeRefreshToken({
                refreshToken: input.refreshToken
            });

        if (!result) {
            throw new Error("Failed to revoke refresh token");
        }

        return { revokedToken: input.refreshToken };
    };
}