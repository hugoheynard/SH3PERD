import type { Options } from 'argon2';

export type IPasswordManagerInput = {
  currentStrategyKey: string;
  registry: Record<string, IHasherStrategy>;
  hashParserFunction: THashParserFunction;
  verifyLastHashDateFunction: TVerifyLastHashDateFunction;
  rehashAfterDays: number;
};

export type TAlgoLibs = 'argon2' | 'bcrypt';
export type TAlgorithms = 'argon2id' | '$2b$';

export type ICompareResult_copy = {
  isValid: boolean;
  wasRehashed: boolean;
  newHash?: string;
};

//STRATEGIES
/**
 * IHasherStrategy
 * Common interface for password hashing strategies classes.
 */
export type IHasherStrategy = {
  hashPassword: (input: { password: string }) => Promise<string>;
  comparePassword: (input: {
    password: string;
    hashedPassword: string;
  }) => Promise<ICompareResult_copy>;
};

export type IPasswordManager = {
  hashPassword: (input: { password: string }) => Promise<string>;
  comparePassword: (input: {
    password: string;
    hashedPassword: string;
  }) => Promise<ICompareResult_copy>;
};

/**
 * IArgon2_Options
 *
 * Extends the native Argon2 `Options` interface with stricter typing and requirements
 * used within the password strategy system.
 */
export type IArgon2_Options = {
  /**
   * Argon2 type used: one of `argon2d`, `argon2i`, or `argon2id`.
   * Internally mapped to a number by the `argon2` library.
   */
  type: 0 | 1 | 2;

  /** Number of iterations (time cost) */
  timeCost: number;

  /** Amount of memory (in KiB) used in hashing */
  memoryCost: number;

  /** Number of parallel threads */
  parallelism: number;

  /** length) */
  hashLength: number;
} & Options;
export type Bcrypt_Options = {
  saltRounds: number;
};

/**
 * Generic hasher configuration object used by any IHasherStrategy implementation.
 *
 * @template TOptions - Specific options structure used by the algorithm (e.g., Argon2, Bcrypt)
 */
export type IHasherConfigObject<TOptions = unknown> = {
  /** Hashing library used (e.g., "argon2", "bcrypt") */
  library: string;

  /** Algorithm name or identifier (e.g., "argon2id", "bcrypt") */
  algorithm: string;

  /** Version tag used for hash metadata (e.g., "v1", "v2") */
  versionConfig: string;

  /** Algorithm-specific configuration options */
  configOptions: TOptions;
};

//UTILS
/**
 * IHashParser
 * Common interface for hash parser classes.
 */
export type IHashParser = {
  extract: THashParserFunction;
};

/**
 * THashParserFunction
 * type for hashParser function.
 */
export type THashParserFunction = (hash: string) => {
  library: TAlgoLibs;
  algorithm: TAlgorithms;
  versionConfig: string;
  hashed_at: string;
  rawHash: string;
};

/**
 * TVerifyLastHashDateFunction
 * type for verifying if a date conditions rehash.
 */
export type TVerifyLastHashDateFunction = (input: {
  lastHashDate: string;
  rehashAfterDays: number;
}) => boolean;
