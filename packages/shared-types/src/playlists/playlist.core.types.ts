import type {Collection, DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import type {
    TPlaylistDomainModel,
    TAerialConfig,
    TMusicianConfig,
    TPlaylistSettings,
    TPlaylistSong,
    TSingersConfig
} from "./playlist.domain.types.js";

/**
 * Interface defining the parameters required to build a playlist.
 */
export type TPlaylistBuilderInput =  {
    /** Playlist settings */
    playlistSettings: TPlaylistSettings;

    /** Singers configuration */
    singersConfig: TSingersConfig;

    /** Musicians configuration */
    musiciansConfig: TMusicianConfig;

    /** Aerial performance configuration */
    aerialConfig: TAerialConfig;

    /** Default song model */
    playlistSong: TPlaylistSong;
}


export interface IPlaylistService {
    input: {
        playlistCollection: Collection<TPlaylistDomainModel>;
        PlaylistModule: any;
    },
    output: {
        getDefaultPlaylist: () => Promise<TPlaylistDomainModel>;
        getNewPlaylistFromTemplate: (input: { playlistTemplate: Partial<TPlaylistDomainModel> }) => Promise<TPlaylistDomainModel>;
        getPlaylist: () => Promise<TPlaylistDomainModel[]>;
        postPlaylist: (input: { playlistData: TPlaylistDomainModel, user_id: string }) => Promise<InsertOneResult>;
        updatePlaylist: (input: { playlistData: TPlaylistDomainModel, playlist_id: string; user_id: string }) => Promise<UpdateResult>;
        deletePlaylist: (input: { playlist_id: string }) => Promise<DeleteResult>;
    }
}