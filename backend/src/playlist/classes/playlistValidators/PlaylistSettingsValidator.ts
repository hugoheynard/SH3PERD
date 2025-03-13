import {ObjectValidator} from "./ObjectValidator";


/**
 * @class PlaylistSettingsValidator
 * validates playlist settings
 */
export class PlaylistSettingsValidator extends ObjectValidator{
    protected checkProps<T>(propsToValidate: Partial<T>): void {
        this.validateName(propsToValidate.name);
        this.validateDescription(propsToValidate.description);
        this.validateUsage(propsToValidate.usage);
        this.validateTags(propsToValidate.tags);
        this.validateEnergy(propsToValidate.energy);
        this.validateRequiredLength(propsToValidate.requiredLength);
        this.validateNumberOfSongs(propsToValidate.numberOfSongs);
        this.validateSingers(propsToValidate.singers);
        this.validateMusicians(propsToValidate.musicians);
        this.validateAerial(propsToValidate.aerial);
    };

    /**
     *validations of each setting
     */

    private validateName(name?: string): void {
        if (name === undefined || typeof name !== 'string' || name.trim() === "") {
            this.errors.name = "Name must be a non-empty string";
            this.checkedProps.name = false;
            return;
        }
        this.checkedProps.name = true;
        return;
    };

    private validateDescription(description?: string): void {
        if (description === undefined || typeof description !== 'string') {
            this.errors.description = "Description must be a string";
            this.checkedProps.description = false;
            return;
        }
        this.checkedProps.description = true;
        return;
    };

    private validateUsage(usage?: string): void {
        if (usage === undefined || typeof usage !== 'string' || !['daily', 'event'].includes(usage)) {
            this.errors.usage = "Usage must be 'daily' or 'event'";
            this.checkedProps.usage = false;
            return;
        }
        this.checkedProps.usage = true;
        return;
    };

    private validateTags(tags?: string[]): void {
        if (tags === undefined || !Array.isArray(tags) || !tags.every((tag: string): boolean => typeof tag === 'string')) {
            this.errors.tags = "Tags must be an array of strings";
            this.checkedProps.tags = false;
            return;
        }
        //TODO: ajouter validation des tags authorisés?

        this.checkedProps.tags = true;
        return;
    };

    private validateEnergy(energy?: number): void {
        if (energy === undefined || typeof energy !== 'number' || ![1, 2, 3, 4].includes(energy)) {
            this.errors.energy = "Energy must be a number between 1 and 4";
            this.checkedProps.energy = false;
            return;
        }
        this.checkedProps.energy = true;
        return;
    };

    private validateRequiredLength(requiredLength?: number): void {
        if (requiredLength === undefined || typeof requiredLength !== 'number' || requiredLength <= 0 || requiredLength % 5 !== 0) {
            this.errors.requiredLength = "Required length must be a positive multiple of 5";
            this.checkedProps.requiredLength = false;
            return;
        }
        this.checkedProps.requiredLength = true;
        return;
    };

    private validateNumberOfSongs(numberOfSongs?: number): void {
        if (numberOfSongs === undefined || typeof numberOfSongs !== 'number' || numberOfSongs <= 0) {
            this.errors.numberOfSongs = "Number of songs must be a positive number";
            this.checkedProps.numberOfSongs = false;
            return;
        }
        this.checkedProps.numberOfSongs = true;
        return;
    };

    private validateSingers(singers?: boolean): void {
        if (singers === undefined || typeof singers !== 'boolean') {
            this.errors.singers = "Singers must be a boolean";
            this.checkedProps.singers = false;
            return;
        }
        this.checkedProps.singers = true;
        return;
    };

    private validateMusicians(musicians?: boolean): void {
        if (musicians === undefined || typeof musicians !== 'boolean') {
            this.errors.musicians = "Musicians must be a boolean";
            this.checkedProps.musicians = false;
            return;
        }
        this.checkedProps.musicians = true;
        return;
    };

    private validateAerial(aerial?: boolean): void {
        if (aerial === undefined || typeof aerial !== 'boolean') {
            this.errors.aerial = "Aerial must be a boolean";
            this.checkedProps.aerial = false;
            return;
        }
        this.checkedProps.aerial = true;
        return
    };
}
