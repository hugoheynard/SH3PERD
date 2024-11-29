import {type Collection, ObjectId } from "mongodb";

export const companyService = (input: { collection: Collection }): any => {
    const { collection } = input;

    return {
        async getCompanyByCompanyId(company_id: string): Promise<any> {
            if (Array.isArray(company_id)) {
                return await collection.find({_id: {$in: company_id}}).toArray();
            }

            return await collection.find({_id: new ObjectId(company_id)}).toArray();
        },

        async getCompanySettings(company_id: string): Promise<any | null>  {
            try {
                const result = await collection
                    .findOne({
                            _id: new ObjectId(company_id)
                        },
                        {projection: {settings: 1, _id: 0}}
                    )

                if (result === null) {
                    throw new Error(`Company settings fetching is null, id: ${company_id}`);
                }

                return result.settings
            } catch(err: any) {
                console.error(`Error fetching for company settings, id: ${company_id}` )
                throw err;
            }
        }
    }
}