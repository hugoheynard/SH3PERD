export class ContractService{
    constructor(input) {
        this.contractCollection = input.collection;
    };
    async getContractsByUserId(userId) {
        return await this.contractCollection.find({ owner: userId })
    };
}