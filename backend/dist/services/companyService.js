import { ObjectId } from "mongodb";
export const companyService = (input) => {
    const { collection } = input;
    return {
        async getCompanyByCompanyId(company_id) {
            if (Array.isArray(company_id)) {
                return await collection.find({ _id: { $in: company_id } }).toArray();
            }
            return await collection.find({ _id: new ObjectId(company_id) }).toArray();
        },
        async getCompanySettings(company_id) {
            try {
                const result = await collection
                    .findOne({
                    _id: new ObjectId(company_id)
                }, { projection: { settings: 1, _id: 0 } });
                if (result === null) {
                    throw new Error(`Company settings fetching is null, id: ${company_id}`);
                }
                return result.settings;
            }
            catch (err) {
                console.error(`Error fetching for company settings, id: ${company_id}`);
                throw err;
            }
        }
    };
};
//# sourceMappingURL=companyService.js.map