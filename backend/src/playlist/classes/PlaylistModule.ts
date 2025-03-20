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
import {DataInformationManager, type IDataInformation} from "./DataInformationManager";
import {ObjectId} from "mongodb";


export class PlaylistModule {
    private readonly playlistBuilderFunction: () => IPlaylist;
    private readonly playlistUpdaterFunction: (input: { playlistToUpdate: IPlaylist, update: partial<IPlaylist> }) => IPlaylist;
    private readonly tagCreatorFunction:(input: { playlistToTag: IPlaylist }) => IPlaylist;
    private readonly manageDataInformationFunction: (input: { object: T; creator_id: ObjectId | string | null }) => IDataInformation;

    constructor() {
        this.playlistBuilderFunction = () => new PlaylistBuilder({
                playlistSettings: PLAYLIST_SETTINGS_DEFAULT,
                singersConfig: SINGERS_CONFIG_DEFAULT,
                musiciansConfig: MUSICIAN_CONFIG_DEFAULT,
                aerialConfig: AERIAL_CONFIG_DEFAULT,
                playlistSong: PLAYLIST_SONG_DEFAULT,
            }).build();
        this.playlistUpdaterFunction = (input) => new PlaylistUpdater({
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
            }).update(input);
        this.tagCreatorFunction = (input) => new TagCreator({
                generateSingersTags: (input) => new SingersTagGenerator().generate(input),
                generateAerialTags: (input) => new AerialTagGenerator().generate(input),
                tagMerger: (input) => new PlaylistTagMerger().merge(input),
            }).tag(input);
        this.manageDataInformationFunction = (input) => new DataInformationManager().manageDataInformation(input);
    };

    generateDefaultEmptyPlaylist(): IPlaylist {
        return this.playlistBuilderFunction();
    };

    generateNewPlaylistFromTemplate(input: { playlistTemplate: Partial<IPlaylist> }): IPlaylist {
        const emptyPlaylist: IPlaylist = this.generateDefaultEmptyPlaylist();
        const updatedPlaylist: IPlaylist =  this.playlistUpdater.update(
            {
                playlistToUpdate: emptyPlaylist,
                update: input.playlistTemplate
            });

        const taggedPlaylist: IPlaylist = this.tagCreatorFunction({ playlistToTag: updatedPlaylist});

        return taggedPlaylist;
    };

    updatePlaylist(input: { update: Partial<IPlaylist> }): IPlaylist {
        return this.playlistUpdaterFunction(
            {
                playlistToUpdate: this.generateDefaultEmptyPlaylist(),
                update: input.update
            });
    };

    manageDataInformation(input: { playlist: IPlaylist; creator_id: any }): IDataInformation {
        const { playlist, creator_id } = input;
        if (!playlist) return;
        if (!creator_id) return;

        return this.manageDataInformationFunction({
            object: playlist,
            creator_id: creator_id
        });
    };
}