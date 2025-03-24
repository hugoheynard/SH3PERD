import type {IDataInformation} from "../classes/DataInformationManager";
import type {ObjectId} from "mongodb";
import type {IPlaylist} from "../classes/playlistBuilder/PlaylistBuilder";

export interface IPlaylistDocument extends IPlaylist {
    _id: ObjectId
    dataInformation: IDataInformation
}