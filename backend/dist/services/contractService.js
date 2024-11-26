import { Collection, ObjectId } from "mongodb";
export const contractService = (input) => {
    const { collection } = input;
    return {
        async getContractsByUserId(userId) {
            try {
                const objectId = new ObjectId(userId);
                return await collection.find({ owner: objectId }).toArray();
            }
            catch (e) {
                throw new Error('Failed to fetch contracts for user', e);
            }
        }
    };
};
//# sourceMappingURL=contractService.js.map