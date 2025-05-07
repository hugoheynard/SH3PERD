import type {TPlaylistSong} from "@sh3pherd/shared-types";


export const PLAYLIST_SONG_DEFAULT: Readonly<TPlaylistSong> = Object.freeze({
    _id: null,
    title: null,
    artist: null,
    version_id: null,
    version_length: null,
    tags: []
});
