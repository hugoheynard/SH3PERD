import {ObjectValidator} from "./ObjectValidator";
import type {ISingersConfig} from "../playlistBuilder/SINGERS_CONFIG_DEFAULT";

export class SingersConfigValidator extends ObjectValidator{

    protected checkProps<T extends ISingersConfig>(propsToValidate: Partial<T>): void {
        this.validateQuantity(propsToValidate.quantity);
        this.validateContainsDuo(propsToValidate.containsDuo);
        this.validateSplitMode(propsToValidate.splitMode);
    };

    validateQuantity(quantity?: number | null): void {
        if (quantity === undefined) {
            this.checkedProps.quantity = false;
            return;
        }

        if (quantity !== null && (typeof quantity !== 'number' || quantity < 0)) {
            this.errors.quantity = 'Quantity must be a positive number';
            this.checkedProps.quantity = false;
            return;
        }

        this.checkedProps.quantity = true;
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