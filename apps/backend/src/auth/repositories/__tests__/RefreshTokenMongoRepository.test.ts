import { jest } from '@jest/globals';
import type { Collection, Document, InsertOneResult, DeleteResult, WithId } from 'mongodb';
import { RefreshTokenMongoRepository } from '../RefreshTokenMongoRepository.js';
import { ObjectId } from 'mongodb';
import type { TRefreshTokenRecord, TRefreshToken } from '@sh3pherd/shared-types';

/**
 * Tests that RefreshTokenMongoRepository (extending BaseMongoRepository)
 * correctly delegates CRUD operations to the MongoDB collection.
 */

const mockCollection = {
  insertOne: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
} as unknown as jest.Mocked<Collection<TRefreshTokenRecord>>;

const mockClient = {
  db: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue(mockCollection),
  }),
} as any;

const mockDeps = {
  client: mockClient,
  dbName: 'testDb',
  collectionName: 'refresh_tokens',
};

const mockToken: TRefreshTokenRecord = {
  id: 'refreshToken_abc' as TRefreshToken,
  refreshToken: 'hashed-abc' as TRefreshToken,
  user_id: 'user_1' as any,
  family_id: 'family-1',
  isRevoked: false,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 10000),
};

describe('RefreshTokenMongoRepository', () => {
  const repository = new RefreshTokenMongoRepository(mockDeps);

  beforeEach(() => jest.clearAllMocks());

  it('should return true when save succeeds', async () => {
    mockCollection.insertOne.mockResolvedValueOnce({
      acknowledged: true,
      insertedId: new ObjectId(),
    } as InsertOneResult<Document>);

    const result = await repository.save(mockToken as any);
    expect(result).toBe(true);
  });

  it('should return false when save fails (not acknowledged)', async () => {
    mockCollection.insertOne.mockResolvedValueOnce({
      acknowledged: false,
    } as InsertOneResult<Document>);

    const result = await repository.save(mockToken as any);
    expect(result).toBe(false);
  });

  it('should return the domain model when findOne finds a token', async () => {
    const mongoDoc = { ...mockToken, _id: new ObjectId() } as WithId<TRefreshTokenRecord>;
    mockCollection.findOne.mockResolvedValueOnce(mongoDoc);

    const result = await repository.findOne({
      filter: { refreshToken: mockToken.refreshToken } as any,
    });
    expect(result).toEqual(mockToken);
  });

  it('should return null when findOne finds nothing', async () => {
    mockCollection.findOne.mockResolvedValueOnce(null);

    const result = await repository.findOne({ filter: { refreshToken: 'nonexistent' } as any });
    expect(result).toBeNull();
  });

  it('should return true when deleteOne succeeds', async () => {
    mockCollection.deleteOne.mockResolvedValueOnce({
      acknowledged: true,
      deletedCount: 1,
    } as DeleteResult);

    const result = await repository.deleteOne({ refreshToken: mockToken.refreshToken } as any);
    expect(result).toBe(true);
  });

  it('should return false when deleteOne finds nothing', async () => {
    mockCollection.deleteOne.mockResolvedValueOnce({
      acknowledged: true,
      deletedCount: 0,
    } as DeleteResult);

    const result = await repository.deleteOne({ refreshToken: 'nonexistent' } as any);
    expect(result).toBe(false);
  });

  it('should return true when deleteMany removes tokens', async () => {
    mockCollection.deleteMany.mockResolvedValueOnce({
      acknowledged: true,
      deletedCount: 2,
    } as DeleteResult);

    const result = await repository.deleteMany({ user_id: mockToken.user_id } as any);
    expect(result).toBe(true);
  });

  it('should return false when deleteMany removes nothing', async () => {
    mockCollection.deleteMany.mockResolvedValueOnce({
      acknowledged: true,
      deletedCount: 0,
    } as DeleteResult);

    const result = await repository.deleteMany({ user_id: 'user_nonexistent' } as any);
    expect(result).toBe(false);
  });
});
