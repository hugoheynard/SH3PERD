import type {Collection, DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import type {IPlaylistDocument} from "./IPlaylistDocument";
import type {IPlaylist} from "../classes/playlistBuilder/PlaylistBuilder";

export interface IPlaylistService {
    input: {
        playlistCollection: Collection<IPlaylistDocument>;
        PlaylistModule: any;
    },
    output: {
        getDefaultPlaylist: () => Promise<IPlaylist>;
        getNewPlaylistFromTemplate: (input: { playlistTemplate: Partial<IPlaylist> }) => Promise<IPlaylist>;
        getPlaylist: () => Promise<IPlaylistDocument[]>;
        postPlaylist: (input: { playlistData: IPlaylist, user_id: string }) => Promise<InsertOneResult>;
        updatePlaylist: (input: { playlistData: IPlaylist, playlist_id: string; user_id: string }) => Promise<UpdateResult>;
        deletePlaylist: (input: { playlist_id: string }) => Promise<DeleteResult>;
    }
}