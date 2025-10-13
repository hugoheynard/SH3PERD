import { BaseMongoRepository } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type { TRefreshTokenRecord } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';


export type IRefreshTokenRepository = IBaseCRUD<TRefreshTokenRecord> & {};


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
export class RefreshTokenMongoRepository
  extends BaseMongoRepository<TRefreshTokenRecord>
  implements IRefreshTokenRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }
}
