import type {
    TAerialConfig,
    TDataInformation,
    TPlaylistDomainModel,
    TSingersConfig
} from "../../types/playlist.domain.types.js";
import type {ObjectId} from "mongodb";
import {PlaylistBuilder} from "./playlistBuilder/PlaylistBuilder.js";
import {PLAYLIST_SETTINGS_DEFAULT} from "./playlistBuilder/PLAYLIST_SETTINGS_DEFAULT.js";
import {SINGERS_CONFIG_DEFAULT} from "./playlistBuilder/SINGERS_CONFIG_DEFAULT.js";
import {MUSICIAN_CONFIG_DEFAULT} from "./playlistBuilder/MUSICIAN_CONFIG_DEFAULT.js";
import {AERIAL_CONFIG_DEFAULT} from "./playlistBuilder/AERIAL_CONFIG_DEFAULT.js";
import {PLAYLIST_SONG_DEFAULT} from "./playlistBuilder/PLAYLIST_SONG_DEFAULT.js";
import {PlaylistUpdater} from "./PlaylistUpdater.js";
import {ObjectUpdater} from "./ObjectUpdater.js";
import {PlaylistSettingsValidator} from "./playlistValidators/PlaylistSettingsValidator.js";
import {SongValidator} from "./playlistValidators/SongValidator.js";
import {SingersConfigValidator} from "./playlistValidators/SingersConfigValidator.js";
import {MusiciansConfigValidator} from "./playlistValidators/MusiciansConfigValidator.js";
import {AerialConfigValidator} from "./playlistValidators/AerialConfigValidator.js";
import {TagCreator} from "./tagGenerator/TagCreator.js";
import {SingersTagGenerator} from "./tagGenerator/SingersTagGenerator.js";
import {AerialTagGenerator} from "./tagGenerator/AerialTagGenerator.js";
import type {ISubTagCreatorsReturns} from "./tagGenerator/PlaylistTagGenerator.js";
import {PlaylistTagMerger} from "./tagGenerator/PlaylistTagMerger.js";
import {DataInformationManager} from "./DataInformationManager.js";


export class PlaylistModule {
    private readonly playlistBuilderFunction: () => TPlaylistDomainModel;
    private readonly playlistUpdaterFunction: (input: { playlistToUpdate: IPlaylist, update: Partial<IPlaylist> }) => TPlaylistDomainModel;
    private readonly tagCreatorFunction:(input: { playlistToTag: IPlaylist }) => TPlaylistDomainModel;
    private readonly createDataInformationFunction: (input: { creator_id: ObjectId | string }) => TDataInformation;
    private readonly updateDataInformationFunction: (input: { dataInformationObject: TDataInformation; creator_id: ObjectId | string }) => TDataInformation;

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
                generateSingersTags: (input: { singersConfig: TSingersConfig; numberOfSongs: number }) => new SingersTagGenerator().generate(input),
                generateAerialTags: (input: { aerialConfig: TAerialConfig; numberOfSongs: number }) => new AerialTagGenerator().generate(input),
                tagMerger: (input: { objectsToMerge: ISubTagCreatorsReturns[] }) => new PlaylistTagMerger().merge(input),
            }).tag(input);
        this.createDataInformationFunction = (input) => new DataInformationManager().createDataInformationObject(input);
        this.updateDataInformationFunction = (input) => new DataInformationManager().updateDataInformation(input);
    };

    generateDefaultEmptyPlaylist(): TPlaylistDomainModel {
        return this.playlistBuilderFunction();
    };

    generateNewPlaylistFromTemplate(input: { playlistTemplate: Partial<TPlaylistDomainModel> }): TPlaylistDomainModel {
        const emptyPlaylist = this.generateDefaultEmptyPlaylist();
        const updatedPlaylist =  this.playlistUpdaterFunction(
            {
                playlistToUpdate: emptyPlaylist,
                update: input.playlistTemplate
            });

        const taggedPlaylist = this.tagCreatorFunction({ playlistToTag: updatedPlaylist});

        return taggedPlaylist;
    };

    updatePlaylist(input: { update: Partial<TPlaylistDomainModel> }): TPlaylistDomainModel {
        return this.playlistUpdaterFunction(
            {
                playlistToUpdate: this.generateDefaultEmptyPlaylist(),
                update: input.update
            });
    };
}