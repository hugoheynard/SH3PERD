import type {Collection} from "mongodb";
import type {
    IRefreshTokenMongoRepositoryDeps,
    IRefreshTokenRepository,
    TDeleteAllRefreshTokensForUser,
    TDeleteRefreshToken,
    TFindRefreshToken,
    TRefreshTokenDomainModel,
    TSaveRefreshToken
} from "@sh3pherd/shared-types";
import {autoBind, BaseMongoRepository, BusinessError, TechnicalError} from "@sh3pherd/shared-utils";


@autoBind
export class RefreshTokenMongoRepository
    extends BaseMongoRepository
    implements IRefreshTokenRepository {
    private readonly refreshTokenCollection: Collection<TRefreshTokenDomainModel>;


    constructor(input: IRefreshTokenMongoRepositoryDeps) {
        super();
        this.refreshTokenCollection = input.refreshTokenCollection;
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
            throw new TechnicalError(
                'Failed to save refresh token',
                'REFRESH_TOKEN_SAVE_FAILED',
                500
            );
        }

        return { success: true };
    };

    findRefreshToken: TFindRefreshToken = async (input) => {
        try {
            const { refreshToken } = input;
            const result = await this.refreshTokenCollection.findOne({ refreshToken: refreshToken });

            if (!result) {
                return null
            }

            return this.mapMongoDocToDomainModel({ doc: result });
        } catch (e) {
            throw new TechnicalError(
                'Failed to find refresh token',
                'FIND_REFRESH_TOKEN_FAILED',
                500
            )
        }
    };

    deleteRefreshToken: TDeleteRefreshToken = async (input) =>{
        try {
            const { refreshToken } = input;

            const result = await this.refreshTokenCollection.deleteOne({ refreshToken: refreshToken });

            if (result.deletedCount === 0) {
                throw new BusinessError(
                    `Refresh token ${refreshToken} not found or already revoked`,
                    'REFRESH_TOKEN_NOT_FOUND',
                    404
                );
            }

            return { revokedToken: refreshToken};
        } catch (e) {
            throw new TechnicalError(
                'Failed to delete refresh token',
                'DELETE_REFRESH_TOKEN_FAILED',
                500
            );
        }

    };

    deleteAllRefreshTokensForUser: TDeleteAllRefreshTokensForUser = async (input) => {
        try {
            const { user_id } = input;

            const result = await this.refreshTokenCollection.deleteMany({ user_id: user_id });

            if (result.deletedCount === 0) {
                throw new BusinessError(
                    `No refresh tokens found for user ${user_id}`,
                    'NO_REFRESH_TOKENS_FOUND',
                    404
                );
            }

            return { deletedCount: result.deletedCount };
        } catch (e) {
            throw new TechnicalError(
                'Failed to delete refresh tokens for user',
                'DELETE_REFRESH_TOKENS_FAILED',
                500
            );
        }
    };
}