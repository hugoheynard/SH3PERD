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
        /*
        return await this.userCollection
            .aggregate([
                {
                    $match: {
                        startDate: { $lte: new Date(req.date) },
                        endDate: { $gte: new Date(req.date) }
                    }
                },
                {
                    $lookup: {
                        from: 'staffs',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'staff'
                    }
                },
                {
                    $unwind: "$staff"
                },
                {
                    $project: {
                        _id: 0,
                        staff: 1
                    }
                }

            ])
            .toArray()
            .then(res => res.map(entry => entry.staff))
        //.then(res => res.map(staff => staff._id.toString()));
*/
        try {
            return await this.userCollection.find(query).toArray();
        }catch (err) {
            console.error("Error retrieving users:", err);
            throw err;
        }
    };
}