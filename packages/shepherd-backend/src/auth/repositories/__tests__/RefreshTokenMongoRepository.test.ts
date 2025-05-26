import {jest} from '@jest/globals';
import type {Collection, DeleteResult, Document, InsertOneResult} from "mongodb";
import {RefreshTokenMongoRepository} from "../RefreshTokenMongoRepository.js";
import {ObjectId} from "mongodb";
import type {TRefreshToken, TRefreshTokenDomainModel} from "@sh3pherd/shared-types";


/**
 * No need to test throws in this test file. Decorator tested in utils package.
 */
describe('RefreshTokenMongoRepository', () => {
    const mockCollection = {
        insertOne: jest.fn(),
        findOne: jest.fn(),
        deleteOne: jest.fn(),
        deleteMany: jest.fn()
    } as unknown as jest.Mocked<Collection<TRefreshTokenDomainModel>>;

    const mockToken: TRefreshTokenDomainModel = {
        refreshToken: 'refresh_abc' as TRefreshToken,
        user_id: 'user_1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000)
    };

    const repository = new RefreshTokenMongoRepository({
        refreshTokenCollection: mockCollection
    });

    beforeEach(() => jest.clearAllMocks());

    it('should return true when saving a refresh token succeeds', async () => {
        mockCollection.insertOne.mockResolvedValueOnce({
            acknowledged: true,
            insertedId: new ObjectId()
        } as InsertOneResult<Document>);

        const result = await repository.saveRefreshToken({ refreshTokenDomainModel: mockToken });
        expect(result).toBe(true);
    });

    it('should return false when saving fails (not acknowledged)', async () => {
        mockCollection.insertOne.mockResolvedValueOnce({
            acknowledged: false
        } as InsertOneResult<Document>);

        const result = await repository.saveRefreshToken({ refreshTokenDomainModel: mockToken });
        expect(result).toBe(false);
    });

    it('should return the domain model when finding an existing refresh token', async () => {
        mockCollection.findOne.mockResolvedValueOnce(mockToken);
        const result = await repository.findRefreshToken({ refreshToken: mockToken.refreshToken });
        expect(result).toEqual(mockToken);
    });

    it('should return null when no refresh token is found', async () => {
        mockCollection.findOne.mockResolvedValueOnce(null);
        const result = await repository.findRefreshToken({ refreshToken: mockToken.refreshToken });
        expect(result).toBeNull();
    });

    it('should return {revokedToken} when deletion succeeds', async () => {
        mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 } as DeleteResult);
        const result = await repository.deleteRefreshToken({ refreshToken: mockToken.refreshToken });
        expect(result).toEqual({ revokedToken: mockToken.refreshToken });
    });

    it('should return false when refresh token deletion fails (not found)', async () => {
        mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 } as DeleteResult);
        const result = await repository.deleteRefreshToken({ refreshToken: mockToken.refreshToken });
        expect(result).toBe(false);
    });

    it('should return true when user tokens are deleted', async () => {
        mockCollection.deleteMany.mockResolvedValueOnce({ deletedCount: 2 } as DeleteResult);
        const result = await repository.deleteAllRefreshTokensForUser({ user_id: mockToken.user_id });
        expect(result).toBe(true);
    });

    it('should return false when no tokens are deleted for user', async () => {
        mockCollection.deleteMany.mockResolvedValueOnce({ deletedCount: 0 } as DeleteResult);
        const result = await repository.deleteAllRefreshTokensForUser({ user_id: mockToken.user_id });
        expect(result).toBe(false);
    });
});
