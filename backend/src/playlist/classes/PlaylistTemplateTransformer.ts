import type {IPlaylist} from "./playlistBuilder/PlaylistBuilder";
import {TagCreator} from "./playlistTemplateTransformer/TagCreator";


export class PlaylistTemplateTransformer {
    private objectUpdater: T;
    private validators: { settings: T };
    private tagCreator: TagCreator;

    constructor(input: any) {
        this.objectUpdater = input.objectUpdater;
        this.validators = input.validators;
        this.tagCreator = input.tagCreator;
    };

    applyTemplate(input: { playlistToUpdate: IPlaylist, template: Partial<IPlaylist> }): IPlaylist {
        const { playlistToUpdate, template } = input;

        const updatedPlaylist: IPlaylist = {
            settings: this.objectUpdater.update({
                objectToUpdate: playlistToUpdate.settings,
                updateObject: template.settings,
                validator: this.validators.settings
            }),
            performers: {
                aerialConfig: this.objectUpdater.update({
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
