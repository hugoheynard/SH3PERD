import type {PlaylistTemplateService} from "../../../../shared/interfaces/mongoDocuments/playlistTemplateInterfaces";

export const playlistTemplateService = (input: PlaylistTemplateService["input"]): PlaylistTemplateService["output"] => {
    const { playlistTemplateCollection } = input;

    return {
        async postPlaylistTemplate(input){
            try {
                return await playlistTemplateCollection.insertOne(input.playlistTemplateData);
            } catch (err) {
                throw new Error('[Service error]: Could not insert playlist template', err);
            }
        },

    }
};