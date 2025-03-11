import type {IPlaylist} from "./playlistBuilder/PlaylistBuilder";

export class PlaylistTemplateTransformer {
    private playlistToUpdate: IPlaylist = {};
    private update: Partial<IPlaylist> = {};

    initDatas(input: { playlistToUpdate: IPlaylist; update: Partial<IPlaylist> }): void {
        this.playlistToUpdate = input.playlistToUpdate;
        this.update = input.update;
    };




    updatePlaylist(): IPlaylist {
        this.applyValidUpdates();
        return this.playlistToUpdate;
    }

    private applyValidUpdates(): void {
        if (!this.update) return;

        if (typeof this.update.settings === 'object') {
            this.playlistToUpdate.settings = this.validateSettings(this.update.settings);
        }

        if (Array.isArray(this.update.songList)) {
            this.playlistToUpdate.songList = this.update.songList.map(song => this.validateSong(song));
        }

        if (typeof this.update.performers === 'object') {
            this.playlistToUpdate.performers = this.validatePerformers(this.update.performers);
        }
    }

    private validateSettings(settings: any): any {
        return {
            name: typeof settings.name === 'string' ? settings.name : this.playlistToUpdate.settings.name,
            usage: typeof settings.usage === 'string' ? settings.usage : this.playlistToUpdate.settings.usage,
            energy: typeof settings.energy === 'number' ? settings.energy : this.playlistToUpdate.settings.energy,
            requiredLength: typeof settings.requiredLength === 'number' ? settings.requiredLength : this.playlistToUpdate.settings.requiredLength,
            numberOfSongs: typeof settings.numberOfSongs === 'number' ? settings.numberOfSongs : this.playlistToUpdate.settings.numberOfSongs,
            singers: typeof settings.singers === 'boolean' ? settings.singers : this.playlistToUpdate.settings.singers,
            musicians: typeof settings.musicians === 'boolean' ? settings.musicians : this.playlistToUpdate.settings.musicians,
            aerial: typeof settings.aerial === 'boolean' ? settings.aerial : this.playlistToUpdate.settings.aerial,
        };
    }

    private validateSong(song: any): any {
        return {
            _id: typeof song._id === 'string' ? song._id : null,
            title: typeof song.title === 'string' ? song.title : null,
            artist: typeof song.artist === 'string' ? song.artist : null,
            version_id: typeof song.version_id === 'string' ? song.version_id : null,
            version_length: typeof song.version_length === 'number' && song.version_length >= 0 ? song.version_length : null,
            tags: Array.isArray(song.tags) ? song.tags.filter(tag => typeof tag === 'string') : [],
        };
    }

    private validatePerformers(performers: any): any {
        return {
            singersConfig: {
                quantity: typeof performers.singersConfig?.quantity === 'number' ? performers.singersConfig.quantity : null,
                containsDuo: typeof performers.singersConfig?.containsDuo === 'boolean' ? performers.singersConfig.containsDuo : null,
                splitMode: typeof performers.singersConfig?.splitMode === 'string' ? performers.singersConfig.splitMode : null,
            },
            musiciansConfig: {
                role: typeof performers.musiciansConfig?.role === 'string' ? performers.musiciansConfig.role : null,
            },
            aerialConfig: {
                performancePosition: typeof performers.aerialConfig?.performancePosition === 'string' ? performers.aerialConfig.performancePosition : null,
            },
        };
    }
}
