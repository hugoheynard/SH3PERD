import type {Collection, DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import type {TPlaylistTemplateDomainModel} from "./playlistTemplate.domain.types.js";

/**
 * Playlist Template Service
 */
export interface IPlaylistTemplateService {
    input: {
        playlistTemplateCollection: Collection<TPlaylistTemplateDomainModel>;
    },
    output: {
        getPlaylistTemplates: () => Promise<TPlaylistTemplateDomainModel[]>;
        postPlaylistTemplate: (input: { playlistTemplateData: any }) => Promise<InsertOneResult>
        updatePlaylistTemplate: (input: { playlistTemplateData: any }) => Promise<UpdateResult>;
        deletePlaylistTemplate: (input: { playlistTemplate_id: string }) => Promise<DeleteResult>;
    }
}