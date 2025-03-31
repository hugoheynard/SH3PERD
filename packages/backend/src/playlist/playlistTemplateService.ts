import type {IPlaylistTemplateService} from "./interfaces/IPlaylistTemplateService";
import {ObjectId} from "mongodb";
import {wrapServiceWithTryCatch} from "@sh3pherd/shared-utils/tryCatchs/tryCatchServiceWrapper";
import type {PlaylistTemplateDocument} from "./interfaces/IPlaylistTemplate";

export const playlistTemplateService = (input: IPlaylistTemplateService["input"]) => {
    const { playlistTemplateCollection } = input;

    const service: IPlaylistTemplateService["output"] = {
        getPlaylistTemplates: async (): Promise<PlaylistTemplateDocument[]> => {
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