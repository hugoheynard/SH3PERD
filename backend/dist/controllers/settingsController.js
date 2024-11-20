import { ObjectId } from "mongodb";
export const settingsController = (input) => {
    const { settingsService } = input.services;
    return {
        settingService: settingsService,
        async getWeekTemplate(id) {
            const data = await this.settingsService.collection.findOne({ _id: new ObjectId(id) });
            return data.weekTemplate;
        },
        async updateWeekTemplate(input) {
            this.settingsService.collection.updateOne({ "_id": new ObjectId(input.id) }, { "$set": { "weekTemplate": input.data } });
        }
    };
};
