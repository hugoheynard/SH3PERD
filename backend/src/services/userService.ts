import {type Collection, ObjectId} from "mongodb";
import {userQueryBuilder} from "../tools/users/UserQueryBuilder";
import {StaffSortingAlgorithms} from "../tools/users/StaffSortingAlgorithms";

export interface UserServiceInput {
    collection: Collection<any>;
    tools: any
}

export interface UserService {
    getUser(query: any): Promise<any[]>;
}

export const userService = (input: UserServiceInput): UserService => {
    const {collection} = input;

    return {
        tools: {
            queryBuilder: userQueryBuilder,
            staffSorter: StaffSortingAlgorithms
        },
        /**
         * gets the user according to token information settings
         * company_id: the companySpace you're currently visiting
         * contract_id: the contract user is on with this settings
         * */
        async getUser(query: any): Promise<void> {
            try {
                return await collection.find(query).toArray();
            } catch (err: any) {
                console.error("Error retrieving users:", err);
                throw err;
            }
        },

        async userSearch(input: { usersId : string[]}): Promise<any> {
            try {
                const usersObjectIds: ObjectId[] = input.usersId.map((id: string)=> new ObjectId(id));

                return await collection.find({ _id: { $in: usersObjectIds } }).toArray();

            } catch(err: any) {
                console.error("Error retrieving users:", err);
                throw err;
            }
        }


    }

}