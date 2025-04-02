import type { Collection, ObjectId } from 'mongodb';
import type {IUserRepository, UserDomainModel} from "../../../domain/types";

type MongoUser = UserDomainModel & { _id: ObjectId};

export const createMongoUserRepository = (input: { collection: Collection<MongoUser> })  => {
    const { collection } = input;

    const repository: IUserRepository =  {
        saveUser: async (input) => {
            const result = await collection.insertOne(input.user);

            if (result.acknowledged) {
                return { success: true };
            }

            return { success: false, reason: 'Insert failed' };
        },

        findUserByEmail: async ({ email})=> {
            const result = await collection.findOne({ email }) as MongoUser;
            if (!result) return null;

            const { _id, ...user } = result;
            return user;
        },
    };

    return repository;
};