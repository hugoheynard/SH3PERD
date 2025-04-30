import {jest} from '@jest/globals';
import type {Collection, DeleteResult, Document, InsertOneResult} from "mongodb";
import {RefreshTokenMongoRepository} from "../RefreshTokenMongoRepository.js";
import type {TmapMongoDocToDomainModelFunction} from "@sh3pherd/shared-utils";
import {ObjectId} from "mongodb";
import type {TRefreshToken, TRefreshTokenDomainModel} from "@sh3pherd/shared-types";



describe('RefreshTokenMongoRepository', () => {
    const mockCollection = {
        insertOne: jest.fn(),
        findOne: jest.fn(),
        deleteOne: jest.fn(),
    } as unknown as jest.Mocked<Collection<TRefreshTokenDomainModel>>;

    const mockTokenRecord: TRefreshTokenDomainModel = {
        refreshToken: 'refresh_abc123' as TRefreshToken,
        user_id: 'user_001',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        createdAt: new Date(),
    };

    const mockMapDocToDomain = jest.fn((_input: any) => mockTokenRecord);


    const repository = new RefreshTokenMongoRepository({ refreshTokenCollection: mockCollection});


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save refresh token successfully', async () => {
        mockCollection.insertOne.mockResolvedValueOnce({ acknowledged: true, insertedId: new ObjectId() } as InsertOneResult<Document>);

        const result = await repository.saveRefreshToken({ refreshTokenDomainModel: mockTokenRecord });

        expect(result).toEqual({ success: true });
        expect(mockCollection.insertOne).toHaveBeenCalledWith(mockTokenRecord);
    });

    it('should throw if save fails', async () => {
        mockCollection.insertOne.mockResolvedValueOnce({ acknowledged: false } as InsertOneResult<Document>);

        await expect(repository.saveRefreshToken({ refreshTokenDomainModel: mockTokenRecord }))
            .rejects
            .toThrow('Failed to save refresh token');
    });

    it('should find and map a refresh token', async () => {
        const fakeMongoDoc = { ...mockTokenRecord, _id: 'mongoId' };
        mockCollection.findOne.mockResolvedValueOnce(fakeMongoDoc);
        mockMapDocToDomain.mockReturnValueOnce(mockTokenRecord);

        const result = await repository.findRefreshToken({ refreshToken: mockTokenRecord.refreshToken });

        expect(result).toEqual(mockTokenRecord);
        expect(mockCollection.findOne).toHaveBeenCalledWith({ refreshToken: mockTokenRecord.refreshToken });
        expect(mockMapDocToDomain).toHaveBeenCalledWith({ document: fakeMongoDoc });
    });

    it('should return null if refresh token not found', async () => {
        mockCollection.findOne.mockResolvedValueOnce(null);

        const result = await repository.findRefreshToken({ refreshToken: mockTokenRecord.refreshToken });

        expect(result).toBeNull();
    });

    it('should revoke refresh token', async () => {
        mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 } as DeleteResult);

        const result = await repository.deleteRefreshToken({ refreshToken: mockTokenRecord.refreshToken });

        expect(result).toEqual({ revokedToken: mockTokenRecord.refreshToken });
        expect(mockCollection.deleteOne).toHaveBeenCalledWith({ refreshToken: mockTokenRecord.refreshToken });
    });

    it('should throw if token not found when revoking', async () => {
        mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 } as DeleteResult);

        await expect(repository.deleteRefreshToken({ refreshToken: mockTokenRecord.refreshToken }))
            .rejects
            .toThrow(`Refresh token ${mockTokenRecord.refreshToken} not found or already revoked`);
    });
});
