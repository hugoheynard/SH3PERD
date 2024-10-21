import {ObjectId} from "mongodb";

export class CompanyService{
    constructor(input) {
        this.companyCollection = input.collection;
    };
    async getCompanyByCompanyId(company_id) {
        if (Array.isArray(company_id)) {
            return await this.companyCollection.find({ _id: { $in: company_id } }).toArray();
        }

        return await this.companyCollection.find({ _id: new ObjectId(company_id) }).toArray();
    };
}