import type {Collection, DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import type {PlaylistTemplateDocument} from "./IPlaylistTemplate";

export interface IPlaylistTemplateService {
    input: {
        playlistTemplateCollection: Collection<PlaylistTemplateDocument>;
    },
    output: {
        getPlaylistTemplates: () => Promise<PlaylistTemplateDocument[]>;
        postPlaylistTemplate: (input: { playlistTemplateData: any } ) => Promise<InsertOneResult>
        updatePlaylistTemplate: (input: { playlistTemplateData: any } ) => Promise<UpdateResult>;
        deletePlaylistTemplate: (input: { playlistTemplate_id: string }) => Promise<DeleteResult>;
    }
}