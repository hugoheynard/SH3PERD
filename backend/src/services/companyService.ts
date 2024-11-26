import {ObjectId} from "mongodb";

export const companyService = (input: any): any => {
    const collection = input.collection;

    return {
        async getCompanyByCompanyId(company_id): Promise<any> {
            if (Array.isArray(company_id)) {
                return await companyCollection.find({_id: {$in: company_id}}).toArray();
            }

            return await companyCollection.find({_id: new ObjectId(company_id)}).toArray();
        },

        async getCompanySettings(company_id): Promise<any> {
            const result = await companyCollection
                .findOne({
                        _id: new ObjectId(company_id)
                    },
                    {projection: {settings: 1, _id: 0}}
                )
            return result.settings
        }
    }
}