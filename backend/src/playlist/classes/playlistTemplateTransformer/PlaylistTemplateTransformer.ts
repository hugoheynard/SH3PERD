import type {IPlaylist} from "../playlistBuilder/PlaylistBuilder";
import {TagCreator} from "../tagGenerator/TagCreator";
import type {ObjectUpdaterFunction} from "../ObjectUpdater";
import {SingersTagGenerator} from "../tagGenerator/SingersTagGenerator";
import {AerialTagGenerator} from "../tagGenerator/AerialTagGenerator";

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
                referenceObject: playlistToUpdate.settings,
                updateObject: template.settings,
                validator: this.validators.settings
            }),
            songList: playlistToUpdate.songList, //toDo : validation
            performers: {
                singersConfig: this.objectUpdater({
                    referenceObject: playlistToUpdate.performers.singersConfig,
                    updateObject: template.performers.singersConfig,
                    validator: this.validators.performers.singersConfig
                }),
                musiciansConfig: this.objectUpdater({
                    referenceObject: playlistToUpdate.performers.musiciansConfig,
                    updateObject: template.performers.musiciansConfig,
                    validator: this.validators.performers.musiciansConfig
                }),
                aerialConfig: this.objectUpdater({
                    referenceObject: playlistToUpdate.performers.aerialConfig,
                    updateObject: template.performers.aerialConfig,
                    validator: this.validators.performers.aerialConfig
                })
            }
        }

        const taggedPlaylist: IPlaylist = this.tagCreator.generateTags({ playlistToTag: updatedPlaylist });

        return taggedPlaylist;
    };
}
