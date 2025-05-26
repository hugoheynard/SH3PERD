
import {ObjectValidator} from "./ObjectValidator.js";
import type {TMusicianConfig} from "../../../types/playlist.domain.types.js";



export class MusiciansConfigValidator extends ObjectValidator {
    protected checkProps<T extends TMusicianConfig>(propsToValidate: Partial<T>): void {};
}