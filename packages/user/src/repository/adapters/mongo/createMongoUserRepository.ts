import type { Collection, ObjectId } from 'mongodb';
import type {IUserRepository, TSaveUserResult, TUserDomainModel} from "@sh3pherd/shared-types";
export type MongoUser = TUserDomainModel & { _id: ObjectId};

export const createMongoUserRepository = (input: { collection: Collection<TUserDomainModel> })  => {
    const { collection } = input;

    const repository: IUserRepository =  {
        saveUser: async (input: { user: TUserDomainModel }): Promise<TSaveUserResult> => {
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