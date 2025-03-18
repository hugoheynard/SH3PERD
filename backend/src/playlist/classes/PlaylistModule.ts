import {type IPlaylist, PlaylistBuilder} from "./playlistBuilder/PlaylistBuilder";
import {PlaylistUpdater} from "./PlaylistUpdater";
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
import {PlaylistTagMerger} from "./tagGenerator/PlaylistTagMerger";
import {SongValidator} from "./playlistValidators/SongValidator";


export class PlaylistModule {
    private playlistBuilder: PlaylistBuilder;
    private playlistUpdater: PlaylistUpdater;
    private tagCreator: TagCreator;

    constructor() {
        this.playlistBuilder = new PlaylistBuilder(
            {
                playlistSettings: PLAYLIST_SETTINGS_DEFAULT,
                singersConfig: SINGERS_CONFIG_DEFAULT,
                musiciansConfig: MUSICIAN_CONFIG_DEFAULT,
                aerialConfig: AERIAL_CONFIG_DEFAULT,
                playlistSong: PLAYLIST_SONG_DEFAULT,
            });

        this.playlistUpdater = new PlaylistUpdater(
            {
                objectUpdater: (input) => new ObjectUpdater().update(input),
                validators: {
                    settings: (input) => new PlaylistSettingsValidator().getValidationObject(input),
                    songList: (input) => new SongValidator().getValidationObject(input),
                    performers: {
                        singersConfig: (input) => new SingersConfigValidator().getValidationObject(input),
                        musiciansConfig: (input) => new MusiciansConfigValidator().getValidationObject(input),
                        aerialConfig: (input) => new AerialConfigValidator().getValidationObject(input),
                    }
                },
            },
        );

        this.tagCreator =  new TagCreator(
            {
                generateSingersTags: (input) => new SingersTagGenerator().generate(input),
                generateAerialTags: (input) => new AerialTagGenerator().generate(input),
                tagMerger: (input) => new PlaylistTagMerger().merge(input),
            });
    };

    generateDefaultEmptyPlaylist(): IPlaylist {
        return this.playlistBuilder.build();
    };

    generateNewPlaylistFromTemplate(input: { playlistTemplate: Partial<IPlaylist> }): IPlaylist {

        const emptyPlaylist: IPlaylist = this.generateDefaultEmptyPlaylist();

        const updatedPlaylist: IPlaylist =  this.playlistUpdater.update(
            {
                playlistToUpdate: emptyPlaylist,
                update: input.playlistTemplate
            });

        const taggedPlaylist: IPlaylist = this.tagCreator.tag({ playlistToTag: updatedPlaylist});

        return taggedPlaylist;
    };

    updatePlaylist(input: { playlistToUpdate: IPlaylist, update: Partial<IPlaylist> }): IPlaylist {
        return this.playlistUpdater.update(input);
    };

}