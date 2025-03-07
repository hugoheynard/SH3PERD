import type {PlaylistTemplateService} from "../interfaces/PlaylistService";

export const playlistTemplateService = (input: PlaylistTemplateService["input"]): PlaylistTemplateService["output"] => {
    const { playlistTemplateCollection } = input;

    return {
        async getPlaylistTemplates(){
            try {
                return await playlistTemplateCollection.find().toArray();
            } catch (err) {
                throw new Error('[Service error]: Could not get playlist templates', err);
            }
        },
        async postPlaylistTemplate(input){
            try {
                return await playlistTemplateCollection.insertOne(input.playlistTemplateData);
            } catch (err) {
                throw new Error('[Service error]: Could not insert playlist template', err);
            }
        },
        async updatePlaylistTemplate(input){
            try {
                return await playlistTemplateCollection.updateOne(
                    { _id: input.playlistTemplateData._id },
                    { $set: input.playlistTemplateData }
                );
            } catch (err) {
                throw new Error('[Service error]: Could not update playlist template', err);
            }
        },
        async deletePlaylistTemplate(input) {
            try {
                return await playlistTemplateCollection.deleteOne({_id: input.playlistTemplate_id});
            } catch (err) {
                throw new Error('[Service error]: Could not delete playlist template', err);
            }
        },
    }
};