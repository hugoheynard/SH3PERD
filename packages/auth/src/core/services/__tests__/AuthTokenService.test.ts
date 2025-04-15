import {RefreshTokenMongoRepository} from "../../../adapters/repositories/RefreshTokenMongoRepository";
import {RefreshTokenManager} from "@sh3pherd/token-manager";
import type {TUserId_shared} from "@sh3pherd/shared-utils";
import type {TRefreshToken, TRefreshTokenDomainModel} from "../../../domain/models/refreshToken.types";
import type {IAbstractAuthTokenManager} from "../../../domain/models/IAbstractAuthTokenManager";
import {AuthTokenService} from "../AuthTokenService";
import {mapMongoDocToDomainModel} from "@sh3pherd/shared-utils";
import type {WithId, DeleteResult, Document, InsertOneResult, Collection} from "mongodb";
import {ObjectId} from "mongodb";
import {jest} from "@jest/globals";

describe('AuthTokenService - Intégration', () => {
    const mockUserId = 'user_123' as TUserId_shared;

    const fakeMongoDoc: WithId<TRefreshTokenDomainModel> = {
        _id: new ObjectId(),
        refreshToken: 'refreshToken_abc123',
        user_id: 'user_001',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        createdAt: new Date(),
    };

    const mockMongoCollection = {
        insertOne: jest.fn<() => Promise<InsertOneResult<Document>>>().mockResolvedValue({
            acknowledged: true,
            insertedId: new ObjectId(),
        }),
        findOne: jest.fn<() => Promise<WithId<TRefreshTokenDomainModel> | null>>().mockResolvedValue(fakeMongoDoc),

        deleteOne: jest.fn<() => Promise<DeleteResult>>().mockResolvedValue({ deletedCount: 1, acknowledged: true }),
    };

    const realRefreshTokenManager = new RefreshTokenManager({
        refreshTokenRepository: new RefreshTokenMongoRepository({
            refreshTokenCollection: mockMongoCollection as unknown as Collection<TRefreshTokenDomainModel>,
            mapMongoDocToDomainModelFn: mapMongoDocToDomainModel,
        }),
        generatorFunction: () => Promise.resolve('refreshToken_abc123' as TRefreshToken),
        validateRefreshTokenDateFn: () => true,
        ttlMs: 1000 * 60 * 60 * 24,
    });

    const realAuthTokenManager: IAbstractAuthTokenManager = {
        generateAuthToken: async () => 'access_xyz',
        verifyAuthToken: async ({ token }) => {
            void token; // 👈 avoids unused variable error
            return { user_id: mockUserId };
        },
    };

    const service = new AuthTokenService({
        authTokenManager: realAuthTokenManager,
        refreshTokenManager: realRefreshTokenManager,
    });

    it('should create a full auth session with access and refresh tokens', async () => {
        const result = await service.createAuthSession({ user_id: mockUserId });

        expect(result).toEqual({
            authToken: 'access_xyz',
            refreshToken: 'refreshToken_abc123',
        });
    });
});