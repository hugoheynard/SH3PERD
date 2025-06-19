import argon2 from 'argon2';
import type { IArgon2_Options, IHasherConfigObject } from '../../types/Interfaces.js';

export const argon2Hasher_config_v1: IHasherConfigObject<IArgon2_Options> = Object.freeze({
  library: 'argon2',
  algorithm: 'argon2id',
  versionConfig: 'v1',
  configOptions: Object.freeze({
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 1024 * 128,
    parallelism: 2,
    hashLength: 32,
  }),
});
