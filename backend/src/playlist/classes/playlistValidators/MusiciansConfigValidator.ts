import {ObjectValidator} from "./ObjectValidator";
import type {IMusicianConfig} from "../playlistBuilder/MUSICIAN_CONFIG_DEFAULT";

export class MusiciansConfigValidator extends ObjectValidator {
    protected checkProps<T extends IMusicianConfig>(propsToValidate: Partial<T>): void {};
}