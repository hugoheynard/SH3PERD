export class UserController{
    constructor(input){
        this.contractService = input.contractService;
        this.companyService = input.companyService;
    };

    async getCompaniesByUserId(userId) {
        //find all contracts related to user
        const userContracts = await this.contractService.getContractsByUserId(userId);

        //uses them to get a list of unique companies related to the contracts
        const userCompaniesId = userContracts.map(contract => contract.company);
        const uniqueCompaniesId = [...new Set(userCompaniesId)]
        const userCompanies = await this.companyService.getCompanyByCompanyId(uniqueCompaniesId);


        console.log(userCompanies)
    };
}