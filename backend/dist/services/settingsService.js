import { ObjectId } from "mongodb";
export const settingsService = (input) => {
    const settingsCollection = input.collection;
    return {
        //weekTemplate
        async getWeekTemplate(input) {
            const { company_id } = input;
            try {
                const result = await settingsCollection.findOne({ _id: new ObjectId(company_id) }, { projection: { weekTemplate: 1, _id: 0 } });
                if (!result) {
                    throw new Error('no results on fetching settings week template');
                }
                return result.weekTemplate;
            }
            catch (err) {
                console.error('Database or unexpected error:', err.message);
                throw new Error('Error fetching settings week template');
            }
        },
        async updateWeekTemplate(input) {
            const { settings_id, data } = input;
            try {
                const update = await settingsCollection.updateOne({ "_id": new ObjectId(settings_id) }, { "$set": { "weekTemplate": data } });
                if (update.matchedCount === 0) {
                    throw new Error('No document found to update.');
                }
                if (update.modifiedCount === 0) {
                    throw new Error('Document found, but no changes were made.');
                }
                return update;
            }
            catch (err) {
                console.error('Database or unexpected error:', err.message);
                throw new Error('Error while updating settings week template');
            }
        },
        //organogram
        async getOrganogram(input) {
            console.log('hello orga');
        },
        async updateOrganogram(input) {
        }
    };
};
//# sourceMappingURL=settingsService.js.map