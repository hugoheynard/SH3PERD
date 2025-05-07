import type {IPlaylist} from "./playlistBuilder/PlaylistBuilder.js";
import type {ObjectUpdaterFunction} from "./ObjectUpdater.js";
import type {TPlaylistDomainModel} from "@sh3pherd/shared-types";

export interface IPlaylistUpdaterInput {
    objectUpdater: ObjectUpdaterFunction<T>;
    validators: {
        settings: any;
        songList: any;
        performers: {
            singersConfig: any;
            musiciansConfig: any;
            aerialConfig: any;
        };
    };
}

export class PlaylistUpdater {
    private readonly objectUpdater: any;
    private validators: {
        settings: any;
        songList: any;
        performers: {
            singersConfig: any;
            musiciansConfig: any;
            aerialConfig: any;
        };
    };

    constructor(input: IPlaylistUpdaterInput) {
        this.objectUpdater = input.objectUpdater;
        this.validators = input.validators;
    };

    update(input: { playlistToUpdate: TPlaylistDomainModel, update: Partial<TPlaylistDomainModel> }): TPlaylistDomainModel {
        const { playlistToUpdate, update } = {...input};

        return {
            settings: this.objectUpdater({
                referenceObject: playlistToUpdate.settings,
                updateObject: update.settings,
                validator: this.validators.settings
            }),
            tags: [],
            songList: update.songList.map((updateSong, index) => {
                return this.objectUpdater({
                    referenceObject: playlistToUpdate.songList[index] || {},
                    updateObject: updateSong,
                    validator: this.validators.songList
                });
            }),
            performers: {
                singersConfig: this.objectUpdater({
                    referenceObject: playlistToUpdate.performers.singersConfig,
                    updateObject: update.performers.singersConfig,
                    validator: this.validators.performers.singersConfig
                }),
                musiciansConfig: this.objectUpdater({
                    referenceObject: playlistToUpdate.performers.musiciansConfig,
                    updateObject: update.performers.musiciansConfig,
                    validator: this.validators.performers.musiciansConfig
                }),
                aerialConfig: this.objectUpdater({
                    referenceObject: playlistToUpdate.performers.aerialConfig,
                    updateObject: update.performers.aerialConfig,
                    validator: this.validators.performers.aerialConfig
                })
            }
        }
    };
}