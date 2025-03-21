import type {IPlaylistTemplateService} from "./IPlaylistTemplateService";
import type {IPlaylistService} from "./IPlaylistService";
import type {NextFunction, Request, Response} from "express";
import type {IPlaylistDocument} from "./IPlaylistDocument";
import type {DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import type {IPlaylist} from "../classes/playlistBuilder/PlaylistBuilder";
import type {PlaylistTemplateDocument} from "./IPlaylistTemplate";

export interface IPlaylistController {
    input: {
        playlistTemplateService: IPlaylistTemplateService['output'];
        playlistService: IPlaylistService['output'];
    },
    output: {
        getPlaylists: (req: Request, res: Response, next: NextFunction) => Promise<IPlaylistDocument[]>;
        postPlaylist: (req: Request, res: Response, next: NextFunction) => Promise<InsertOneResult<IPlaylist>>;
        updatePlaylist: (req: Request, res: Response, next: NextFunction) => Promise<UpdateResult<IPlaylistDocument>>;
        deletePlaylist: (req: Request, res: Response, next: NextFunction) => Promise<DeleteResult>;

        getDefaultPlaylist: (req: Request, res: Response, next: NextFunction) => Promise<{ playlist: IPlaylist }>;
        getNewPlaylistFromTemplate: (req: Request, res: Response, next: NextFunction) => Promise<{ playlist: IPlaylist }>;


        getPlaylistTemplates: (req: Request, res: Response, next: NextFunction) => Promise<PlaylistTemplateDocument[]>;
        postPlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<InsertOneResult<PlaylistTemplateDocument>>;
        updatePlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<UpdateResult<PlaylistTemplateDocument>>;
        deletePlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<DeleteResult>;
    }
}