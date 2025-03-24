import {type Collection, ObjectId} from "mongodb";
import {userQueryBuilder} from "../tools/users/UserQueryBuilder";
import {StaffSortingAlgorithms} from "../tools/users/StaffSortingAlgorithms";
import type {User, UsersQueryParams} from "../interfaces/User";


export interface UserService {
    input: {
        collection: Collection<User>;
    };
    output: {
        getUser: (query: UsersQueryParams) => Promise<User[]>;
        userSearch: (input: { usersId : string[]}) => Promise<User[]>;
    }

}

export const userService = (input: UserService['input']): UserService['output'] => {
    const {collection} = input;

    const queryBuilder = userQueryBuilder;
    const staffSorter = StaffSortingAlgorithms

    return {
        /**
         * gets the user according to token information settings
         * company_id: the companySpace you're currently visiting
         * contract_id: the contract user is on with this settings
         * */
        async getUser(query) {
            try {
                return await collection.find(query).toArray();
            } catch (err: any) {
                console.error("Error retrieving users:", err);
                throw err;
            }
        },

        async userSearch(input){
            try {
                const usersObjectIds: ObjectId[] = input.usersId.map(id=> new ObjectId(id));

                return await collection.find({ _id: { $in: usersObjectIds } }).toArray();

            } catch(err: any) {
                console.error("Error retrieving users:", err);
                throw err;
            }
        }


    }

}