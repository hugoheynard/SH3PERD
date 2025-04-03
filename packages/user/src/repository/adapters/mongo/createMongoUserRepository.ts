import type { Collection, ObjectId } from 'mongodb';
import type {IUserRepository, TSaveUserResult, UserDomainModel} from "../../../domain/types";

export type MongoUser = UserDomainModel & { _id: ObjectId};

export const createMongoUserRepository = (input: { collection: Collection<UserDomainModel> })  => {
    const { collection } = input;

    const repository: IUserRepository =  {
        saveUser: async (input: { user: UserDomainModel }): Promise<TSaveUserResult> => {
            const result = await collection.insertOne(input.user);

            if (result.acknowledged) {
                return { success: true };
            }

            return { success: false, reason: 'Insert failed' };
        },

        findUserByEmail: async ({ email})=> {
            const result = await collection.findOne({ email }) as MongoUser | null;
            if (!result) return null;

            const { _id, ...user } = result;
            return user;
        },
    };

    return repository;
};