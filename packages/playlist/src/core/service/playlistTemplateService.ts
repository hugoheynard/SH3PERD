
import {ObjectId} from "mongodb";
import {wrapServiceWithTryCatch} from "@sh3pherd/shared-utils";
import type {IPlaylistTemplateService} from "@sh3pherd/shared-types";


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