import {ObjectId} from "mongodb";

export class SettingsController {
    constructor(input) {
        this.settingService = input.settingsService;
    };

    async getWeekTemplate(id) {
        const data = await this.settingService.collection.findOne({ _id: new ObjectId(id)});
        return data.weekTemplate;
    };

    async updateWeekTemplate(input) {
        this.settingService.collection.updateOne(
            { "_id": new ObjectId(input.id) },
            { "$set": { "weekTemplate": input.data } }
        )
    };

}