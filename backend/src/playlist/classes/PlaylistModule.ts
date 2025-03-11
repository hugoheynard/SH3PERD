import {type IPlaylist, PlaylistBuilder} from "./playlistBuilder/PlaylistBuilder";
import {PlaylistSettings} from "./PlaylistSettings";
import {SingersConfig} from "./playlistBuilder/SingersConfig";
import {MusicianConfig} from "./playlistBuilder/MusicianConfig";
import {AerialConfig} from "./playlistBuilder/AerialConfig";
import {PlaylistSong} from "./playlistBuilder/PlaylistSong";
import {PlaylistTemplateTransformer} from "./PlaylistTemplateTransformer";

export class PlaylistModule {
    private playlistBuilder: PlaylistBuilder = new PlaylistBuilder(
        {
            playlistSettings: PlaylistSettings,
            singersConfig: SingersConfig,
            musiciansConfig: MusicianConfig,
            aerialConfig: AerialConfig,
            playlistSong: PlaylistSong,
        });
    private playlistTemplateTransformer: PlaylistTemplateTransformer = new PlaylistTemplateTransformer(

    );

    generateEmptyPlaylist(): IPlaylist {
        return this.playlistBuilder.build();
    };

    generatePlaylistFromTemplate(input: { playlistTemplate: Partial<IPlaylist> } = {}): IPlaylist {
        const emptyPlaylist: IPlaylist = this.generateEmptyPlaylist();

        this.playlistTemplateTransformer.initDatas({ playlistToUpdate: emptyPlaylist, update: input.playlistTemplate});

        return emptyPlaylist
    };


}