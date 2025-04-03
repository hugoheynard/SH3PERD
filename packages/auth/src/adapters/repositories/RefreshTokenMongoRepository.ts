import type {
    IRefreshTokenRepository,
    TRefreshTokenRecord,
    TRevokeRefreshTokenResult
} from "../../domain/models/refreshToken.types";
import type {Collection} from "mongodb";

export class RefreshTokenMongoRepository implements IRefreshTokenRepository {
    private readonly refreshTokenCollection: Collection<TRefreshTokenRecord>;

    constructor(input: { refreshTokenCollection: Collection<TRefreshTokenRecord> }) {
        this.refreshTokenCollection = input.refreshTokenCollection;
    };

    async saveRefreshToken(input: { refreshTokenRecord:TRefreshTokenRecord }): Promise<void> {
        const {
            refreshToken,
            user_id,
            expiresAt,
            createdAt
        } = input.refreshTokenRecord;

        const result = await this.refreshTokenCollection
            .insertOne({
                refreshToken,
                user_id,
                expiresAt,
                createdAt
            });

        if (!result.acknowledged || result.insertedCount !== 1) {
            throw new Error('Failed to save refresh token')
        }

        return { success: true };
    };

    async findRefreshToken(input: { token: string }): Promise<TRefreshTokenRecord | null> {
        const { token } = input;
        const result = await this.refreshTokenCollection.findOne({ refreshToken: token });

        const {_id, ...token} = result || {};

        return token as TRefreshTokenRecord;
    };

    async revokeRefreshToken(input: { token: string }): Promise<TRevokeRefreshTokenResult> {
        const { token } = input;

        const result = await this.refreshTokenCollection.deleteOne({ token: token });

        if (result.deletedCount === 0) {
            throw new Error(`Refresh token ${token} not found or already revoked`)
        }

        return { revokedToken: token };
    }
}