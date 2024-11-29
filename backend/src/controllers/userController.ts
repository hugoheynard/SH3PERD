export const userController = (input: any): any => {
    const { contractService, companyService } = input.services

    return {
        async getCompaniesByUserId(userId: any) {
            //find all contracts related to user
            const userContracts = await contractService.getContractsByUserId(userId);

            //uses them to get a list of unique companies related to the contracts
            const userCompaniesId = userContracts.map((contract: any) => contract.company);
            const uniqueCompaniesId = [...new Set(userCompaniesId)]
            const userCompanies = await companyService.getCompanyByCompanyId(uniqueCompaniesId);


            console.log(userCompanies)
        }
    }
}