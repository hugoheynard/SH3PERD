export const userController = (input) => {
    const { contractService, companyService } = input.services;
    return {
        async getCompaniesByUserId(userId) {
            //find all contracts related to user
            const userContracts = await contractService.getContractsByUserId(userId);
            //uses them to get a list of unique companies related to the contracts
            const userCompaniesId = userContracts.map((contract) => contract.company);
            const uniqueCompaniesId = [...new Set(userCompaniesId)];
            const userCompanies = await companyService.getCompanyByCompanyId(uniqueCompaniesId);
            console.log(userCompanies);
        }
    };
};
//# sourceMappingURL=userController.js.map