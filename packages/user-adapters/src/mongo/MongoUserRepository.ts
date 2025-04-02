import type { Collection, InsertOneResult } from 'mongodb';
import type { UserDomainModel } from '@sh3pherd/domain-user';

interface MongoUserRepository {
    saveUser: (user: UserDomainModel) => Promise<InsertOneResult<UserDomainModel>>;
    findUserByEmail: (email: string) => Promise<UserDomainModel | null>;
}

export const createMongoUserRepository = (input: { collection: Collection<UserDomainModel> })  => {
    const { collection } = input;

    const service: MongoUserRepository =  {
        saveUser: async (user: UserDomainModel): Promise<InsertOneResult<UserDomainModel>> => {
            return await collection.insertOne(user);
        },
        findUserByEmail: async (email: string) => {
            return collection.findOne({ email });
        },
    };

    return service;
};