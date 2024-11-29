import { ObjectId } from "mongodb";
import { userQueryBuilder } from "../tools/users/UserQueryBuilder.js";
import { StaffSortingAlgorithms } from "../tools/users/StaffSortingAlgorithms.js";
export const userService = (input) => {
    const { collection } = input;
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
        async getUser(query) {
            try {
                return await collection.find(query).toArray();
            }
            catch (err) {
                console.error("Error retrieving users:", err);
                throw err;
            }
        },
        async userSearch(input) {
            try {
                const usersObjectIds = input.usersId.map(id => new ObjectId(id));
                return await collection.find({ _id: { $in: usersObjectIds } }).toArray();
            }
            catch (err) {
                console.error("Error retrieving users:", err);
                throw err;
            }
        }
    };
};
//# sourceMappingURL=userService.js.map