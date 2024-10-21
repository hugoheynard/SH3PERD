export class ContractController{
    constructor(input){
        this.contractService = input.contractService;
    };

    async getContractsByUserId(userId) {
        return this.contractService.getContractsByUserId(userId);
    };
}