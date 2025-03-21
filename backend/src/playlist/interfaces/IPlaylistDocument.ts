import type {IPlaylistSettings} from "../classes/playlistBuilder/PLAYLIST_SETTINGS_DEFAULT";
import type {IDataInformation} from "../classes/DataInformationManager";
import type {ISingersConfig} from "../classes/playlistBuilder/SINGERS_CONFIG_DEFAULT";
import type {IAerialConfig} from "../classes/playlistBuilder/AERIAL_CONFIG_DEFAULT";
import type {IPlaylistSong} from "../classes/playlistBuilder/PLAYLIST_SONG_DEFAULT";
import type {ObjectId} from "mongodb";
import type {IPlaylist} from "../classes/playlistBuilder/PlaylistBuilder";

export interface IPlaylistDocument extends IPlaylist {
    _id: ObjectId
    dataInformation: IDataInformation
}