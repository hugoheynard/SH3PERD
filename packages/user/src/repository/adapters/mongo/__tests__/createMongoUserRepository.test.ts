import {jest} from '@jest/globals';
import type { Collection, InsertOneResult, Document } from 'mongodb';
import {createMongoUserRepository} from "../createMongoUserRepository";
import type {UserDomainModel} from "../../../../domain/types";


describe('MongoUserRepository', () => {
    const insertOne = jest.fn<(user: Document) => Promise<InsertOneResult<Document>>>();
    const findOne = jest.fn<(query: Partial<Document>) => Promise<Document | null>>();


    const mockCollection = {
        insertOne,
        findOne,
    } as unknown as Collection;

    const repository = createMongoUserRepository({ collection: mockCollection });

    const fakeUser: UserDomainModel = {
        user_id: 'user_123',
        email: 'test@example.com',
        password: 'hashedPassword',
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        insertOne.mockReset();
        findOne.mockReset();
    });

    describe('saveUser', () => {
        it('should return success true when insert is acknowledged', async () => {
            insertOne.mockResolvedValueOnce({ acknowledged: true } as InsertOneResult<Document>);
            const result = await repository.saveUser({ user: fakeUser });

            expect(insertOne).toHaveBeenCalledWith(fakeUser);
            expect(result).toEqual({ success: true });
        });

        it('should return success false when insert is not acknowledged', async () => {
            insertOne.mockResolvedValueOnce({ acknowledged: false } as InsertOneResult<Document>);
            const result = await repository.saveUser({ user: fakeUser });

            expect(result).toEqual({ success: false, reason: 'Insert failed' });
        });
    });

    describe('findUserByEmail', () => {
        it('should return mapped user when found', async () => {
            const now = new Date();
            findOne.mockResolvedValueOnce({
                user_id: 'user_123',
                email: fakeUser.email,
                password: fakeUser.password,
                created_at: now,
                updated_at: now,
            });

            const result = await repository.findUserByEmail({ email: fakeUser.email });

            expect(result).not.toHaveProperty('_id')
            expect(result).toEqual({
                user_id: 'user_123',
                email: fakeUser.email,
                password: fakeUser.password,
                created_at: now,
                updated_at: now,
            });
        });

        it('should return null when no user found', async () => {
            findOne.mockResolvedValueOnce(null);
            const result = await repository.findUserByEmail({ email: fakeUser.email });
            expect(result).toBeNull();
        });
    });
});
