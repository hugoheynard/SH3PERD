import {Collection, ObjectId} from "mongodb";

export interface ContractServiceInput {
    collection: Collection<any>
}

export interface ContractService {
    getContractsByUserId(userId: string): Promise<any[]>;
}

export const contractService = (input: ContractServiceInput): ContractService => {
    const {collection} = input;

    return {
        async getContractsByUserId(userId: string) {
            try {
                const objectId = new ObjectId(userId);
                return await collection.find({owner: objectId}).toArray();
            } catch (e: any) {
                throw new Error('Failed to fetch contracts for user', e);
            }
        }
    }
}

