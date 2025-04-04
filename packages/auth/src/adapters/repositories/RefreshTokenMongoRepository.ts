import type {TRefreshToken, TRefreshTokenRecord} from "../../domain/models/refreshToken.types";
import type {Collection} from "mongodb";
import type {TmapMongoDocToDomainModelFunction} from "@sh3pherd/shared-utils";
import type {
    IRefreshTokenMongoRepositoryInput,
    IRefreshTokenRepository
} from "../../domain/models/IRefreshTokenRepository";
import type {TRevokeRefreshTokenResult} from "../../domain/models/authResults.types";

export class RefreshTokenMongoRepository implements IRefreshTokenRepository {
    private readonly refreshTokenCollection: Collection<TRefreshTokenRecord>;
    private readonly mapMongoDocToDomainModelFunction: TmapMongoDocToDomainModelFunction


    constructor(input: IRefreshTokenMongoRepositoryInput) {
        this.refreshTokenCollection = input.refreshTokenCollection;
        this.mapMongoDocToDomainModelFunction = input.mapMongoDocToDomainModelFunction;
    };

    async saveRefreshToken(input: { refreshTokenRecord: TRefreshTokenRecord }): Promise<{ success: boolean }> {
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

        if (!result.acknowledged || !result.insertedId) {
            throw new Error('Failed to save refresh token')
        }

        return { success: true };
    };

    async findRefreshToken(input: { refreshToken: TRefreshToken }): Promise<TRefreshTokenRecord | null> {
        const { refreshToken } = input;
        const result = await this.refreshTokenCollection.findOne({ refreshToken: refreshToken });
        if (!result) return null;

        return this.mapMongoDocToDomainModelFunction({ document: result });
    };

    async revokeRefreshToken(input: { refreshToken: TRefreshToken }): Promise<TRevokeRefreshTokenResult> {
        const { refreshToken } = input;

        const result = await this.refreshTokenCollection.deleteOne({ refreshToken: refreshToken });

        if (result.deletedCount === 0) {
            throw new Error(`Refresh token ${refreshToken} not found or already revoked`)
        }

        return { revokedToken: refreshToken};
    };
}