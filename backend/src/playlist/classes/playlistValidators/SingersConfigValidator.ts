import {ObjectValidator} from "./ObjectValidator";
import type {ISingersConfig} from "../playlistBuilder/SINGERS_CONFIG_DEFAULT";

export class SingersConfigValidator extends ObjectValidator{

    protected checkProps<T extends ISingersConfig>(propsToValidate: Partial<T>): void {
        this.validateNumberOfSingers(propsToValidate.numberOfSingers);
        this.validateContainsDuo(propsToValidate.containsDuo);
        this.validateSplitMode(propsToValidate.splitMode);
    };

    validateNumberOfSingers(numberOfSingers?: number | null): void {
        if (numberOfSingers === undefined) {
            this.checkedProps.numberOfSingers = false;
            return;
        }

        if (numberOfSingers !== null && (typeof numberOfSingers !== 'number' || numberOfSingers < 0)) {
            this.errors.quantity = 'Quantity must be a positive number';
            this.checkedProps.numberOfSingers = false;
            return;
        }

        this.checkedProps.numberOfSingers = true;
    };

    validateContainsDuo(containsDuo?: boolean | null): void {
        if (containsDuo === undefined) {
            this.checkedProps.containsDuo = false;
            return;
        }

        if (containsDuo !== null && typeof containsDuo !== 'boolean') {
            this.errors.containsDuo = 'ContainsDuo must be a boolean';
            this.checkedProps.containsDuo = false;
            return;
        }

        this.checkedProps.containsDuo = true;
    };

    validateSplitMode(splitMode?: "alternate" | "half_split" | null): void {
        if (splitMode === undefined) {
            this.checkedProps.splitMode = false;
            return;
        }

        if (splitMode !== null && !["alternate", "half_split"].includes(splitMode)) {
            this.errors.splitMode = 'SplitMode must be "alternate" or "half_split"';
            this.checkedProps.splitMode = false;
            return;
        }

        this.checkedProps.splitMode = true;
    };
}