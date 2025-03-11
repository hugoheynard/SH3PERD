export interface IPlaylistSettings {
    name: string;
    usage: 'daily' | 'event';
    energy: 1 | 2 | 3 | 4;
    requiredLength: number;
    numberOfSongs: number;
    singers: boolean;
    musicians: boolean;
    aerial: boolean;
}

export class PlaylistSettings {
    static createDefault(): IPlaylistSettings {
        return {
            name: `New Playlist ${new Date().toLocaleDateString()}`,
            usage: 'daily',
            energy: 1,
            requiredLength: 15,
            numberOfSongs: 4,
            singers: false,
            musicians: false,
            aerial: false
        };
    };

    /*
    setValuesFromTemplate(input?: { template?: Partial<PlaylistSettings> }): void {
        if (!input || !input.template) return;

        const template = input.template;

        // Validates values
        if (template.name !== undefined) this.name = template.name;
        if (template.usage === 'daily' || template.usage === 'event') this.usage = template.usage;
        if ([1, 2, 3, 4].includes(template.energy as number)) this.energy = template.energy as 1 | 2 | 3 | 4;
        if (typeof template.requiredLength === 'number' && template.requiredLength > 0 && template.requiredLength % 5 === 0) this.requiredLength = template.requiredLength;
        if (typeof template.numberOfSongs === 'number' && template.numberOfSongs >= 0) this.numberOfSongs = template.numberOfSongs;
        if (typeof template.singers === 'boolean') this.singers = template.singers;
        if (typeof template.musicians === 'boolean') this.musicians = template.musicians;
        if (typeof template.aerial === 'boolean') this.aerial = template.aerial;
    };

 */
}