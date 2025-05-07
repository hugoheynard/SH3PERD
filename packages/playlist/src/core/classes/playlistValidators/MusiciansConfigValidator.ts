
import {ObjectValidator} from "./ObjectValidator.js";
import type {TMusicianConfig} from "@sh3pherd/shared-types";


export class MusiciansConfigValidator extends ObjectValidator {
    protected checkProps<T extends TMusicianConfig>(propsToValidate: Partial<T>): void {};
}