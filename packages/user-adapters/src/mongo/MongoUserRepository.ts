import type { Collection, InsertOneResult } from 'mongodb';
import type { User } from '@sh3pherd/domain-user';

interface MongoUserRepository {
    saveUser: (user: User) => Promise<InsertOneResult<User>>;
    findUserByEmail: (email: string) => Promise<User | null>;
}

export const createMongoUserRepository = (input: { collection: Collection<User> })  => {
    const { collection } = input;

    const service: MongoUserRepository =  {
        saveUser: async (user: User): Promise<InsertOneResult<User>> => {
            return await collection.insertOne(user);
        },
        findUserByEmail: async (email: string) => {
            return collection.findOne({ email });
        },
    };

    return service;
};