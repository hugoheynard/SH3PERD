import type {IPlaylistTemplateService} from "../../types/playlistTemplate.core.types.js";
import {ObjectId} from "mongodb";
import {wrapServiceWithTryCatch} from "../../../utils/errorManagement/tryCatch/tryCatchServiceWrapper.js";


export const playlistTemplateService = (input: IPlaylistTemplateService["input"]) => {
    const { playlistTemplateCollection } = input;

    const service: IPlaylistTemplateService["output"] = {
        getPlaylistTemplates: async (): Promise<TPlaylistTemplateDocument[]> => {
            return await playlistTemplateCollection.find().toArray();
        },
        postPlaylistTemplate: async (input)=>{
            return await playlistTemplateCollection.insertOne(input.playlistTemplateData);
        },
        updatePlaylistTemplate: async (input)=>{
            return await playlistTemplateCollection.updateOne(
                { _id: new ObjectId(input.playlistTemplateData._id) },
                { $set: input.playlistTemplateData }
            );
        },
        deletePlaylistTemplate: async (input) =>{
            return await playlistTemplateCollection.deleteOne({_id: new ObjectId(input.playlistTemplate_id) });
        },
    };

    return wrapServiceWithTryCatch({
        service: service,
        serviceName: 'playlistTemplateService'
    });
};