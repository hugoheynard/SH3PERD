import type {NextFunction, Request, Response} from "express";
import type {IPlaylistService} from "./playlist.core.types.js";
import type {IPlaylistTemplateService} from "./playlistTemplate.core.types.js";

export interface IPlaylistController {
    input: {
        playlistTemplateService: IPlaylistTemplateService['output'];
        playlistService: IPlaylistService['output'];
    },
    output: {
        getPlaylists: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        postPlaylist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        updatePlaylist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        deletePlaylist: (req: Request, res: Response, next: NextFunction) => Promise<void>;

        getDefaultPlaylist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        getNewPlaylistFromTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;

        getPlaylistTemplates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        postPlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        updatePlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        deletePlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    }
}