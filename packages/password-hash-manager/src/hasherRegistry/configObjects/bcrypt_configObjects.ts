import type {Bcrypt_Options, IHasherConfigObject} from "../../types/Interfaces";

export const bcryptHasher_config_v1: IHasherConfigObject<Bcrypt_Options> = {
    library: 'bcrypt',
    algorithm: '$2b$',
    versionConfig: 'v1',
    configOptions: {
        saltRounds: 12,
    },
};

