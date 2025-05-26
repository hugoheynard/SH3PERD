import type {TSingersConfig} from "../../../types/playlist.domain.types.js";


export const SINGERS_CONFIG_DEFAULT: Readonly<TSingersConfig> = Object.freeze({
    numberOfSingers: null,
    containsDuo: null,
    splitMode: null,
});