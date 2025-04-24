import type {Collection} from "mongodb";
import type {TmapMongoDocToDomainModelFunction} from "@sh3pherd/shared-utils";
import type {
    IRefreshTokenMongoRepositoryDeps,
    IRefreshTokenRepository, TDeleteRefreshToken, TFindRefreshToken,
    TRefreshTokenDomainModel, TSaveRefreshToken
} from "@sh3pherd/shared-types";


export class RefreshTokenMongoRepository implements IRefreshTokenRepository {
    private readonly refreshTokenCollection: Collection<TRefreshTokenDomainModel>;
    private readonly mapMongoDocToDomainModelFunction: TmapMongoDocToDomainModelFunction


    constructor(input: IRefreshTokenMongoRepositoryDeps) {
        this.refreshTokenCollection = input.refreshTokenCollection;
        this.mapMongoDocToDomainModelFunction = input.mapMongoDocToDomainModelFn;
    };

    saveRefreshToken: TSaveRefreshToken = async (input) => {
        const {
            refreshToken,
            user_id,
            expiresAt,
            createdAt
        } = input.refreshTokenDomainModel;

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

    findRefreshToken: TFindRefreshToken = async (input) => {
        const { refreshToken } = input;
        const result = await this.refreshTokenCollection.findOne({ refreshToken: refreshToken });
        if (!result) return null;

        return this.mapMongoDocToDomainModelFunction({ document: result });
    };

    deleteRefreshToken: TDeleteRefreshToken = async (input) =>{
        const { refreshToken } = input;

        const result = await this.refreshTokenCollection.deleteOne({ refreshToken: refreshToken });

        if (result.deletedCount === 0) {
            throw new Error(`Refresh token ${refreshToken} not found or already revoked`)
        }

        return { revokedToken: refreshToken};
    };
}