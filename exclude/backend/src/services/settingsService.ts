import {Collection, ObjectId} from "mongodb";

export interface SettingsService {
    getWeekTemplate: (input: { company_id: string }) => Promise<any>;
    updateWeekTemplate: (input: { settings_id: string, data: any[] }) => Promise<void>;
    getOrganogram: (input: { settings_id: string }) => Promise<any>;
    updateOrganogram: (input: { settings_id: string }) => Promise<any>;
    [key:any]:any;
}

export const settingsService = (input: { collection: Collection }): SettingsService => {
    const { collection } = input;

    return {
        //weekTemplate
        async getWeekTemplate(input) {
            const { company_id } = input;

            try {
                const result = await collection.findOne(
                    { _id: new ObjectId(company_id)},
                    { projection: { weekTemplate: 1, _id: 0 } });

                if (!result) {
                    throw new Error('no results on fetching settings week template')
                }
                return result.weekTemplate
            } catch(err: any) {
                console.error('Database or unexpected error:', err.message);
                throw new Error('Error fetching settings week template');
            }
        },

        async updateWeekTemplate(input){
            const { settings_id , data } = input;

            try {
                const update = await collection.updateOne(
                    { "_id": new ObjectId(settings_id) },
                    { "$set": { "weekTemplate": data } }
                );

                if (update.matchedCount === 0) {
                    throw new Error('No document found to update.');
                }

                if (update.modifiedCount === 0) {
                    throw new Error('Document found, but no changes were made.');
                }

                return update;
            } catch(err: any) {
                console.error('Database or unexpected error:', err.message);
                throw new Error('Error while updating settings week template');
            }

        },

        //organogram
        async getOrganogram(input){
            console.log('hello orga')
        },

        async updateOrganogram(input){

        }
    }

}