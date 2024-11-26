import { ObjectId } from "mongodb";
export const companyService = (input) => {
    const collection = input.collection;
    return {
        async getCompanyByCompanyId(company_id) {
            if (Array.isArray(company_id)) {
                return await companyCollection.find({ _id: { $in: company_id } }).toArray();
            }
            return await companyCollection.find({ _id: new ObjectId(company_id) }).toArray();
        },
        async getCompanySettings(company_id) {
            const result = await companyCollection
                .findOne({
                _id: new ObjectId(company_id)
            }, { projection: { settings: 1, _id: 0 } });
            return result.settings;
        }
    };
};
//# sourceMappingURL=companyService.js.map