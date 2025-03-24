import type {ObjectId} from "mongodb";

export interface IPlaylistSong {
    _id: string | ObjectId | null;
    title: string | null;
    artist: string | null;
    version_id: string | ObjectId | null;
    version_length: number | null;
    tags: string[];
}

export const PLAYLIST_SONG_DEFAULT: Readonly<IPlaylistSong> = Object.freeze({
    _id: null,
    title: null,
    artist: null,
    version_id: null,
    version_length: null,
    tags: []
});
