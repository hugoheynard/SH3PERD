import { PasswordService } from './PasswordService.js';
import { createHasherRegistry } from './hasherRegistry/createHasherRegistry.js';

// @sh3pherd/password-manager

/**
 * Preconfigured PasswordManager instance using Argon2id v1.
 * Can be imported directly from the package entry point.
 *
 * @example
 * import { passwordManager } from '@sh3pherd/password-manager';
 */
export const passwordManager = new PasswordService({
  currentStrategyKey: 'argon2id:v1',
  registry: createHasherRegistry(),
  rehashAfterDays: 30,
});
