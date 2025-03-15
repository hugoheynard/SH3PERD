import type {IPlaylist} from "./playlistBuilder/PlaylistBuilder";
import {TagCreator} from "./playlistTemplateTransformer/TagCreator";
import type {ObjectUpdaterFunction} from "./ObjectUpdater";

export interface IPlaylistTemplateTransformer {
    input: {
        objectUpdater: ObjectUpdaterFunction<T>;
        validators: {
            settings: any;
            performers: {
                singersConfig: any;
                musiciansConfig: any;
                aerialConfig: any;
            };
        };
        tagCreator: TagCreator;
    },
    output: {

    }
}

export class PlaylistTemplateTransformer {
    private objectUpdater: any;
    private validators: {
        settings: any;
        performers: {
            singersConfig: any;
            musiciansConfig: any;
            aerialConfig: any;
        };
    };
    private tagCreator: TagCreator;

    constructor(input: IPlaylistTemplateTransformer) {
        this.objectUpdater = input.objectUpdater;
        this.validators = input.validators;
        this.tagCreator = input.tagCreator;
    };

    applyTemplate(input: { playlistToUpdate: IPlaylist, template: Partial<IPlaylist> }): IPlaylist {
        const { playlistToUpdate, template } = input;

        const updatedPlaylist: IPlaylist = {
            settings: this.objectUpdater({
                objectToUpdate: playlistToUpdate.settings,
                updateObject: template.settings,
                validator: this.validators.settings
            }),
            performers: {
                singersConfig: this.objectUpdater({
                    objectToUpdate: playlistToUpdate.performers.singersConfig,
                    updateObject: template.performers.singersConfig,
                    validator: this.validators.performers.singersConfig
                }),
                musiciansConfig: this.objectUpdater({
                    objectToUpdate: playlistToUpdate.performers.musiciansConfig,
                    updateObject: template.performers.musiciansConfig,
                    validator: this.validators.performers.musiciansConfig
                }),
                aerialConfig: this.objectUpdater({
                    objectToUpdate: playlistToUpdate.performers.aerialConfig,
                    updateObject: template.performers.aerialConfig,
                    validator: this.validators.performers.aerialConfig
                })
            }
        }

        return updatedPlaylist;




        //this.createTags();
    };
/*
    createTags(): void {
        this.playlistToUpdate = new this.tagCreator(
            {
                playlistToUpdate: this.playlistToUpdate,
                template: this.template
            }
        ).generateTags();
    };

 */
}
