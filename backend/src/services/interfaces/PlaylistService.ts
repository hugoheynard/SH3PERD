import type {Collection, InsertOneResult} from "mongodb";
import type {PlaylistTemplateDocument} from "../../../../shared/interfaces/mongoDocuments/playlistTemplateInterfaces";

export interface PlaylistTemplateService {
    input: {
        playlistTemplateCollection: Collection<PlaylistTemplateDocument>;
    },
    output: {
        postPlaylistTemplate: (input: { playlistTemplateData: any } ) => Promise<InsertOneResult<PlaylistTemplateDocument>>
        [key: string]: any
    }
}