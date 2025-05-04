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
import {autoBind, BaseMongoRepository, failThrows500} from "@sh3pherd/shared-utils";


/**
 * MongoDB-based implementation of the `IRefreshTokenRepository` interface.
 *
 * This repository handles the persistence and retrieval of refresh tokens using a MongoDB collection.
 *
 * 🔧 Dependencies are injected via `IRefreshTokenMongoRepositoryDeps` to ensure loose coupling and testability.
 *
 * ✅ All public methods are decorated with `@failThrows500` to wrap unexpected errors in a standardized TechnicalError.
 * Each method returns explicit results (`boolean` / `null` / domain object) instead of throwing, promoting clarity and flow control.
 *
 * 📦 Typical operations handled:
 * - `saveRefreshToken`: Persists a new refresh token in the database
 * - `findRefreshToken`: Retrieves a token by its string identifier
 * - `deleteRefreshToken`: Revokes a single refresh token
 * - `deleteAllRefreshTokensForUser`: Removes all tokens for a user (e.g., on logout or re-login)
 *
 * @example
 * const repo = new RefreshTokenMongoRepository({ refreshTokenCollection });
 * const token = await repo.findRefreshToken({ refreshToken: 'abc' });
 *
 * @implements {IRefreshTokenRepository}
 */
@autoBind
export class RefreshTokenMongoRepository
    extends BaseMongoRepository
    implements IRefreshTokenRepository {
    private readonly collection: Collection<TRefreshTokenDomainModel>


    constructor(input: IRefreshTokenMongoRepositoryDeps) {
        super();
        this.collection = input.refreshTokenCollection;
    };

    @failThrows500('REFRESH_TOKEN_SAVE_FAILED')
    public async saveRefreshToken(input: Parameters<TSaveRefreshToken>[0]): ReturnType<TSaveRefreshToken>  {
        const {
            refreshToken,
            user_id,
            expiresAt,
            createdAt
        } = input.refreshTokenDomainModel;

        const result = await this.collection
            .insertOne({
                refreshToken,
                user_id,
                expiresAt,
                createdAt
            });

        if (!result.acknowledged || !result.insertedId) {
            return false
        }

        return true;
    };

    @failThrows500('REFRESH_TOKEN_FIND_FAILED')
    public async findRefreshToken(input: Parameters<TFindRefreshToken>[0]): ReturnType<TFindRefreshToken> {
        const { refreshToken } = input;
        const result = await this.collection.findOne({ refreshToken: refreshToken });

        if (!result) {
            return null
        }

        return this.mapMongoDocToDomainModel({ doc: result });
    };

    @failThrows500('REFRESH_TOKEN_DELETE_FAILED')
    public async deleteRefreshToken(input :Parameters<TDeleteRefreshToken>[0]): ReturnType<TDeleteRefreshToken> {
        const { refreshToken } = input;

        const result = await this.collection.deleteOne({ refreshToken: refreshToken });

        if (result.deletedCount === 0) {
            return false
        }

        return { revokedToken: refreshToken};
    };

    @failThrows500('REFRESH_TOKEN_DELETE_ALL_FOR_USER_FAILED')
    public async deleteAllRefreshTokensForUser(input: Parameters<TDeleteAllRefreshTokensForUser>[0]): ReturnType<TDeleteAllRefreshTokensForUser> {
        const { user_id } = input;

        const result = await this.collection.deleteMany({ user_id: user_id });

        if (result.deletedCount === 0) {
            return false;
        }

        return true;
    };
}