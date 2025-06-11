import type {Bcrypt_Options, IHasherConfigObject} from "../../types/Interfaces.js";

export const bcryptHasher_config_v1: IHasherConfigObject<Bcrypt_Options> = {
    library: 'bcrypt',
    algorithm: 'bcrypt',
    versionConfig: 'v1',
    configOptions: {
        saltRounds: 12,
    },
};

