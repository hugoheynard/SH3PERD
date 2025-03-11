import type {ObjectId} from "mongodb";

export interface IPlaylistSong {
    _id: string | ObjectId | null;
    title: string | null;
    artist: string | null;
    version_id: string | ObjectId | null;
    version_length: number | null;
    tags: string[];
}

export class PlaylistSong {
    static createDefault(): IPlaylistSong {
        return {
            _id: null,
            title: null,
            artist: null,
            version_id: null,
            version_length: null,
            tags: []
        };
    }

    /* Apply values from template with validation
    setValuesFromTemplate(input: { update: Partial<IPlaylistSong> }): void {
        if (!input) return;

        if (typeof input._id === 'string') this._id = input._id;
        if (typeof input.title === 'string') this.title = input.title;
        if (typeof input.artist === 'string') this.artist = input.artist;
        if (typeof input.version_id === 'string') this.version_id = input.version_id;
        if (typeof input.version_length === 'number' && input.version_length >= 0) this.version_length = input.version_length;
        if (Array.isArray(input.tags)) this.tags = input.tags.filter(tag => typeof tag === 'string');
    }
     */
}
