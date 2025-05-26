import {ObjectValidator} from "./ObjectValidator.js";
import type {TPlaylistSong} from "../../../types/playlist.domain.types.js";

export class SongValidator extends ObjectValidator {

    protected checkProps<T extends TPlaylistSong>(propsToValidate: Partial<T>): void {
        this.validateTitle(propsToValidate.title);
        this.validateDuration(propsToValidate.duration);
        this.validateTags(propsToValidate.tags);
    };

    validateTitle(title?: string | null): void {
        if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
            this.errors.title = 'Title must be a non-empty string';
            this.checkedProps.title = false;
            return;
        }
        this.checkedProps.title = true;
    };

    validateDuration(duration?: number | null): void {
        if (duration === undefined) {
            this.checkedProps.duration = false;
            return;
        }

        if (duration !== null && (typeof duration !== 'number' || duration <= 0)) {
            this.errors.duration = 'Duration must be a positive number';
            this.checkedProps.duration = false;
            return;
        }

        this.checkedProps.duration = true;
    };

    validateTags(tags?: string[] | null): void {
        if (tags === undefined) {
            this.checkedProps.tags = false;
            return;
        }

        if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
            this.errors.tags = 'Tags must be an array of strings';
            this.checkedProps.tags = false;
            return;
        }

        this.checkedProps.tags = true;
    };
}
