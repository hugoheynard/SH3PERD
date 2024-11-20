import {ObjectId} from "mongodb";

export interface SettingsControllerInput {
    services: {
        settingsService: any
    }
}


export const settingsController = (input: SettingsControllerInput): any => {
    const { settingsService } = input.services;

    return {
        settingService: settingsService,

        async getWeekTemplate(id: string): Promise<any> {
            const data = await this.settingsService.collection.findOne({ _id: new ObjectId(id)});
            return data.weekTemplate;
        },

        async updateWeekTemplate(input: any): Promise<void> {
            this.settingsService.collection.updateOne(
                { "_id": new ObjectId(input.id) },
                { "$set": { "weekTemplate": input.data } }
            )
        }
    }

}