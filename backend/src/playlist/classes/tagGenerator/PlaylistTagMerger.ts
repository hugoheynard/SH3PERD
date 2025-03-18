import type { ISubTagCreatorsReturns } from "./PlaylistTagGenerator";

/**
 * Class responsible for merging multiple playlist tag objects into a single one.
 */
export class PlaylistTagMerger {
    /**
     * Stores the merged tags.
     */
    private mergedTagsObject: ISubTagCreatorsReturns = {} as ISubTagCreatorsReturns;

    /**
     * Merges multiple `ISubTagCreatorsReturns` objects into one.
     *
     * @param {Object} input - The input containing an array of objects to merge.
     * @param {ISubTagCreatorsReturns[]} input.objectsToMerge - The list of tag objects to merge.
     * @returns {ISubTagCreatorsReturns} - The merged tag object.
     */
    merge(input: { objectsToMerge: ISubTagCreatorsReturns[] }): ISubTagCreatorsReturns {
        this.createMergedTagsObject();

        for (const elem of input.objectsToMerge) {
            this.mergedTagsObject.playlistTags.push(...elem.playlistTags);
            this.mergedTagsObject.songListTags = this.mergeSongListTags(this.mergedTagsObject.songListTags, elem.songListTags);
        }

        return this.mergedTagsObject;
    }

    /**
     * Initializes an empty merged tags object.
     */
    private createMergedTagsObject(): void {
        this.mergedTagsObject = { playlistTags: [], songListTags: [] };
    }

    /**
     * Merges two song list tag arrays.
     *
     * @param {string[][]} baseTags - The base list of song list tags.
     * @param {string[][]} newTags - The new song list tags to merge.
     * @returns {string[][]} - The merged song list tags.
     */
    private mergeSongListTags(baseTags: string[][], newTags: string[][]): string[][] {
        const maxLength = Math.max(baseTags.length, newTags.length);
        const merged: string[][] = [];

        for (let i = 0; i < maxLength; i++) {
            merged[i] = [...(baseTags[i] || []), ...(newTags[i] || [])];
        }

        return merged;
    }
}
