import {ObjectId} from "mongodb";

export class ContractService{
    constructor(input) {
        this.contractCollection = input.collection;
    };
    async getContractsByUserId(userId) {
        try {
            const objectId = new ObjectId(userId)
            return await this.contractCollection.find({ owner: objectId }).toArray();
        } catch(e) {
            throw new Error('Failed to fetch contracts for user', e);
        }
    };
}