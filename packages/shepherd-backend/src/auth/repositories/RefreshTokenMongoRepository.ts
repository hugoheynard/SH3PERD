import {autoBind} from "../../utils/classUtils/autoBind.js";
import {BaseMongoRepository} from "../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TRefreshTokenDomainModel} from "../types/auth.domain.tokens.js";
import type {IRefreshTokenRepository, TRefreshTokenMongoRepositoryDeps} from "../types/auth.core.tokens.contracts.js";
import {failThrows500} from "../../utils/errorManagement/tryCatch/failThrows500.js";
import type {
    TDeleteAllRefreshTokensForUserFn,
    TDeleteRefreshTokenFn,
    TFindRefreshTokenFn,
    TSaveRefreshTokenFn
} from "../types/auth.core.contracts.js";


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
    extends BaseMongoRepository<TRefreshTokenDomainModel>
    implements IRefreshTokenRepository {

    constructor(input: TRefreshTokenMongoRepositoryDeps) {
        super(input);
    };

    @failThrows500('REFRESH_TOKEN_SAVE_FAILED')
    public async saveRefreshToken(input: Parameters<TSaveRefreshTokenFn>[0]): ReturnType<TSaveRefreshTokenFn>  {
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
    public async findRefreshToken(input: Parameters<TFindRefreshTokenFn>[0]): ReturnType<TFindRefreshTokenFn> {
        return await this.findDocBy(input);
    };

    @failThrows500('REFRESH_TOKEN_DELETE_FAILED')
    public async deleteRefreshToken(input :Parameters<TDeleteRefreshTokenFn>[0]): ReturnType<TDeleteRefreshTokenFn> {
        const { refreshToken } = input;

        const result = await this.collection.deleteOne({ refreshToken: refreshToken });

        if (result.deletedCount === 0) {
            return false
        }

        return { revokedToken: refreshToken};
    };

    @failThrows500('REFRESH_TOKEN_DELETE_ALL_FOR_USER_FAILED')
    public async deleteAllRefreshTokensForUser(input: Parameters<TDeleteAllRefreshTokensForUserFn>[0]): ReturnType<TDeleteAllRefreshTokensForUserFn> {
        const { user_id } = input;

        const result = await this.collection.deleteMany({ user_id: user_id });

        if (result.deletedCount === 0) {
            return false;
        }

        return true;
    };
}