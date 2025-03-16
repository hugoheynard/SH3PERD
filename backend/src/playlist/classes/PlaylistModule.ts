import {type IPlaylist, PlaylistBuilder} from "./playlistBuilder/PlaylistBuilder";
import {PlaylistTemplateTransformer} from "./playlistTemplateTransformer/PlaylistTemplateTransformer";
import {TagCreator} from "./tagGenerator/TagCreator";
import {ObjectUpdater} from "./ObjectUpdater";
import {PlaylistSettingsValidator} from "./playlistValidators/PlaylistSettingsValidator";
import {AerialConfigValidator} from "./playlistValidators/AerialConfigValidator";
import {SingersConfigValidator} from "./playlistValidators/SingersConfigValidator";
import {MusiciansConfigValidator} from "./playlistValidators/MusiciansConfigValidator";
import {SINGERS_CONFIG_DEFAULT} from "./playlistBuilder/SINGERS_CONFIG_DEFAULT";
import {AERIAL_CONFIG_DEFAULT} from "./playlistBuilder/AERIAL_CONFIG_DEFAULT";
import {MUSICIAN_CONFIG_DEFAULT} from "./playlistBuilder/MUSICIAN_CONFIG_DEFAULT";
import {PLAYLIST_SETTINGS_DEFAULT} from "./playlistBuilder/PLAYLIST_SETTINGS_DEFAULT";
import {PLAYLIST_SONG_DEFAULT} from "./playlistBuilder/PLAYLIST_SONG_DEFAULT";
import {SingersTagGenerator} from "./tagGenerator/SingersTagGenerator";
import {AerialTagGenerator} from "./tagGenerator/AerialTagGenerator";


export class PlaylistModule {
    private playlistBuilder: PlaylistBuilder;
    private playlistTemplateTransformer: PlaylistTemplateTransformer;

    constructor() {
        this.playlistBuilder = new PlaylistBuilder(
            {
                playlistSettings: PLAYLIST_SETTINGS_DEFAULT,
                singersConfig: SINGERS_CONFIG_DEFAULT,
                musiciansConfig: MUSICIAN_CONFIG_DEFAULT,
                aerialConfig: AERIAL_CONFIG_DEFAULT,
                playlistSong: PLAYLIST_SONG_DEFAULT,
            });

        this.playlistTemplateTransformer = new PlaylistTemplateTransformer(
            {
                objectUpdater: (input) => new ObjectUpdater().update(input),
                validators: {
                    settings: (input) => new PlaylistSettingsValidator().getValidationObject(input),
                    performers: {
                        singersConfig: (input) => new SingersConfigValidator().getValidationObject(input),
                        musiciansConfig: (input) => new MusiciansConfigValidator().getValidationObject(input),
                        aerialConfig: (input) => new AerialConfigValidator().getValidationObject(input),
                    }
                },
                tagCreator: new TagCreator(
                    {
                        generateSingersTags: (input) => new SingersTagGenerator().generate(input),
                        generateAerialTags: (input) => new AerialTagGenerator().generate(input),
                        //tagMerger: (input) => new TagMerger().merge(input),
                    }),
            },
        );
    };

    generateEmptyPlaylist(): IPlaylist {
        return this.playlistBuilder.build();
    };

    generatePlaylistFromTemplate(input: { playlistTemplate: Partial<IPlaylist> }): IPlaylist {

        const emptyPlaylist: IPlaylist = this.generateEmptyPlaylist();

        return this.playlistTemplateTransformer.applyTemplate(
            {
                playlistToUpdate: emptyPlaylist,
                template: input.playlistTemplate
            })
    };
}