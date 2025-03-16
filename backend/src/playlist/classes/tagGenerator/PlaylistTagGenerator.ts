export interface ISubTagCreatorsReturns {
    playlistTags: string[];
    songListTags: string[][];
}

export abstract class PlaylistTagGenerator<T> {
    protected tagObject: ISubTagCreatorsReturns = {
        playlistTags: [],
        songListTags: []
    };

    protected generate(input: T): ISubTagCreatorsReturns {
        try {
            this.execute(input);
            const result = this.getTagObject();
            this.resetTagObject();
            return result;
        } catch (error) {
            throw new Error(`Error while generating tags: ${(error as Error).message}`);
        }
    };

    /**
     * Executes the tag generation process of the child class
     */
    protected abstract execute(input: T): void;

    /**
     * Resets the tag storage object.
     */
    protected resetTagObject(): void {
        this.tagObject = {
            playlistTags: [],
            songListTags: []
        };
    };

    /**
     * Retrieves the object containing playlist and song list tags.
     * @returns The object with generated tags.
     */
    protected getTagObject(): ISubTagCreatorsReturns {
        return this.tagObject;
    };
}