export class UserService {
    constructor(input) {
        this.userCollection = input.collection;
        this.tools = input.tools;
    };

    /**
    * gets the user according to token information company
     * company_id: the companySpace you're currently visiting
     * contract_id: the contract user is on with this company
     * */
    async getUser(query) {
        try {
            return await this.userCollection.find(query).toArray();
        }catch (err) {
            console.error("Error retrieving users:", err);
            throw err;
        }
    };
}